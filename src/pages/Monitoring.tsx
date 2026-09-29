import React from 'react';
import { Activity } from 'lucide-react';
import { useWellStore } from '../store/wellStore';

export const Monitoring: React.FC = () => {
  const { currentWell } = useWellStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-status-cyan" />
          <h1 className="text-lg font-bold tracking-wide text-text-primary">
            Well Telemetry & Sensor Monitoring
          </h1>
        </div>
        <span className="px-2.5 py-1 rounded bg-bg-panel border border-border text-xs font-mono text-status-cyan">
          {currentWell?.id}
        </span>
      </div>

      <div className="panel-scada p-6 rounded text-center text-text-secondary">
        <p className="text-sm font-semibold text-text-primary mb-1">
          Sensor Telemetry Feeds
        </p>
        <p className="text-xs text-text-muted">
          Detailed multi-channel telemetry streams (Casing, Tubing, Intakes, Polished Rod, Motor Torques) will connect to the simulation engine in M1.
        </p>
      </div>
    </div>
  );
};
