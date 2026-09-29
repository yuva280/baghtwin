import { 
  Well, 
  DynacardData, 
  FaultClass 
} from '../types';
import { DynacardEngine } from '../sim/dynocard';
import { generateSeedWells } from '../sim/seedData';

export interface CSSOptimizationCandidate {
  id: string;
  steamVolumeM3: number;
  injectionPressureBar: number;
  soakDays: number;
  estimatedOilBbl: number;
  estimatedSOR: number;
  paretoRank: number;
  isRecommended: boolean;
}

export interface EquipmentHealthData {
  component: string;
  healthPct: number;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
  estimatedRulDays: number;
  lastInspection: string;
  primaryRisk: string;
}

/**
 * Service Access Layer: Interfaces UI components with Digital Twin state.
 * Structured to be easily swapped with real FastAPI / SCADA endpoints in future.
 */
export const mockService = {
  getSeedWells(): Well[] {
    return generateSeedWells();
  },

  getWellState(wellId: string, wells: Well[]): Well | undefined {
    return wells.find((w) => w.id === wellId);
  },

  getDynacard(fault: FaultClass, viscCp: number = 7420, spm: number = 5.8): DynacardData {
    return DynacardEngine.getDynacardData(fault, viscCp, spm);
  },

  getCSSOptimization(_wellId: string): CSSOptimizationCandidate[] {
    return [
      {
        id: 'OPT-1',
        steamVolumeM3: 1100,
        injectionPressureBar: 80,
        soakDays: 3.5,
        estimatedOilBbl: 2850,
        estimatedSOR: 3.85,
        paretoRank: 2,
        isRecommended: false,
      },
      {
        id: 'OPT-2',
        steamVolumeM3: 1450,
        injectionPressureBar: 85,
        soakDays: 4.5,
        estimatedOilBbl: 4680,
        estimatedSOR: 3.10, // Optimal trade-off candidate
        paretoRank: 1,
        isRecommended: true,
      },
      {
        id: 'OPT-3',
        steamVolumeM3: 1800,
        injectionPressureBar: 95,
        soakDays: 6.0,
        estimatedOilBbl: 5400,
        estimatedSOR: 3.33,
        paretoRank: 1,
        isRecommended: false,
      },
      {
        id: 'OPT-4',
        steamVolumeM3: 2000,
        injectionPressureBar: 105,
        soakDays: 7.0,
        estimatedOilBbl: 5720,
        estimatedSOR: 3.50,
        paretoRank: 3,
        isRecommended: false,
      },
    ];
  },

  getMaintenanceData(_wellId: string): EquipmentHealthData[] {
    return [
      {
        component: 'Sucker Rod String (API Grade D)',
        healthPct: 78,
        status: 'GOOD',
        estimatedRulDays: 142,
        lastInspection: '2026-08-14',
        primaryRisk: 'Compressive downstroke buckling during cold cycles',
      },
      {
        component: 'Downhole Plunger Pump (2.25")',
        healthPct: 84,
        status: 'EXCELLENT',
        estimatedRulDays: 210,
        lastInspection: '2026-07-22',
        primaryRisk: 'Abrasive fines & sand scoring',
      },
      {
        component: 'Surface Beam Unit & Gearbox',
        healthPct: 71,
        status: 'WARNING',
        estimatedRulDays: 95,
        lastInspection: '2026-09-01',
        primaryRisk: 'Peak gearbox torque overload when viscosity > 10,000 cP',
      },
      {
        component: 'Vacuum Insulated Tubing (VIT)',
        healthPct: 92,
        status: 'EXCELLENT',
        estimatedRulDays: 365,
        lastInspection: '2026-06-10',
        primaryRisk: 'Annular vacuum loss during steam injection',
      },
    ];
  },
};
