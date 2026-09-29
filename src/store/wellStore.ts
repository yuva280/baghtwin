import { create } from 'zustand';
import { Well, TelemetrySnapshot } from '../types';
import { DEFAULT_WELL_ID } from '../constants';
import { generateSeedWells } from '../sim/seedData';

interface WellStoreState {
  selectedWellId: string;
  isSyncing: boolean;
  wells: Well[];
  currentWell: Well;
  telemetryHistory: TelemetrySnapshot[];
  selectWell: (wellId: string) => void;
  updateCurrentWell: (partial: Partial<Well>) => void;
  setWells: (wells: Well[]) => void;
  addTelemetrySnapshot: (snapshot: TelemetrySnapshot) => void;
}

const initialSeedWells = generateSeedWells();
const defaultWell = initialSeedWells.find((w) => w.id === DEFAULT_WELL_ID) || initialSeedWells[0];

// Seed initial 20 historical points for the sparklines and charts
const initialHistory: TelemetrySnapshot[] = Array.from({ length: 20 }).map((_, idx) => {
  const t = 20 - idx;
  const temp = defaultWell.reservoirTempC + t * 0.15;
  const visc = defaultWell.viscosityCp - t * 40;
  return {
    timestamp: `-${t * 2}m`,
    reservoirTempC: Math.round(temp * 10) / 10,
    viscosityCp: Math.round(visc),
    oilProductionBpd: Math.round((defaultWell.oilProductionBpd + (t % 3) * 0.8) * 10) / 10,
    motorLoadPct: Math.round((defaultWell.motorLoadPct - (t % 4) * 0.5) * 10) / 10,
    spm: defaultWell.spm,
    pumpFillagePct: Math.round((defaultWell.pumpFillagePct + (t % 3)) * 10) / 10,
    rodFloatingRisk: defaultWell.rodFloatingRisk,
    anomalyScore: defaultWell.anomalyScore,
  };
});

export const useWellStore = create<WellStoreState>((set, get) => ({
  selectedWellId: DEFAULT_WELL_ID,
  isSyncing: false,
  wells: initialSeedWells,
  currentWell: defaultWell,
  telemetryHistory: initialHistory,

  selectWell: (wellId: string) => {
    if (wellId === get().selectedWellId) return;
    set({ isSyncing: true, selectedWellId: wellId });
    setTimeout(() => {
      const well = get().wells.find((w) => w.id === wellId) || defaultWell;
      set({ currentWell: well, isSyncing: false });
    }, 350);
  },

  updateCurrentWell: (partial: Partial<Well>) => {
    const current = get().currentWell;
    if (!current) return;
    const updated = { ...current, ...partial };
    set({
      currentWell: updated,
      wells: get().wells.map((w) => (w.id === updated.id ? updated : w)),
    });
  },

  setWells: (wells: Well[]) => set({ wells }),

  addTelemetrySnapshot: (snapshot: TelemetrySnapshot) => {
    set((state) => ({
      telemetryHistory: [...state.telemetryHistory.slice(-40), snapshot],
    }));
  },
}));
