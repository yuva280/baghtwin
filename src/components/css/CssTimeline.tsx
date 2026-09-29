import React from 'react';
import { Flame, Thermometer, ArrowRight } from 'lucide-react';
import { Well } from '../../types';

interface CssTimelineProps {
  well: Well;
}

export const CssTimeline: React.FC<CssTimelineProps> = ({ well }) => {
  const phases = [
    {
      id: 'INJECTION',
      label: '1. STEAM INJECTION',
      duration: '7 Days',
      status: well.cyclePhase === 'INJECTION' ? 'ACTIVE' : 'COMPLETED',
      tempRange: '46°C → 68°C',
      desc: `${well.steamInjectedM3.toLocaleString()} m³ steam at ${well.injectionPressureBar} bar`,
      color: 'text-status-warning',
      border: 'border-status-warning',
      bg: 'bg-status-warning/10',
    },
    {
      id: 'SOAK',
      label: '2. THERMAL SOAK',
      duration: `${well.soakDays} Days`,
      status:
        well.cyclePhase === 'SOAK'
          ? 'ACTIVE'
          : well.cyclePhase === 'PRODUCTION'
          ? 'COMPLETED'
          : 'UPCOMING',
      tempRange: '68°C Equilibration',
      desc: `Heat chamber diffusion to ${well.heatRadiusM}m radius`,
      color: 'text-status-violet',
      border: 'border-status-violet',
      bg: 'bg-status-violet/10',
    },
    {
      id: 'PRODUCTION',
      label: '3. HEAVY OIL PRODUCTION',
      duration: '35–45 Days',
      status: well.cyclePhase === 'PRODUCTION' ? 'ACTIVE' : 'UPCOMING',
      tempRange: `${well.reservoirTempC.toFixed(1)}°C (Cooling to 46°C)`,
      desc: `SRP Artificial Lift at ${well.spm.toFixed(1)} SPM • ${well.oilProductionBpd.toFixed(1)} BOPD`,
      color: 'text-status-healthy',
      border: 'border-status-healthy',
      bg: 'bg-status-healthy/10',
    },
  ];

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-status-warning" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            CSS Cycle Sequence & Lifecycle Timeline — CSS-2026-034
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-text-muted">CURRENT PHASE:</span>
          <span className="px-2 py-0.5 rounded bg-status-healthy/15 border border-status-healthy text-status-healthy font-bold">
            {well.cyclePhase} (DAY {well.cycleDay.toFixed(1)})
          </span>
        </div>
      </div>

      {/* 3-Stage Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {phases.map((p, idx) => {
          const isCurrent = p.status === 'ACTIVE';

          return (
            <div
              key={p.id}
              className={`p-3 rounded border flex flex-col justify-between space-y-2 relative transition-all ${
                isCurrent
                  ? `${p.bg} ${p.border} shadow-md`
                  : 'bg-bg-inset border-border opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={`font-bold ${p.color}`}>{p.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      p.status === 'ACTIVE'
                        ? 'bg-status-cyan text-bg font-bold animate-pulse'
                        : p.status === 'COMPLETED'
                        ? 'text-status-healthy bg-status-healthy/10'
                        : 'text-text-muted bg-bg-panel'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-text-primary font-semibold flex items-center space-x-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-text-muted" />
                  <span>{p.tempRange}</span>
                </div>
                <p className="text-[10px] font-mono text-text-secondary mt-1 leading-normal">
                  {p.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-border/50 text-[10px] font-mono text-text-muted">
                <span>Duration: {p.duration}</span>
                {idx < phases.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-bg-panel rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cycle Progress Tracker */}
      <div className="bg-bg-inset p-2.5 rounded border border-border space-y-1.5 text-xs font-mono">
        <div className="flex items-center justify-between text-[10px] text-text-muted">
          <span>CYCLE PROGRESS (DAY {well.cycleDay.toFixed(1)} OF 45 ESTIMATED)</span>
          <span className="text-status-cyan font-bold">
            {Math.round((well.cycleDay / 45) * 100)}% COMPLETE
          </span>
        </div>
        <div className="w-full h-2 bg-bg-panel rounded-full overflow-hidden border border-border/60">
          <div
            className="h-full bg-gradient-to-r from-status-warning via-status-violet to-status-healthy transition-all duration-300"
            style={{ width: `${Math.min(100, (well.cycleDay / 45) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-secondary pt-0.5">
          <span>Injection (Days 1–7)</span>
          <span>Soak (Days 8–12)</span>
          <span className="text-status-healthy font-semibold">Active Production (Days 13–45)</span>
        </div>
      </div>
    </div>
  );
};
