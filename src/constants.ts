export const APP_NAME = 'BAGHTWIN';
export const APP_SUBTITLE = 'Well-to-Surface AI Digital Twin';
export const ORG_NAME = 'Oil India Limited';
export const FIELD_NAME = 'Baghewala Field, Rajasthan';
export const PROBLEM_STATEMENT = 'SIH 2026 — PS 26120 (Smart Automation)';

export const DEFAULT_WELL_ID = 'BGW-WELL-034';
export const TOTAL_WELLS = 56;
export const ACTIVE_PRODUCING_WELLS = 34;

// Physics and Operational Constants
export const CONSTANTS = {
  DEPTH_M: 1150,
  API_GRAVITY: 18.2, // ~17-19 API
  T_BASE: 46.0,      // Cold reservoir baseline ~46°C
  T_PEAK: 68.0,      // Peak post-steam temperature ~60-72°C
  TAU_DAYS: 9.0,     // Thermal decline decay constant

  // Viscosity targets (cP)
  VISCOSITY_COLD: 12000, // at ~46-48°C
  VISCOSITY_HOT: 5000,   // at ~62°C

  // Safety Envelope
  MIN_SPM: 2.0,
  MAX_SPM: 8.0,
  MAX_SPM_RATE_PER_MIN: 0.5, // 0.5 SPM / 60s ≈ 0.00833 SPM/s
  MOTOR_LOAD_WARN_PCT: 85,
  MOTOR_LOAD_CRIT_PCT: 95,
  ROD_FLOATING_WARN: 0.60,
  ROD_FLOATING_CRIT: 0.85,
  FILLAGE_WARN_PCT: 70,

  // Baseline MTBF
  BASELINE_MTBF_DAYS: 180,
};

export const TOOLTIPS = {
  CSS: 'Cyclic Steam Stimulation: Thermal recovery process with alternating cycles of high-pressure steam injection, soak period, and heavy oil production.',
  SRP: 'Sucker Rod Pump: Reciprocating artificial lift system consisting of surface beam unit, polished rod, sucker rod string, and downhole pump.',
  SPM: 'Strokes Per Minute: Operating frequency of the sucker rod pump reciprocating cycle.',
  VFD: 'Variable Frequency Drive: Inverter system controlling motor RPM and SRP operating speed dynamically.',
  SOR: 'Steam-Oil Ratio: Metric tons/m³ of steam required per barrel or m³ of oil produced. Lower values signify higher thermal recovery efficiency.',
  BOPD: 'Barrels of Oil Per Day: Standard petroleum rate unit for volumetric crude production.',
  Dynacard: 'Dynamometer Card: Closed-loop plot of polished rod load versus stroke position used to diagnose pump fillage, gas lock, fluid pound, and rod float.',
  MTBF: 'Mean Time Between Failures: Expected operational days before downhole or surface mechanical failure requires a workover.',
  PumpFillage: 'Percentage of the downhole pump working barrel filled with fluid during the upstroke cycle.',
  RodFloating: 'Viscous retardation of the rod string during downstroke in heavy oil, causing compressive rod buckling, delayed seating, and severe mechanical impact.',
  Gibbs: 'Simulated 1D damped-wave equation reconstruction converting surface dynacard measurements into downhole pump card behavior.',
};
