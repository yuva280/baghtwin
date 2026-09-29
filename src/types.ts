export type CyclePhase = 'INJECTION' | 'SOAK' | 'PRODUCTION';
export type WellStatus = 'PRODUCING' | 'STEAMING' | 'SOAKING' | 'ALARM' | 'MAINTENANCE' | 'INACTIVE';
export type FaultClass = 
  | 'NORMAL' 
  | 'ROD_FLOATING' 
  | 'FLUID_POUND' 
  | 'GAS_INTERFERENCE' 
  | 'TUBING_MOVEMENT' 
  | 'UNSEATED_PUMP' 
  | 'PARTED_ROD';

export type OperatingMode = 'ADVISORY' | 'SUPERVISED' | 'SIMULATION';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'TRIGGERED' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface DynacardPoint {
  position: number; // 0 to 1
  load: number;     // in kN
}

export interface DynacardData {
  surfaceCard: DynacardPoint[];
  downholeCard: DynacardPoint[];
  faultClass: FaultClass;
  confidence: number;
  inferenceTimeMs: number;
  timestamp: string;
}

export interface Well {
  id: string;
  name: string;
  status: WellStatus;
  cyclePhase: CyclePhase;
  cycleDay: number;
  depthM: number;
  apiGravity: number;
  reservoirTempC: number;
  bottomholeTempC: number;
  viscosityCp: number;
  oilProductionBpd: number;
  steamInjectedM3: number;
  injectionPressureBar: number;
  soakDays: number;
  sor: number;
  spm: number;
  strokeLengthM: number;
  vfdHz: number;
  motorLoadPct: number;
  motorTorque: number;
  polishedRodLoadKn: number;
  casingPressureBar: number;
  tubingPressureBar: number;
  steamFlow: number;
  steamPressure: number;
  waterCutPct: number;
  pumpFillagePct: number;
  pumpIntakePressureBar: number;
  rodFloatingRisk: number; // 0 to 1
  anomalyScore: number;    // 0 to 1
  faultClass: FaultClass;
  heatRadiusM: number;
  pumpEfficiencyPct: number;
  predictedProductionBpd: number;
  mtbfDays: number;
}

export interface TelemetrySnapshot {
  timestamp: string;
  reservoirTempC: number;
  viscosityCp: number;
  oilProductionBpd: number;
  motorLoadPct: number;
  spm: number;
  pumpFillagePct: number;
  rodFloatingRisk: number;
  anomalyScore: number;
}

export interface Alert {
  id: string;
  wellId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  metric: string;
  currentValue: number;
  thresholdValue: number;
  timestamp: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface AIRecommendation {
  id: string;
  wellId: string;
  title: string;
  description: string;
  trigger: string;
  recommendedAction: string;
  currentValue: number;
  recommendedValue: number;
  variable: string;
  confidence: number;
  timestamp: string;
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED';
  appliedBy?: 'TWIN' | 'OPERATOR';
}

export interface SrpAuditEntry {
  id: string;
  timestamp: string;
  parameter: string;
  oldValue: number;
  newValue: number;
  unit: string;
  trigger: string;
  appliedBy: 'TWIN' | 'OPERATOR';
  status: 'APPLIED' | 'ACTIVE' | 'DISMISSED';
}

export interface DemoStep {
  stepIndex: number;
  title: string;
  narrative: string;
  targetRoute?: string;
  wellId?: string;
  actionSummary: string;
}

export interface SimulationState {
  timeSeconds: number;
  simSpeed: number; // 1, 60, 600, 3600
  isPaused: boolean;
  operatingMode: OperatingMode;
  safeEnvelopeActive: boolean;
  activeFault: FaultClass | null;
  selectedWellId: string;
  isSyncingWell: boolean;
}
