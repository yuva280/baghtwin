import { Well, WellStatus, CyclePhase } from '../types';
import { CONSTANTS, DEFAULT_WELL_ID } from '../constants';

/**
 * Seed data for 56 wells of Baghewala field:
 * - 34 PRODUCING
 * - 4 STEAMING
 * - 6 SOAKING
 * - 3 ALARM
 * - 5 MAINTENANCE
 * - 4 INACTIVE
 * Total = 56 wells
 */

const statusDistribution: { status: WellStatus; phase: CyclePhase; count: number }[] = [
  { status: 'PRODUCING', phase: 'PRODUCTION', count: 34 },
  { status: 'STEAMING', phase: 'INJECTION', count: 4 },
  { status: 'SOAKING', phase: 'SOAK', count: 6 },
  { status: 'ALARM', phase: 'PRODUCTION', count: 3 },
  { status: 'MAINTENANCE', phase: 'PRODUCTION', count: 5 },
  { status: 'INACTIVE', phase: 'PRODUCTION', count: 4 },
];

export function generateSeedWells(): Well[] {
  const wells: Well[] = [];
  let wellNumber = 1;

  for (const group of statusDistribution) {
    for (let i = 0; i < group.count; i++) {
      const id = `BGW-WELL-${String(wellNumber).padStart(3, '0')}`;
      let cycleDay = 10;
      let tempC = 56.0;
      let viscCp = 7500;
      let bopd = 75.0;
      let spm = 5.6;
      let motorLoad = 72.0;
      let fillage = 82.0;
      let risk = 0.35;
      let anomaly = 0.12;
      let sor = 3.35;
      let steamInj = 1400;

      if (group.status === 'PRODUCING') {
        cycleDay = 5 + (wellNumber % 24);
        // Temperature cools as cycleDay progresses
        tempC = Math.max(CONSTANTS.T_BASE + 2, CONSTANTS.T_PEAK - (cycleDay * 0.75));
        viscCp = Math.round(CONSTANTS.VISCOSITY_COLD * Math.exp(-0.063 * (tempC - CONSTANTS.T_BASE)));
        spm = 4.8 + ((wellNumber % 5) * 0.3);
        bopd = Math.round((95 - cycleDay * 1.5) * 10) / 10;
        motorLoad = Math.round((60 + (viscCp / 400) + spm * 2) * 10) / 10;
        fillage = Math.max(60, Math.round((92 - (viscCp / 500)) * 10) / 10);
        risk = Math.min(0.65, Math.round((viscCp / 16000 + (spm / 10) * 0.4) * 100) / 100);
        anomaly = Math.round(risk * 0.4 * 100) / 100;
        sor = Math.round((3.1 + (cycleDay * 0.03)) * 100) / 100;
        steamInj = 1450;
      } else if (group.status === 'STEAMING') {
        cycleDay = 2 + (wellNumber % 5);
        tempC = 68.0 + (wellNumber % 4);
        viscCp = 4400;
        bopd = 0;
        spm = 0;
        motorLoad = 0;
        fillage = 0;
        risk = 0.05;
        anomaly = 0.08;
        sor = 0;
        steamInj = 600 + cycleDay * 180;
      } else if (group.status === 'SOAKING') {
        cycleDay = 1 + (wellNumber % 4);
        tempC = 65.0 - (cycleDay * 0.5);
        viscCp = 4900;
        bopd = 0;
        spm = 0;
        motorLoad = 0;
        fillage = 0;
        risk = 0.05;
        anomaly = 0.05;
        sor = 0;
        steamInj = 1500;
      } else if (group.status === 'ALARM') {
        cycleDay = 24 + (wellNumber % 6);
        tempC = 47.8;
        viscCp = 11800; // Cold & extremely viscous
        bopd = 38.4;
        spm = 6.4;
        motorLoad = 92.4; // Exceeds warning
        fillage = 58.0;
        risk = 0.84; // High rod floating risk
        anomaly = 0.78;
        sor = 4.2;
        steamInj = 1400;
      } else if (group.status === 'MAINTENANCE') {
        cycleDay = 1;
        tempC = 50.0;
        viscCp = 9800;
        bopd = 0;
        spm = 0;
        motorLoad = 0;
        fillage = 0;
        risk = 0.1;
        anomaly = 0.45;
        sor = 3.6;
        steamInj = 1300;
      } else if (group.status === 'INACTIVE') {
        cycleDay = 0;
        tempC = CONSTANTS.T_BASE;
        viscCp = CONSTANTS.VISCOSITY_COLD;
        bopd = 0;
        spm = 0;
        motorLoad = 0;
        fillage = 0;
        risk = 0;
        anomaly = 0;
        sor = 0;
        steamInj = 0;
      }

      // Explicit calibration for hero default well BGW-WELL-034
      if (id === DEFAULT_WELL_ID) {
        wells.push({
          id: DEFAULT_WELL_ID,
          name: 'Baghewala #34 (Thermal Heavy Oil Asset)',
          status: 'PRODUCING',
          cyclePhase: 'PRODUCTION',
          cycleDay: 14,
          depthM: CONSTANTS.DEPTH_M,
          apiGravity: CONSTANTS.API_GRAVITY,
          reservoirTempC: 56.4,
          bottomholeTempC: 58.2,
          viscosityCp: 7420,
          oilProductionBpd: 78.5,
          steamInjectedM3: 1450,
          injectionPressureBar: 85.0,
          soakDays: 5,
          sor: 3.42,
          spm: 5.8,
          strokeLengthM: 3.05,
          vfdHz: 48.3,
          motorLoadPct: 76.5,
          motorTorque: 418,
          polishedRodLoadKn: 104.5,
          casingPressureBar: 4.8,
          tubingPressureBar: 18.2,
          steamFlow: 0,
          steamPressure: 0,
          waterCutPct: 42.0,
          pumpFillagePct: 82.5,
          pumpIntakePressureBar: 32.4,
          rodFloatingRisk: 0.38,
          anomalyScore: 0.14,
          faultClass: 'NORMAL',
          heatRadiusM: 34.2,
          pumpEfficiencyPct: 79.4,
          predictedProductionBpd: 76.8,
          mtbfDays: 174,
        });
      } else {
        wells.push({
          id,
          name: `Baghewala #${String(wellNumber).padStart(2, '0')}`,
          status: group.status,
          cyclePhase: group.phase,
          cycleDay,
          depthM: CONSTANTS.DEPTH_M,
          apiGravity: CONSTANTS.API_GRAVITY,
          reservoirTempC: Math.round(tempC * 10) / 10,
          bottomholeTempC: Math.round((tempC + 1.8) * 10) / 10,
          viscosityCp: Math.round(viscCp),
          oilProductionBpd: bopd,
          steamInjectedM3: steamInj,
          injectionPressureBar: 85.0,
          soakDays: 5,
          sor,
          spm,
          strokeLengthM: 3.05,
          vfdHz: Math.round(spm * 8.3 * 10) / 10,
          motorLoadPct: motorLoad,
          motorTorque: Math.round(motorLoad * 5.2),
          polishedRodLoadKn: Math.round((85 + motorLoad * 0.3) * 10) / 10,
          casingPressureBar: 4.8,
          tubingPressureBar: 18.2,
          steamFlow: group.status === 'STEAMING' ? 45 : 0,
          steamPressure: group.status === 'STEAMING' ? 85 : 0,
          waterCutPct: 42.0,
          pumpFillagePct: fillage,
          pumpIntakePressureBar: 32.4,
          rodFloatingRisk: risk,
          anomalyScore: anomaly,
          faultClass: group.status === 'ALARM' ? 'ROD_FLOATING' : 'NORMAL',
          heatRadiusM: Math.round((20 + (tempC - CONSTANTS.T_BASE) * 0.9) * 10) / 10,
          pumpEfficiencyPct: Math.round(Math.max(30, fillage * 0.95)),
          predictedProductionBpd: Math.round(bopd * 0.98 * 10) / 10,
          mtbfDays: Math.round(CONSTANTS.BASELINE_MTBF_DAYS - risk * 50),
        });
      }
      wellNumber++;
    }
  }

  return wells;
}
