import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { useSimulationStore } from '../store/simulationStore';
import { SrpGauges } from '../components/srp/SrpGauges';
import { SrpControls } from '../components/srp/SrpControls';
import { SafetyEnvelopeCard } from '../components/srp/SafetyEnvelopeCard';
import { SrpAuditLog } from '../components/srp/SrpAuditLog';

export const SRPControl: React.FC = () => {
  const { currentWell } = useWellStore();
  const { operatingMode, safeEnvelopeActive } = useSimulationStore();

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              SRP Control / VFD Panel
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              P0 HERO
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time sucker rod pump operation, VFD frequency modulation, and active safety interlocks.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-bg-panel border border-border rounded">
            <span className="text-text-muted">MODE:</span>
            <span
              className={`font-bold ${
                operatingMode === 'ADVISORY'
                  ? 'text-status-cyan'
                  : operatingMode === 'SUPERVISED'
                  ? 'text-status-violet'
                  : 'text-status-warning'
              }`}
            >
              {operatingMode}
            </span>
            <span className="text-border-highlight">|</span>
            <span className={safeEnvelopeActive ? 'text-status-healthy' : 'text-status-critical font-bold'}>
              {safeEnvelopeActive ? 'ENV ACTIVE' : 'ENV BYPASSED'}
            </span>
            <span className="text-border-highlight">|</span>
            <span className="text-text-secondary">ASSET:</span>
            <span className="text-status-cyan font-bold">{currentWell.id}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Gauges Instrument Strip (Section 60) */}
      <SrpGauges well={currentWell} />

      {/* 3. Interactive Controls & Safety Envelope (Section 61, 62, 63) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <SrpControls well={currentWell} />
        <SafetyEnvelopeCard />
      </div>

      {/* 4. Action & Safety Interlock Audit Log (Section 64) */}
      <SrpAuditLog />
    </div>
  );
};
