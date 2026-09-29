import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { useWellStore } from '../store/wellStore';
import { useAlertStore } from '../store/alertStore';
import { simulatorInstance } from '../sim/simulator';

export function useSimulationLoop() {
  const { 
    isPaused, 
    simSpeed, 
    operatingMode, 
    safeEnvelopeActive, 
    activeFault,
    tick 
  } = useSimulationStore();

  const { currentWell, updateCurrentWell, addTelemetrySnapshot } = useWellStore();
  const { addAlert, addRecommendation } = useAlertStore();

  const currentWellRef = useRef(currentWell);
  currentWellRef.current = currentWell;

  const simStateRef = useRef({ isPaused, simSpeed, operatingMode, safeEnvelopeActive, activeFault });
  simStateRef.current = { isPaused, simSpeed, operatingMode, safeEnvelopeActive, activeFault };

  useEffect(() => {
    const timer = setInterval(() => {
      const state = simStateRef.current;
      if (state.isPaused || !currentWellRef.current) return;

      // 1. Advance simulation clock
      tick(1);

      // 2. Execute one physics simulation step
      const result = simulatorInstance.step(
        currentWellRef.current,
        1.0,
        state.simSpeed,
        state.operatingMode,
        state.safeEnvelopeActive,
        state.activeFault
      );

      // 3. Update global well state and chart history
      updateCurrentWell(result.updatedWell);
      addTelemetrySnapshot(result.telemetrySnapshot);

      // 4. Dispatch alerts
      if (result.newAlerts.length > 0) {
        result.newAlerts.forEach((alert) => addAlert(alert));
      }

      // 5. Dispatch explainable AI recommendation
      if (result.recommendation) {
        addRecommendation(result.recommendation);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tick, updateCurrentWell, addTelemetrySnapshot, addAlert, addRecommendation]);
}
