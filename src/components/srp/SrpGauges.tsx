import React from 'react';
import { Gauge, ShieldAlert, Cpu, Zap, Activity } from 'lucide-react';
import { Well } from '../../types';

interface SrpGaugesProps {
  well: Well;
}

export const SrpGauges: React.FC<SrpGaugesProps> = ({ well }) => {
  // Motor load color coding
  const motorColor =
    well.motorLoadPct >= 95
      ? 'text-status-critical'
      : well.motorLoadPct >= 85
      ? 'text-status-warning'
      : 'text-status-healthy';

  const motorBg =
    well.motorLoadPct >= 95
      ? 'bg-status-critical'
      : well.motorLoadPct >= 85
      ? 'bg-status-warning'
      : 'bg-status-healthy';

  // Fillage color coding
  const fillageColor =
    well.pumpFillagePct < 60
      ? 'text-status-critical'
      : well.pumpFillagePct < 75
      ? 'text-status-warning'
      : 'text-status-healthy';

  const fillageBg =
    well.pumpFillagePct < 60
      ? 'bg-status-critical'
      : well.pumpFillagePct < 75
      ? 'bg-status-warning'
      : 'bg-status-healthy';

  // Rod floating risk color coding
  const riskColor =
    well.rodFloatingRisk >= 0.85
      ? 'text-status-critical'
      : well.rodFloatingRisk >= 0.6
      ? 'text-status-warning'
      : 'text-status-healthy';

  const riskBg =
    well.rodFloatingRisk >= 0.85
      ? 'bg-status-critical'
      : well.rodFloatingRisk >= 0.6
      ? 'bg-status-warning'
      : 'bg-status-healthy';

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            SRP Mechanical Telemetry & Operational Instruments
          </h2>
        </div>
        <span className="text-[10px] font-mono text-text-muted">60 FPS SCADA BUS</span>
      </div>

      {/* 3 Main Industrial Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1. Motor Load */}
        <div className="bg-bg-inset p-3 rounded border border-border flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">Prime Mover Motor Load</span>
            <Zap className={`w-3.5 h-3.5 ${motorColor}`} />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-mono font-bold ${motorColor}`}>
              {well.motorLoadPct.toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-text-secondary">
              {well.motorLoadPct >= 85 ? 'WARN THRESHOLD' : 'NOMINAL'}
            </span>
          </div>

          {/* Progress Bar with Limit Markers */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-bg-panel rounded-full overflow-hidden relative border border-border/60">
              <div
                className={`h-full transition-all duration-300 ${motorBg}`}
                style={{ width: `${Math.min(100, well.motorLoadPct)}%` }}
              />
              {/* 85% Warning Marker */}
              <div className="absolute top-0 bottom-0 left-[85%] w-[2px] bg-status-warning z-10" />
              {/* 95% Trip Marker */}
              <div className="absolute top-0 bottom-0 left-[95%] w-[2px] bg-status-critical z-10" />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-text-muted">
              <span>0%</span>
              <span className="text-status-warning">85% WARN</span>
              <span className="text-status-critical">95% TRIP</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* 2. Pump Fillage */}
        <div className="bg-bg-inset p-3 rounded border border-border flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">Downhole Pump Fillage</span>
            <Activity className={`w-3.5 h-3.5 ${fillageColor}`} />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-mono font-bold ${fillageColor}`}>
              {well.pumpFillagePct.toFixed(0)}%
            </span>
            <span className="text-[10px] font-mono text-text-secondary">
              {well.pumpFillagePct < 70 ? 'INCOMPLETE FILL' : 'FULL BARREL'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-2 bg-bg-panel rounded-full overflow-hidden relative border border-border/60">
              <div
                className={`h-full transition-all duration-300 ${fillageBg}`}
                style={{ width: `${Math.min(100, well.pumpFillagePct)}%` }}
              />
              {/* 70% Alert Marker */}
              <div className="absolute top-0 bottom-0 left-[70%] w-[2px] bg-status-warning z-10" />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-text-muted">
              <span>0%</span>
              <span className="text-status-warning">&lt;70% FLUID POUND</span>
              <span className="text-status-healthy">100% FULL</span>
            </div>
          </div>
        </div>

        {/* 3. Rod Floating Risk */}
        <div className="bg-bg-inset p-3 rounded border border-border flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-text-muted">Rod Floating Hazard Index</span>
            <ShieldAlert className={`w-3.5 h-3.5 ${riskColor}`} />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-mono font-bold ${riskColor}`}>
              {(well.rodFloatingRisk * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] font-mono text-text-secondary">
              {well.rodFloatingRisk > 0.6 ? 'DOWNSTROKE DRAG' : 'STABLE SINK'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full h-2 bg-bg-panel rounded-full overflow-hidden relative border border-border/60">
              <div
                className={`h-full transition-all duration-300 ${riskBg}`}
                style={{ width: `${Math.min(100, well.rodFloatingRisk * 100)}%` }}
              />
              <div className="absolute top-0 bottom-0 left-[60%] w-[2px] bg-status-warning z-10" />
              <div className="absolute top-0 bottom-0 left-[85%] w-[2px] bg-status-critical z-10" />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-text-muted">
              <span>0.00</span>
              <span className="text-status-warning">0.60 ELEVATED</span>
              <span className="text-status-critical">0.85 CRIT</span>
              <span>1.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-bg-inset p-2 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">POLISHED ROD LOAD</div>
            <div className="text-sm font-bold text-text-primary">{well.polishedRodLoadKn.toFixed(1)} kN</div>
          </div>
          <Cpu className="w-4 h-4 text-status-cyan" />
        </div>

        <div className="bg-bg-inset p-2 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">GEARBOX TORQUE</div>
            <div className="text-sm font-bold text-text-primary">{well.motorTorque} N·m</div>
          </div>
          <Zap className="w-4 h-4 text-status-warning" />
        </div>

        <div className="bg-bg-inset p-2 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">PUMP EFFICIENCY</div>
            <div className="text-sm font-bold text-status-healthy">{well.pumpEfficiencyPct}%</div>
          </div>
          <Activity className="w-4 h-4 text-status-healthy" />
        </div>

        <div className="bg-bg-inset p-2 rounded border border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] text-text-muted">ESTIMATED MTBF</div>
            <div className="text-sm font-bold text-status-violet">{well.mtbfDays} Days</div>
          </div>
          <ShieldAlert className="w-4 h-4 text-status-violet" />
        </div>
      </div>
    </div>
  );
};
