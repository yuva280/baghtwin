import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  RefreshCw, 
  Shield, 
  FastForward, 
  CheckCircle2, 
  Database,
  Sliders
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { useWellStore } from '../store/wellStore';
import { useAlertStore } from '../store/alertStore';

export const Settings: React.FC = () => {
  const { 
    operatingMode, 
    setOperatingMode, 
    safeEnvelopeActive, 
    setSafeEnvelope,
    simSpeed,
    setSimSpeed,
    resetSimulation,
    isProjectorMode,
    toggleProjectorMode
  } = useSimulationStore();

  const { selectWell } = useWellStore();
  const { clearAll } = useAlertStore();

  const [unitSystem, setUnitSystem] = useState<'OILFIELD' | 'METRIC_SI'>('OILFIELD');
  const [resetNotice, setResetNotice] = useState<string | null>(null);

  const speedOptions = [1, 60, 600, 3600];

  const handleFullReset = () => {
    resetSimulation();
    clearAll();
    selectWell('BGW-WELL-034');
    setResetNotice('✓ Simulation reset to baseline state (T+00:00:00, BGW-WELL-034 selected, alerts cleared).');
    setTimeout(() => {
      setResetNotice(null);
    }, 4000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-8">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-5 h-5 text-status-cyan" />
          <h1 className="text-lg font-bold tracking-wide text-text-primary">
            Digital Twin Simulation & Platform Settings
          </h1>
        </div>
        <span className="text-xs font-mono text-status-cyan bg-bg-panel px-2.5 py-1 rounded border border-border">
          LOCAL CONFIGURATION ACTIVE
        </span>
      </div>

      {/* Reset Confirmation Toast */}
      {resetNotice && (
        <div className="p-3 rounded bg-status-healthy/15 border border-status-healthy text-status-healthy text-xs font-mono flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{resetNotice}</span>
        </div>
      )}

      {/* 2. Simulation Speed & Clock Acceleration (Section 20) */}
      <div className="panel-scada p-4 rounded space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase text-status-cyan flex items-center space-x-1.5">
            <FastForward className="w-4 h-4" />
            <span>Simulation Clock Speed Multiplier</span>
          </h2>
          <span className="text-[10px] font-mono text-text-muted">ACTIVE: ×{simSpeed}</span>
        </div>
        <p className="text-[11px] font-mono text-text-secondary">
          Controls simulated passage of time per real-time second. At ×3600, long-term reservoir cooling decay becomes visible in seconds for hackathon judging demonstration.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`p-2.5 rounded border text-xs font-mono font-bold transition-all ${
                simSpeed === spd
                  ? 'bg-status-cyan/20 border-status-cyan text-status-cyan shadow'
                  : 'bg-bg-inset border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              ×{spd} {spd === 1 ? '(Real-Time)' : spd === 60 ? '(1 min / s)' : spd === 600 ? '(10 min / s)' : '(1 hour / s)'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Control Room Operating Mode (Section 33 & 61) */}
      <div className="panel-scada p-4 rounded space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-status-cyan flex items-center space-x-1.5">
          <Sliders className="w-4 h-4" />
          <span>Control Room Operating Governance Mode</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['ADVISORY', 'SUPERVISED', 'SIMULATION'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setOperatingMode(mode)}
              className={`p-3 rounded border text-left transition-all ${
                operatingMode === mode
                  ? 'border-status-cyan bg-status-cyan/10 text-status-cyan shadow'
                  : 'border-border bg-bg-inset text-text-secondary hover:border-border-highlight'
              }`}
            >
              <div className="font-mono font-bold text-xs">{mode}</div>
              <div className="text-[11px] text-text-muted mt-1 leading-relaxed">
                {mode === 'ADVISORY' && 'AI recommends setpoints; human operator explicitly accepts or dismisses.'}
                {mode === 'SUPERVISED' && 'AI applies gradual safety changes automatically with operator override notification.'}
                {mode === 'SIMULATION' && 'Unconstrained sandbox mode for scenario testing and hackathon demonstration.'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Safety Interlocks & Hard Bounds (Section 35 & 36) */}
      <div className="panel-scada p-4 rounded space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-status-cyan flex items-center space-x-1.5">
          <Shield className="w-4 h-4" />
          <span>Mechanical Safety Interlocks & Envelope</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-bg-inset rounded border border-border">
          <div>
            <div className="text-xs font-bold text-text-primary">Hard-Coded Mechanical Rate Limiter</div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Strictly restricts SPM rate of change to maximum ±0.5 SPM/min and clamps speeds within [2.0, 8.0] SPM.
            </div>
          </div>
          <button
            onClick={() => setSafeEnvelope(!safeEnvelopeActive)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors shrink-0 ${
              safeEnvelopeActive
                ? 'bg-status-healthy/20 border-status-healthy text-status-healthy'
                : 'bg-status-critical/20 border-status-critical text-status-critical animate-pulse'
            }`}
          >
            {safeEnvelopeActive ? 'ENFORCED (SAFE)' : 'BYPASSED (TESTING ONLY)'}
          </button>
        </div>
      </div>

      {/* 5. Units System Preference */}
      <div className="panel-scada p-4 rounded space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-status-cyan flex items-center space-x-1.5">
          <Database className="w-4 h-4" />
          <span>Petroleum Engineering Unit System</span>
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setUnitSystem('OILFIELD')}
            className={`p-3 rounded border text-left font-mono text-xs transition-all ${
              unitSystem === 'OILFIELD'
                ? 'border-status-cyan bg-status-cyan/10 text-status-cyan font-bold'
                : 'border-border bg-bg-inset text-text-secondary'
            }`}
          >
            <div>Oilfield Standard (Recommended)</div>
            <div className="text-[10px] text-text-muted mt-1">BOPD, bar, °C, cP, m³, SPM, kN</div>
          </button>
          <button
            onClick={() => setUnitSystem('METRIC_SI')}
            className={`p-3 rounded border text-left font-mono text-xs transition-all ${
              unitSystem === 'METRIC_SI'
                ? 'border-status-cyan bg-status-cyan/10 text-status-cyan font-bold'
                : 'border-border bg-bg-inset text-text-secondary'
            }`}
          >
            <div>Metric SI Equivalents</div>
            <div className="text-[10px] text-text-muted mt-1">m³/d, kPa, °C, Pa·s, m³, Hz, kN</div>
          </button>
        </div>
      </div>

      {/* 6. Hackathon Stage Projector Mode */}
      <div className="panel-scada p-4 rounded space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase text-status-cyan flex items-center space-x-1.5">
          <SettingsIcon className="w-4 h-4" />
          <span>Hackathon Presentation Display & High-Contrast Mode</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-bg-inset rounded border border-border">
          <div>
            <div className="text-xs font-bold text-text-primary">Stage Projector High-Contrast Mode</div>
            <div className="text-[11px] text-text-secondary mt-0.5">
              Enhances SCADA dark-mode borders, text contrast, and glow elements for visibility on large auditorium projection screens.
            </div>
          </div>
          <button
            onClick={toggleProjectorMode}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors shrink-0 ${
              isProjectorMode
                ? 'bg-status-cyan/20 border-status-cyan text-status-cyan shadow'
                : 'border-border text-text-secondary hover:text-text-primary bg-bg-panel'
            }`}
          >
            {isProjectorMode ? 'PROJECTOR MODE: ACTIVE' : 'STANDARD DARK SCADA'}
          </button>
        </div>
      </div>

      {/* 7. Reset Simulation to Baseline */}
      <div className="panel-scada p-4 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-status-warning/40">
        <div>
          <div className="text-xs font-bold text-text-primary">Reset Simulation State</div>
          <div className="text-[11px] text-text-secondary mt-0.5">
            Clears injected faults, resets simulation clock to T+00:00:00, reselects default well BGW-WELL-034, and restores initial nominal setpoints.
          </div>
        </div>
        <button
          onClick={handleFullReset}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded bg-bg-inset border border-status-warning text-status-warning hover:bg-status-warning/15 text-xs font-mono font-bold shrink-0 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>RESET TO BASELINE</span>
        </button>
      </div>
    </div>
  );
};
