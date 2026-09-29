import { create } from 'zustand';
import { Alert, AIRecommendation } from '../types';

interface AlertStoreState {
  alerts: Alert[];
  recommendations: AIRecommendation[];
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  addRecommendation: (rec: AIRecommendation) => void;
  updateRecommendationStatus: (id: string, status: 'ACCEPTED' | 'DISMISSED', appliedBy?: 'TWIN' | 'OPERATOR') => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertStoreState>((set) => ({
  alerts: [
    {
      id: 'ALT-101',
      wellId: 'BGW-WELL-034',
      severity: 'WARNING',
      status: 'ACTIVE',
      title: 'Viscosity Trend Approaching Limit',
      message: 'Reservoir cooling cycle at Day 14. Viscosity 7,420 cP (threshold: 9,000 cP).',
      metric: 'viscosityCp',
      currentValue: 7420,
      thresholdValue: 9000,
      timestamp: '14:28:10',
    },
  ],
  recommendations: [
    {
      id: 'REC-001',
      wellId: 'BGW-WELL-034',
      title: 'Proactive SPM Downward Trim',
      description: 'Reservoir temperature declining towards 55°C. Reducing SPM by 0.5 will prevent downstroke floating and keep motor load under 80%.',
      trigger: 'Reservoir cooling + viscosity increase',
      recommendedAction: 'Trim SPM from 5.8 to 5.3',
      currentValue: 5.8,
      recommendedValue: 5.3,
      variable: 'SPM',
      confidence: 0.88,
      timestamp: '14:28:15',
      status: 'PENDING',
    },
  ],

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((a) => a.id !== alert.id)].slice(0, 50),
    })),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toLocaleTimeString() } : a
      ),
    })),

  resolveAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toLocaleTimeString() } : a
      ),
    })),

  addRecommendation: (rec) =>
    set((state) => ({
      recommendations: [rec, ...state.recommendations.filter((r) => r.id !== rec.id)],
    })),

  updateRecommendationStatus: (id, status, appliedBy) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) =>
        r.id === id ? { ...r, status, appliedBy } : r
      ),
    })),

  clearAll: () => set({ alerts: [], recommendations: [] }),
}));
