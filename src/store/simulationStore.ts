import { create } from 'zustand';
import { OperatingMode, FaultClass, SrpAuditEntry } from '../types';
import { simulatorInstance } from '../sim/simulator';

interface SimulationStoreState {
  timeSeconds: number;
  simSpeed: number; // 1, 60, 600, 3600
  isPaused: boolean;
  operatingMode: OperatingMode;
  safeEnvelopeActive: boolean;
  activeFault: FaultClass | null;
  lastTickTime: number;
  targetSPM: number;
  auditLog: SrpAuditEntry[];

  isProjectorMode: boolean;
  setTimeSeconds: (time: number) => void;
  setSimSpeed: (speed: number) => void;
  togglePause: () => void;
  toggleProjectorMode: () => void;
  setOperatingMode: (mode: OperatingMode) => void;
  setActiveFault: (fault: FaultClass | null) => void;
  setSafeEnvelope: (active: boolean) => void;
  setTargetSPM: (spm: number, trigger?: string, appliedBy?: 'TWIN' | 'OPERATOR') => void;
  addAuditEntry: (entry: SrpAuditEntry) => void;
  tick: (deltaSeconds: number) => void;
  resetSimulation: () => void;
}

const initialAuditEntries: SrpAuditEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '14:15:00',
    parameter: 'SPM Setpoint',
    oldValue: 6.2,
    newValue: 5.8,
    unit: 'SPM',
    trigger: 'Viscosity reached 7,200 cP during Day 14 decline',
    appliedBy: 'TWIN',
    status: 'APPLIED',
  },
  {
    id: 'AUD-002',
    timestamp: '13:40:00',
    parameter: 'VFD Frequency',
    oldValue: 51.6,
    newValue: 48.3,
    unit: 'Hz',
    trigger: 'Automated speed trim under advisory acceptance',
    appliedBy: 'OPERATOR',
    status: 'APPLIED',
  },
];

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  timeSeconds: 0,
  simSpeed: 1,
  isPaused: false,
  operatingMode: 'ADVISORY',
  safeEnvelopeActive: true,
  activeFault: null,
  lastTickTime: Date.now(),
  targetSPM: 5.8,
  auditLog: initialAuditEntries,

  isProjectorMode: false,
  setTimeSeconds: (timeSeconds) => set({ timeSeconds }),
  setSimSpeed: (simSpeed) => set({ simSpeed }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleProjectorMode: () => set((state) => ({ isProjectorMode: !state.isProjectorMode })),
  setOperatingMode: (operatingMode) => set({ operatingMode }),
  setActiveFault: (activeFault) => set({ activeFault }),
  setSafeEnvelope: (safeEnvelopeActive) => set({ safeEnvelopeActive }),

  setTargetSPM: (spm, trigger = 'Operator manual input', appliedBy = 'OPERATOR') => {
    const oldSPM = get().targetSPM;
    simulatorInstance.setTargetSPM(spm);
    const newEntry: SrpAuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      parameter: 'SPM Setpoint',
      oldValue: oldSPM,
      newValue: spm,
      unit: 'SPM',
      trigger,
      appliedBy,
      status: 'APPLIED',
    };
    set((state) => ({
      targetSPM: spm,
      auditLog: [newEntry, ...state.auditLog].slice(0, 30),
    }));
  },

  addAuditEntry: (entry) =>
    set((state) => ({
      auditLog: [entry, ...state.auditLog].slice(0, 30),
    })),

  tick: (deltaSeconds) =>
    set((state) => ({
      timeSeconds: state.timeSeconds + deltaSeconds * state.simSpeed,
      lastTickTime: Date.now(),
    })),

  resetSimulation: () => {
    simulatorInstance.setTargetSPM(5.8);
    set({
      timeSeconds: 0,
      simSpeed: 1,
      isPaused: false,
      operatingMode: 'ADVISORY',
      safeEnvelopeActive: true,
      activeFault: null,
      lastTickTime: Date.now(),
      targetSPM: 5.8,
      auditLog: initialAuditEntries,
    });
  },
}));
