import React from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown,
  Activity,
  Cpu,
  Tv
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { useWellStore } from '../../store/wellStore';
import { useAlertStore } from '../../store/alertStore';
import { useDemoStore } from '../../store/demoStore';
import { OperatingMode } from '../../types';

export const TopBar: React.FC = () => {
  const { 
    simSpeed, 
    isPaused, 
    setSimSpeed, 
    togglePause, 
    operatingMode, 
    setOperatingMode, 
    safeEnvelopeActive,
    timeSeconds,
    isProjectorMode,
    toggleProjectorMode
  } = useSimulationStore();
  
  const { currentWell, wells, selectWell, isSyncing } = useWellStore();
  const { alerts } = useAlertStore();
  const { startDemo } = useDemoStore();

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'TRIGGERED').length;

  // Format simulated runtime
  const hours = Math.floor(timeSeconds / 3600);
  const minutes = Math.floor((timeSeconds % 3600) / 60);
  const seconds = Math.floor(timeSeconds % 60);
  const timeFormatted = `T+${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const speedOptions = [1, 60, 600, 3600];

  return (
    <header className="h-14 bg-bg-panel border-b border-border flex items-center justify-between px-3 text-xs select-none z-30 sticky top-0">
      {/* Left: Well selector & CSS Phase */}
      <div className="flex items-center space-x-3">
        {/* Well Selector */}
        <div className="relative flex items-center bg-bg-inset border border-border rounded px-2.5 py-1">
          <Activity className="w-3.5 h-3.5 text-status-cyan mr-1.5 animate-pulse" />
          <span className="text-text-secondary text-[11px] uppercase mr-1">WELL:</span>
          <select 
            className="bg-transparent font-mono font-semibold text-text-primary focus:outline-none cursor-pointer pr-4 text-xs appearance-none"
            value={currentWell?.id || 'BGW-WELL-034'}
            onChange={(e) => selectWell(e.target.value)}
          >
            {wells.map(w => (
              <option key={w.id} value={w.id} className="bg-bg-panel text-text-primary">
                {w.id} — {w.status}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-text-secondary absolute right-1.5 pointer-events-none" />
        </div>

        {/* Syncing indicator */}
        {isSyncing && (
          <span className="flex items-center text-status-cyan font-mono text-[11px] animate-pulse">
            <Cpu className="w-3.5 h-3.5 mr-1" />
            SYNCING TWIN...
          </span>
        )}

        {/* CSS Cycle Tag */}
        {currentWell && (
          <div className="flex items-center space-x-1.5 border border-border px-2 py-1 rounded bg-bg-inset text-[11px]">
            <span className="text-text-secondary">CSS PHASE:</span>
            <span className={`font-mono font-bold ${
              currentWell.cyclePhase === 'INJECTION' ? 'text-status-warning' :
              currentWell.cyclePhase === 'SOAK' ? 'text-status-violet' : 'text-status-healthy'
            }`}>
              {currentWell.cyclePhase}
            </span>
            <span className="text-border-highlight">|</span>
            <span className="text-text-secondary">DAY:</span>
            <span className="font-mono text-text-primary font-bold">{currentWell.cycleDay}</span>
          </div>
        )}
      </div>

      {/* Middle: Simulation Clock & Speed Controls */}
      <div className="flex items-center space-x-2 bg-bg-inset border border-border px-2 py-0.5 rounded">
        <span className="text-text-secondary text-[11px]">SIM TIME:</span>
        <span className="font-mono text-status-cyan font-bold w-18 text-center">{timeFormatted}</span>

        <button 
          onClick={togglePause}
          className={`p-1 rounded transition-colors ${isPaused ? 'bg-status-warning/20 text-status-warning' : 'hover:bg-border text-text-primary'}`}
          title={isPaused ? "Resume Simulation" : "Pause Simulation"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
        </button>

        <div className="h-3 w-[1px] bg-border-highlight mx-1" />

        <div className="flex items-center space-x-0.5">
          <FastForward className="w-3 h-3 text-text-secondary mr-1" />
          {speedOptions.map(spd => (
            <button
              key={spd}
              onClick={() => setSimSpeed(spd)}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                simSpeed === spd 
                  ? 'bg-status-cyan/20 text-status-cyan border border-status-cyan/40 font-bold' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              ×{spd}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Badges, Controls, Demo button */}
      <div className="flex items-center space-x-2.5">
        {/* Operating Mode Selector */}
        <div className="flex items-center border border-border rounded bg-bg-inset p-0.5">
          {(['ADVISORY', 'SUPERVISED', 'SIMULATION'] as OperatingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setOperatingMode(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                operatingMode === mode
                  ? mode === 'ADVISORY' 
                    ? 'bg-status-cyan/20 text-status-cyan border border-status-cyan/50' 
                    : mode === 'SUPERVISED' 
                      ? 'bg-status-violet/20 text-status-violet border border-status-violet/50'
                      : 'bg-status-warning/20 text-status-warning border border-status-warning/50'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Safety Envelope Badge */}
        <div 
          className={`flex items-center px-2 py-1 rounded text-[11px] font-mono border ${
            safeEnvelopeActive 
              ? 'bg-status-healthy/10 border-status-healthy/40 text-status-healthy' 
              : 'bg-status-critical/10 border-status-critical/40 text-status-critical'
          }`}
          title="Automatic interlocks: Max ±0.5 SPM/min, Motor Load Limit, Rod Float Protection"
        >
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span className="hidden xl:inline">SAFE OPERATING ENVELOPE</span>
          <span className="xl:hidden">SAFE ENV</span>
        </div>

        {/* Persistent Simulated Telemetry Badge */}
        <div className="flex items-center px-2 py-1 rounded text-[10px] font-mono border border-border bg-bg-inset text-status-warning">
          <span className="w-1.5 h-1.5 rounded-full bg-status-warning mr-1.5 animate-pulse" />
          SIMULATED TELEMETRY
        </div>

        {/* Alarm Count */}
        <div 
          className={`flex items-center px-2 py-1 rounded text-[11px] font-mono border ${
            activeAlertsCount > 0 
              ? 'bg-status-warning/15 border-status-warning/50 text-status-warning animate-pulse' 
              : 'border-border text-text-secondary bg-bg-inset'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          <span>{activeAlertsCount}</span>
        </div>

        {/* Projector Mode Toggle */}
        <button
          onClick={toggleProjectorMode}
          className={`flex items-center px-2 py-1 rounded text-xs font-mono font-semibold border transition-all ${
            isProjectorMode 
              ? 'bg-status-cyan/20 border-status-cyan text-status-cyan shadow' 
              : 'border-border text-text-secondary hover:text-text-primary bg-bg-inset'
          }`}
          title="Toggle high-contrast projector display mode for hackathon presentation"
        >
          <Tv className="w-3.5 h-3.5 mr-1" />
          <span className="hidden lg:inline">{isProjectorMode ? 'PROJECTOR ON' : 'PROJECTOR'}</span>
        </button>

        {/* Run Demo Button */}
        <button
          onClick={startDemo}
          className="flex items-center bg-gradient-to-r from-status-blue to-status-violet text-white px-2.5 py-1 rounded font-semibold text-xs shadow hover:brightness-110 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          RUN DEMO
        </button>
      </div>
    </header>
  );
};
