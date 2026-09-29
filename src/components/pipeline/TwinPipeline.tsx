import React from 'react';
import { 
  Database, 
  Activity, 
  Cpu, 
  BrainCircuit, 
  Sliders, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import { Well } from '../../types';

interface TwinPipelineProps {
  well: Well;
}

export const TwinPipeline: React.FC<TwinPipelineProps> = ({ well }) => {
  const pipelineStages = [
    {
      id: 'DATA',
      label: 'REAL WELL DATA',
      icon: Database,
      status: 'SYNCED',
      details: `${well.id} • 1,150m`,
      subtext: '4.8 bar Csg / 18.2 bar Tbg',
      color: 'text-status-cyan',
    },
    {
      id: 'STATE',
      label: 'STATE ESTIMATION',
      icon: Activity,
      status: 'ACTIVE',
      details: `${well.cyclePhase} Day ${well.cycleDay.toFixed(1)}`,
      subtext: `Heat Radius: ${well.heatRadiusM}m`,
      color: 'text-status-blue',
    },
    {
      id: 'PHYSICS',
      label: 'PHYSICS MODEL',
      icon: Cpu,
      status: 'COUPLED',
      details: `${well.reservoirTempC.toFixed(1)}°C → ${well.viscosityCp.toLocaleString()} cP`,
      subtext: 'Thermal Decline + Walther',
      color: 'text-status-warning',
    },
    {
      id: 'ML',
      label: 'ML PREDICTION',
      icon: BrainCircuit,
      status: 'INFERRED',
      details: `Anomaly: ${(well.anomalyScore * 100).toFixed(0)}%`,
      subtext: `Risk: ${(well.rodFloatingRisk * 100).toFixed(0)}% • 12ms`,
      color: 'text-status-violet',
    },
    {
      id: 'OPTIM',
      label: 'OPTIMIZATION',
      icon: Sliders,
      status: 'CALCULATED',
      details: `Target SPM: ${well.rodFloatingRisk > 0.55 ? (well.spm - 1.2).toFixed(1) : well.spm.toFixed(1)}`,
      subtext: '±0.5 SPM/min limiter',
      color: 'text-status-healthy',
    },
    {
      id: 'REC',
      label: 'RECOMMENDATION',
      icon: CheckCircle2,
      status: well.rodFloatingRisk > 0.55 ? 'ACTIVE ADVISORY' : 'NOMINAL',
      details: well.rodFloatingRisk > 0.55 ? 'Reduce SPM to trim drag' : 'Maintain setpoint',
      subtext: 'Closed-Loop Ready',
      color: well.rodFloatingRisk > 0.55 ? 'text-status-warning' : 'text-status-healthy',
    },
  ];

  return (
    <div className="panel-scada p-3 rounded space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Digital Twin Architectural Pipeline — Live State Synchronization
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="flex items-center text-status-healthy">
            <span className="w-1.5 h-1.5 rounded-full bg-status-healthy mr-1 animate-pulse" />
            PIPELINE CONVERGED
          </span>
          <span className="text-text-muted">LATENCY: ~12ms</span>
        </div>
      </div>

      {/* Responsive Horizontal Pipeline Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 pt-1">
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className="bg-bg-inset border border-border p-2 rounded flex flex-col justify-between relative group hover:border-border-highlight transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mb-1">
                  <span className="font-semibold text-text-secondary">{stage.label}</span>
                  <Icon className={`w-3.5 h-3.5 ${stage.color}`} />
                </div>
                <div className="font-mono text-xs font-bold text-text-primary truncate">
                  {stage.details}
                </div>
                <div className="text-[10px] font-mono text-text-secondary truncate mt-0.5">
                  {stage.subtext}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/50 text-[9px] font-mono">
                <span className={`${stage.color} font-semibold`}>{stage.status}</span>
                {idx < pipelineStages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-border-highlight hidden xl:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-bg-panel rounded-full" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
