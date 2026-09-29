import { Well, FaultClass, Alert, AIRecommendation, TelemetrySnapshot, OperatingMode } from '../types';
import { PhysicsEngine } from './physics';
import { CONSTANTS } from '../constants';

export interface SimulationStepResult {
  updatedWell: Well;
  newAlerts: Alert[];
  resolvedAlertIds: string[];
  recommendation: AIRecommendation | null;
  telemetrySnapshot: TelemetrySnapshot;
}

export class DigitalTwinSimulator {
  private targetSPM: number = 5.8;
  private consecutiveHighRiskTicks: number = 0;
  private activeAlertKeys: Set<string> = new Set();
  private recommendationGenerated: boolean = false;

  public setTargetSPM(spm: number) {
    this.targetSPM = Math.max(CONSTANTS.MIN_SPM, Math.min(CONSTANTS.MAX_SPM, spm));
  }

  public getTargetSPM(): number {
    return this.targetSPM;
  }

  /**
   * Main step function driven by central simulation clock
   */
  public step(
    currentWell: Well,
    elapsedSec: number,
    simSpeed: number,
    operatingMode: OperatingMode,
    safeEnvelopeActive: boolean,
    activeFault: FaultClass | null
  ): SimulationStepResult {
    // 1. Calculate effective simulated passage of time
    const simulatedDeltaSec = elapsedSec * simSpeed;
    const simulatedDeltaDays = simulatedDeltaSec / 86400.0;

    // Advance cycle day smoothly if producing
    let newCycleDay = currentWell.cycleDay;
    if (currentWell.cyclePhase === 'PRODUCTION') {
      newCycleDay = Math.min(45, currentWell.cycleDay + simulatedDeltaDays);
    }

    // 2. Physics: Reservoir Temperature & Viscosity
    const tempC = PhysicsEngine.calculateReservoirTemp(currentWell.cyclePhase, newCycleDay);
    const viscCp = PhysicsEngine.calculateViscosity(tempC);

    // 3. SRP Controller: Apply SPM rate limiter (Max ±0.5 SPM/min)
    let newSPM = currentWell.spm;
    if (currentWell.cyclePhase === 'PRODUCTION') {
      if (safeEnvelopeActive) {
        newSPM = PhysicsEngine.applySPMRateLimiter(currentWell.spm, this.targetSPM, simulatedDeltaSec);
      } else {
        newSPM = this.targetSPM;
      }
    }

    // 4. Physical Responses
    const fault = activeFault || currentWell.faultClass;
    const fillage = PhysicsEngine.calculatePumpFillage(viscCp, newSPM, fault);
    const motorLoad = PhysicsEngine.calculateMotorLoad(viscCp, newSPM, currentWell.strokeLengthM, fault);
    const risk = PhysicsEngine.calculateRodFloatingRisk(viscCp, newSPM, fault);
    const prodBopd = PhysicsEngine.calculateProduction(tempC, viscCp, newSPM, fillage, currentWell.waterCutPct, fault);
    const effPct = PhysicsEngine.calculatePumpEfficiency(viscCp, newSPM, fillage);
    const anomaly = PhysicsEngine.calculateAnomalyScore(viscCp, motorLoad, fillage, risk, fault);
    const mtbf = PhysicsEngine.calculateMTBF(risk, motorLoad);

    // Dynamic polished rod load and VFD Hz
    const rodLoadKn = Math.round((70 + motorLoad * 0.45 + (viscCp / 1000) * 1.2) * 10) / 10;
    const vfdHz = Math.round((newSPM / 6.0) * 50.0 * 10) / 10;
    const motorTorque = Math.round(motorLoad * 5.4);

    // Cumulative SOR update
    const sor = Math.round((currentWell.steamInjectedM3 / Math.max(10, prodBopd * 6.29)) * 100) / 100;

    const updatedWell: Well = {
      ...currentWell,
      cycleDay: Math.round(newCycleDay * 100) / 100,
      reservoirTempC: tempC,
      bottomholeTempC: Math.round((tempC + 1.8) * 10) / 10,
      viscosityCp: viscCp,
      spm: newSPM,
      vfdHz,
      motorLoadPct: motorLoad,
      motorTorque,
      polishedRodLoadKn: rodLoadKn,
      pumpFillagePct: fillage,
      pumpEfficiencyPct: effPct,
      oilProductionBpd: prodBopd,
      rodFloatingRisk: risk,
      anomalyScore: anomaly,
      faultClass: fault,
      mtbfDays: mtbf,
      sor,
    };

    // 5. Deduplicated Alert System (Section 43 & 44)
    const newAlerts: Alert[] = [];
    const resolvedAlertIds: string[] = [];
    const timestamp = new Date().toLocaleTimeString();

    // Rod Floating Alert
    if (risk >= CONSTANTS.ROD_FLOATING_CRIT) {
      if (!this.activeAlertKeys.has('CRIT_ROD_FLOAT')) {
        this.activeAlertKeys.add('CRIT_ROD_FLOAT');
        newAlerts.push({
          id: `ALT-${Date.now()}-1`,
          wellId: currentWell.id,
          severity: 'CRITICAL',
          status: 'ACTIVE',
          title: 'Critical Rod Floating Condition',
          message: `Rod floating risk reached ${(risk * 100).toFixed(0)}%. Compressive buckling hazard detected. Immediate SPM reduction required.`,
          metric: 'rodFloatingRisk',
          currentValue: risk,
          thresholdValue: CONSTANTS.ROD_FLOATING_CRIT,
          timestamp,
        });
      }
    } else if (risk >= CONSTANTS.ROD_FLOATING_WARN) {
      if (!this.activeAlertKeys.has('WARN_ROD_FLOAT')) {
        this.activeAlertKeys.add('WARN_ROD_FLOAT');
        newAlerts.push({
          id: `ALT-${Date.now()}-2`,
          wellId: currentWell.id,
          severity: 'WARNING',
          status: 'ACTIVE',
          title: 'Elevated Rod Floating Risk',
          message: `Downstroke viscous drag elevated. Risk at ${(risk * 100).toFixed(0)}% (threshold 60%).`,
          metric: 'rodFloatingRisk',
          currentValue: risk,
          thresholdValue: CONSTANTS.ROD_FLOATING_WARN,
          timestamp,
        });
      }
    } else {
      if (this.activeAlertKeys.has('CRIT_ROD_FLOAT') || this.activeAlertKeys.has('WARN_ROD_FLOAT')) {
        this.activeAlertKeys.delete('CRIT_ROD_FLOAT');
        this.activeAlertKeys.delete('WARN_ROD_FLOAT');
        resolvedAlertIds.push('ALT-ROD-FLOAT');
      }
    }

    // Motor Load Alert
    if (motorLoad >= CONSTANTS.MOTOR_LOAD_CRIT_PCT) {
      if (!this.activeAlertKeys.has('CRIT_MOTOR_LOAD')) {
        this.activeAlertKeys.add('CRIT_MOTOR_LOAD');
        newAlerts.push({
          id: `ALT-${Date.now()}-3`,
          wellId: currentWell.id,
          severity: 'CRITICAL',
          status: 'ACTIVE',
          title: 'Motor Thermal Overload Imminent',
          message: `Surface beam motor load at ${motorLoad}%. Permissible continuous limit exceeded.`,
          metric: 'motorLoadPct',
          currentValue: motorLoad,
          thresholdValue: CONSTANTS.MOTOR_LOAD_CRIT_PCT,
          timestamp,
        });
      }
    } else if (motorLoad >= CONSTANTS.MOTOR_LOAD_WARN_PCT) {
      if (!this.activeAlertKeys.has('WARN_MOTOR_LOAD')) {
        this.activeAlertKeys.add('WARN_MOTOR_LOAD');
        newAlerts.push({
          id: `ALT-${Date.now()}-4`,
          wellId: currentWell.id,
          severity: 'WARNING',
          status: 'ACTIVE',
          title: 'Motor Load Warning',
          message: `Pumping unit motor load is at ${motorLoad}%.`,
          metric: 'motorLoadPct',
          currentValue: motorLoad,
          thresholdValue: CONSTANTS.MOTOR_LOAD_WARN_PCT,
          timestamp,
        });
      }
    } else {
      this.activeAlertKeys.delete('CRIT_MOTOR_LOAD');
      this.activeAlertKeys.delete('WARN_MOTOR_LOAD');
    }

    // Parted Rod Alert (Emergency)
    if (fault === 'PARTED_ROD') {
      if (!this.activeAlertKeys.has('PARTED_ROD')) {
        this.activeAlertKeys.add('PARTED_ROD');
        newAlerts.push({
          id: `ALT-${Date.now()}-5`,
          wellId: currentWell.id,
          severity: 'CRITICAL',
          status: 'ACTIVE',
          title: 'Sucker Rod String Parted',
          message: 'Rod parted — simulated workover recommendation; automatic pump shutdown.',
          metric: 'polishedRodLoadKn',
          currentValue: rodLoadKn,
          thresholdValue: 40.0,
          timestamp,
        });
      }
    }

    // 6. AI Recommendation Logic (Section 34 & 83)
    let recommendation: AIRecommendation | null = null;
    if (risk > 0.55) {
      this.consecutiveHighRiskTicks++;
      if (this.consecutiveHighRiskTicks >= 3 && !this.recommendationGenerated) {
        this.recommendationGenerated = true;
        const recommendedSPM = Math.max(3.6, Math.round((newSPM - 1.4) * 10) / 10);
        recommendation = {
          id: `REC-${Date.now()}`,
          wellId: currentWell.id,
          title: 'Controlled SPM Downward Optimization',
          description: `Reservoir cooling has escalated viscosity to ${viscCp} cP. Downstroke drag is creating rod floating risk (${(risk * 100).toFixed(0)}%). Reducing SPM to ${recommendedSPM} restores full fillage and protects rod string from compressive buckling.`,
          trigger: 'Reservoir Cooling → Viscosity Escalation → Rod Float Risk > 55%',
          recommendedAction: `Gradually step down SPM from ${newSPM.toFixed(1)} to ${recommendedSPM.toFixed(1)} (Max rate: ±0.5/min)`,
          currentValue: newSPM,
          recommendedValue: recommendedSPM,
          variable: 'SPM',
          confidence: 0.92,
          timestamp,
          status: 'PENDING',
        };

        // If in SUPERVISED mode, automatically set target SPM
        if (operatingMode === 'SUPERVISED') {
          this.setTargetSPM(recommendedSPM);
          recommendation.status = 'ACCEPTED';
          recommendation.appliedBy = 'TWIN';
        }
      }
    } else {
      this.consecutiveHighRiskTicks = 0;
      if (risk < 0.45) {
        this.recommendationGenerated = false;
      }
    }

    // 7. Telemetry Snapshot for charts
    const telemetrySnapshot: TelemetrySnapshot = {
      timestamp,
      reservoirTempC: tempC,
      viscosityCp: viscCp,
      oilProductionBpd: prodBopd,
      motorLoadPct: motorLoad,
      spm: newSPM,
      pumpFillagePct: fillage,
      rodFloatingRisk: risk,
      anomalyScore: anomaly,
    };

    return {
      updatedWell,
      newAlerts,
      resolvedAlertIds,
      recommendation,
      telemetrySnapshot,
    };
  }
}

export const simulatorInstance = new DigitalTwinSimulator();
