import { CONSTANTS } from '../constants';
import { CyclePhase, FaultClass } from '../types';

/**
 * Baghewala Heavy Oil Reservoir & SRP Physics Engine
 */

export const PhysicsEngine = {
  /**
   * Section 23: Thermal Model
   * T(t) = T_base + (T_peak - T_base) * e^(-t / tau)
   */
  calculateReservoirTemp(
    phase: CyclePhase,
    cycleDay: number,
    tPeak: number = CONSTANTS.T_PEAK,
    tBase: number = CONSTANTS.T_BASE,
    tauDays: number = CONSTANTS.TAU_DAYS
  ): number {
    if (phase === 'INJECTION') {
      // Temperature ramps up during steam injection
      const progress = Math.min(1.0, cycleDay / 7.0);
      return tBase + (tPeak - tBase) * (0.3 + 0.7 * progress);
    }
    if (phase === 'SOAK') {
      // Temperature stays near peak with slight thermal equilibration
      return tPeak - cycleDay * 0.4;
    }
    // PRODUCTION: Gradual cooling following exponential decline
    const coolingDays = Math.max(0, cycleDay);
    const temp = tBase + (tPeak - tBase) * Math.exp(-coolingDays / tauDays);
    return Math.round(temp * 10) / 10;
  },

  /**
   * Section 24: Viscosity Model
   * Heavy crude 17-19° API.
   * Calibrated targets:
   * 48°C -> ~11,500 - 12,500 cP
   * 62°C -> ~5,000 cP
   */
  calculateViscosity(tempC: number): number {
    // Calibrated directly against Baghewala heavy crude data:
    // 48°C -> 12,000 cP
    // 62°C -> ~5,000 cP
    const k = Math.log(12000 / 5000) / (62.0 - 48.0); // ~0.06253
    const visc = 12000 * Math.exp(-k * (tempC - 48.0));
    return Math.round(Math.max(1500, Math.min(16000, visc)));
  },

  /**
   * Section 25: SRP / Rod Floating Risk
   * Higher viscosity + higher SPM -> Higher rod floating risk (0 to 1)
   */
  calculateRodFloatingRisk(viscosityCp: number, spm: number, fault: FaultClass | null): number {
    if (spm <= 0) return 0.02;
    if (fault === 'ROD_FLOATING') return 0.88;
    if (fault === 'PARTED_ROD') return 0.05;

    // Logistic sigmoid combination
    const z = (viscosityCp - 8000) / 2200 + (spm - 5.2) / 1.5;
    const sigmoid = 1 / (1 + Math.exp(-z));
    return Math.round(Math.max(0.02, Math.min(0.98, sigmoid)) * 100) / 100;
  },

  /**
   * Section 26: Pump Fillage (25% to 100%)
   * Declines as viscosity or SPM rises
   */
  calculatePumpFillage(viscosityCp: number, spm: number, fault: FaultClass | null): number {
    if (spm <= 0) return 0;
    if (fault === 'PARTED_ROD') return 0;
    if (fault === 'FLUID_POUND') return 42.0;
    if (fault === 'GAS_INTERFERENCE') return 52.0;

    let fillage = 92 - (viscosityCp - 5000) / 380 - (spm - 4.5) * 3.2;
    if (fault === 'ROD_FLOATING') {
      fillage -= 16;
    }
    return Math.round(Math.max(25, Math.min(100, fillage)) * 10) / 10;
  },

  /**
   * Section 27: Motor Load (20% to 99%)
   * Responds to viscosity, SPM, and stroke length
   */
  calculateMotorLoad(viscosityCp: number, spm: number, strokeLengthM: number = 3.05, fault: FaultClass | null = null): number {
    if (spm <= 0) return 0;
    if (fault === 'PARTED_ROD') return 24.5; // Very low load when rod parts

    const viscComponent = (viscosityCp / 1000) * 2.6;
    const spmComponent = (spm - 2.0) * 6.2;
    const strokeComponent = (strokeLengthM - 2.5) * 8.0;

    let load = 38 + viscComponent + spmComponent + strokeComponent;
    if (fault === 'ROD_FLOATING') {
      load += 8; // Extra power consumed fighting viscous downstroke drag
    }
    return Math.round(Math.max(20, Math.min(99, load)) * 10) / 10;
  },

  /**
   * Section 28: Production (40 to 120 BOPD)
   * Scaled by temperature, viscosity, pump fillage, water cut, and SPM
   */
  calculateProduction(
    _tempC: number,
    viscosityCp: number,
    spm: number,
    pumpFillagePct: number,
    waterCutPct: number = 42,
    fault: FaultClass | null = null
  ): number {
    if (spm <= 0 || fault === 'PARTED_ROD') return 0;

    const basePot = 88.0;
    const spmFactor = spm / 5.5;
    const fillageFactor = pumpFillagePct / 80.0;
    const thermalFactor = Math.pow(6500 / viscosityCp, 0.32);
    const waterCutFactor = (100 - waterCutPct) / 58.0;

    let prod = basePot * spmFactor * fillageFactor * thermalFactor * waterCutFactor;
    if (fault === 'FLUID_POUND') prod *= 0.72;
    if (fault === 'GAS_INTERFERENCE') prod *= 0.65;
    if (fault === 'UNSEATED_PUMP') prod *= 0.35;

    return Math.round(Math.max(12, Math.min(125, prod)) * 10) / 10;
  },

  /**
   * Section 29: Pump Efficiency (25% to 95%)
   */
  calculatePumpEfficiency(viscosityCp: number, spm: number, fillagePct: number): number {
    if (spm <= 0) return 0;
    const viscPenalty = Math.max(0, (viscosityCp - 6000) / 500);
    const spmPenalty = Math.max(0, (spm - 6.0) * 4);
    const eff = fillagePct * 0.94 - viscPenalty - spmPenalty;
    return Math.round(Math.max(25, Math.min(95, eff)));
  },

  /**
   * Section 30: Anomaly Score (0 to 1) - Simulated Isolation Forest
   */
  calculateAnomalyScore(
    _viscosityCp: number,
    motorLoadPct: number,
    pumpFillagePct: number,
    rodFloatingRisk: number,
    fault: FaultClass | null
  ): number {
    if (fault && fault !== 'NORMAL') return 0.88;

    let score = 0.08;
    if (motorLoadPct > CONSTANTS.MOTOR_LOAD_WARN_PCT) {
      score += (motorLoadPct - CONSTANTS.MOTOR_LOAD_WARN_PCT) * 0.03;
    }
    if (pumpFillagePct < CONSTANTS.FILLAGE_WARN_PCT) {
      score += (CONSTANTS.FILLAGE_WARN_PCT - pumpFillagePct) * 0.02;
    }
    score += rodFloatingRisk * 0.45;

    return Math.round(Math.max(0.04, Math.min(0.96, score)) * 100) / 100;
  },

  /**
   * Section 31: Simulated MTBF (Days)
   */
  calculateMTBF(rodFloatingRisk: number, motorLoadPct: number): number {
    let penalty = 0;
    if (rodFloatingRisk > 0.6) {
      penalty += (rodFloatingRisk - 0.6) * 120;
    }
    if (motorLoadPct > 85) {
      penalty += (motorLoadPct - 85) * 4;
    }
    return Math.round(Math.max(30, CONSTANTS.BASELINE_MTBF_DAYS - penalty));
  },

  /**
   * Section 35: Safety Interlock Rate Limiter
   * Maximum allowed delta: ±0.5 SPM per minute (0.00833 SPM/sec)
   */
  applySPMRateLimiter(currentSPM: number, targetSPM: number, elapsedSec: number): number {
    const maxChange = (CONSTANTS.MAX_SPM_RATE_PER_MIN / 60.0) * elapsedSec;
    const diff = targetSPM - currentSPM;

    if (Math.abs(diff) <= maxChange) {
      return Math.max(CONSTANTS.MIN_SPM, Math.min(CONSTANTS.MAX_SPM, targetSPM));
    }
    const step = Math.sign(diff) * maxChange;
    const newSPM = currentSPM + step;
    return Math.round(Math.max(CONSTANTS.MIN_SPM, Math.min(CONSTANTS.MAX_SPM, newSPM)) * 100) / 100;
  },
};
