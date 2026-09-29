import React from 'react';
import { Play, RotateCcw, AlertTriangle, Flame, Wrench } from 'lucide-react';
import { FaultClass } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';

interface FaultInjectionBarProps {
  activeFault: FaultClass | null;
}

export const FaultInjectionBar: React.FC<FaultInjectionBarProps> = ({ activeFault }) => {
  const { setActiveFault } = useSimulationStore();

  const faults: { id: FaultClass; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
    { id: 'ROD_FLOATING', label: 'Inject Rod Floating', icon: AlertTriangle, color: 'text-status-warning' },
    { id: 'FLUID_POUND', label: 'Inject Fluid Pound', icon: AlertTriangle, color: 'text-status-warning' },
    { id: 'GAS_INTERFERENCE', label: 'Inject Gas Interference', icon: Flame, color: 'text-status-violet' },
    { id: 'PARTED_ROD', label: 'Inject Parted Rod', icon: Wrench, color: 'text-status-critical' },
  ];

  return (
    <div className="panel-scada p-3 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-status-cyan/30">
      {/* Active Fault Indicator */}
      <div className="flex items-center space-x-2.5">
        <div className="p-2 rounded bg-bg-inset border border-border">
          <Play className="w-4 h-4 text-status-cyan" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-text-muted uppercase">
            PHYSICAL FAULT SIMULATION ENGINE
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-text-primary">
              ACTIVE CONDITION:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                activeFault && activeFault !== 'NORMAL'
                  ? 'bg-status-critical/15 border-status-critical text-status-critical animate-pulse'
                  : 'bg-status-healthy/15 border-status-healthy text-status-healthy'
              }`}
            >
              ● {activeFault ? activeFault.replace('_', ' ') : 'NORMAL (FULL BARREL)'}
            </span>
          </div>
        </div>
      </div>

      {/* Fault Injection Button Group */}
      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        {faults.map((f) => {
          const Icon = f.icon;
          const isActive = activeFault === f.id;

          return (
            <button
              key={f.id}
              onClick={() => setActiveFault(f.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-mono font-semibold border transition-all ${
                isActive
                  ? 'bg-status-warning/20 border-status-warning text-status-warning shadow-md'
                  : 'bg-bg-inset border-border text-text-secondary hover:border-border-highlight hover:text-text-primary'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${f.color}`} />
              <span>{f.label}</span>
            </button>
          );
        })}

        {/* Clear Fault / Restore Normal */}
        <button
          onClick={() => setActiveFault('NORMAL')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold bg-status-healthy/15 border border-status-healthy text-status-healthy hover:bg-status-healthy/25 transition-all ml-auto md:ml-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CLEAR FAULT (NORMAL)</span>
        </button>
      </div>
    </div>
  );
};
