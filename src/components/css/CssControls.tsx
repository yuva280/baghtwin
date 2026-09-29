import React, { useState } from 'react';
import { Sliders, Sparkles, Check, RefreshCw } from 'lucide-react';

interface CssControlsProps {
  steamVolume: number;
  setSteamVolume: (val: number) => void;
  injectionPressure: number;
  setInjectionPressure: (val: number) => void;
  soakDays: number;
  setSoakDays: (val: number) => void;
  viscosityCutoff: number;
  setViscosityCutoff: (val: number) => void;
  isOptimizing: boolean;
  onRunOptimization: () => void;
}

export const CssControls: React.FC<CssControlsProps> = ({
  steamVolume,
  setSteamVolume,
  injectionPressure,
  setInjectionPressure,
  soakDays,
  setSoakDays,
  viscosityCutoff,
  setViscosityCutoff,
  isOptimizing,
  onRunOptimization,
}) => {
  const [optProgress, setOptProgress] = useState<number>(0);

  const presets = [
    { label: 'Lean Steam Saving', steam: 1100, pressure: 80, soak: 3.5, desc: 'Minimizes fuel usage & steam cost' },
    { label: 'Balanced Pareto Optimal', steam: 1450, pressure: 85, soak: 4.5, desc: 'Recommended trade-off: SOR 3.10' },
    { label: 'Aggressive Thermal Peak', steam: 1800, pressure: 95, soak: 6.0, desc: 'Maximizes ultimate crude volume' },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setSteamVolume(p.steam);
    setInjectionPressure(p.pressure);
    setSoakDays(p.soak);
  };

  const handleTriggerOptimization = () => {
    setOptProgress(0);
    const interval = setInterval(() => {
      setOptProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 200);

    onRunOptimization();
  };

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            CSS Cycle Operating Parameters & Input Tuning
          </h2>
        </div>
        <span className="text-[10px] font-mono text-status-cyan bg-bg-inset px-2 py-0.5 rounded border border-border">
          CYCLE DESIGNER
        </span>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-bg-inset p-3 rounded border border-border">
        {/* Steam Volume */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Target Steam Volume:</span>
            <span className="text-status-warning font-bold">{steamVolume.toLocaleString()} m³</span>
          </div>
          <input
            type="range"
            min={600}
            max={2000}
            step={50}
            value={steamVolume}
            onChange={(e) => setSteamVolume(parseInt(e.target.value))}
            className="w-full accent-status-warning cursor-pointer bg-bg-panel h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>600 m³</span>
            <span className="text-status-warning font-bold">1,450 m³ (RECOMMENDED)</span>
            <span>2,000 m³</span>
          </div>
        </div>

        {/* Injection Pressure */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Injection Pressure:</span>
            <span className="text-status-cyan font-bold">{injectionPressure} bar</span>
          </div>
          <input
            type="range"
            min={60}
            max={110}
            step={2}
            value={injectionPressure}
            onChange={(e) => setInjectionPressure(parseInt(e.target.value))}
            className="w-full accent-status-cyan cursor-pointer bg-bg-panel h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>60 bar</span>
            <span className="text-status-cyan font-bold">85 bar (HYDROSTATIC)</span>
            <span>110 bar</span>
          </div>
        </div>

        {/* Soak Duration */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Soak Period:</span>
            <span className="text-status-violet font-bold">{soakDays.toFixed(1)} Days</span>
          </div>
          <input
            type="range"
            min={2.0}
            max={7.0}
            step={0.5}
            value={soakDays}
            onChange={(e) => setSoakDays(parseFloat(e.target.value))}
            className="w-full accent-status-violet cursor-pointer bg-bg-panel h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>2.0 Days</span>
            <span className="text-status-violet font-bold">4.5–5.0 Days (DIFFUSION OPTIMAL)</span>
            <span>7.0 Days</span>
          </div>
        </div>

        {/* Viscosity Economic Cutoff */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Economic Viscosity Cutoff:</span>
            <span className="text-status-healthy font-bold">{viscosityCutoff.toLocaleString()} cP</span>
          </div>
          <input
            type="range"
            min={8000}
            max={14000}
            step={250}
            value={viscosityCutoff}
            onChange={(e) => setViscosityCutoff(parseInt(e.target.value))}
            className="w-full accent-status-healthy cursor-pointer bg-bg-panel h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>8,000 cP</span>
            <span className="text-status-healthy font-bold">11,500 cP (LIFT LIMIT)</span>
            <span>14,000 cP</span>
          </div>
        </div>
      </div>

      {/* Preset Strategy Buttons */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-text-muted">
          STRATEGIC CSS CYCLING PROFILES:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {presets.map((p) => {
            const isSelected = steamVolume === p.steam && injectionPressure === p.pressure;
            return (
              <button
                key={p.label}
                onClick={() => handleApplyPreset(p)}
                className={`p-2 rounded border text-left font-mono transition-all ${
                  isSelected
                    ? 'bg-status-cyan/15 border-status-cyan text-status-cyan font-bold shadow'
                    : 'bg-bg-inset border-border text-text-secondary hover:border-border-highlight hover:text-text-primary'
                }`}
              >
                <div className="text-xs flex items-center justify-between">
                  <span>{p.label}</span>
                  {isSelected && <Check className="w-3 h-3 text-status-cyan" />}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">{p.steam} m³ • {p.soak}d • {p.pressure} bar</div>
                <div className="text-[9px] text-text-secondary mt-0.5">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trigger NSGA-II Button */}
      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[11px] font-mono text-text-muted">
          {isOptimizing ? (
            <span className="text-status-cyan flex items-center space-x-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating NSGA-II Genetic Generations (50/50, 100 individuals)... {optProgress}%</span>
            </span>
          ) : (
            <span>Non-dominated Sorting Genetic Algorithm II solves for Max Oil vs Min Steam.</span>
          )}
        </div>

        <button
          onClick={handleTriggerOptimization}
          disabled={isOptimizing}
          className="flex items-center space-x-2 px-4 py-2 rounded bg-gradient-to-r from-status-blue to-status-violet text-white font-mono font-bold text-xs shadow hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isOptimizing ? 'SOLVING PARETO FRONT...' : 'OPTIMIZE CSS (NSGA-II)'}</span>
        </button>
      </div>
    </div>
  );
};
