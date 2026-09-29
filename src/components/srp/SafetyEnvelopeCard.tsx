import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { OperatingMode } from '../../types';

export const SafetyEnvelopeCard: React.FC = () => {
  const { 
    safeEnvelopeActive, 
    setSafeEnvelope, 
    operatingMode, 
    setOperatingMode 
  } = useSimulationStore();

  const interlocks = [
    {
      name: 'SPM Slew Rate Limiter',
      rule: 'Max ±0.5 SPM/min (0.00833 SPM/sec)',
      purpose: 'Prevents sudden gearbox shock and rod string compressive whip.',
      status: safeEnvelopeActive ? 'ENFORCED' : 'BYPASSED',
      color: safeEnvelopeActive ? 'text-status-healthy' : 'text-status-critical',
    },
    {
      name: 'Motor Continuous Thermal Bound',
      rule: '85% Warning | 95% Hard Cutoff',
      purpose: 'Protects surface electric motor from winding burnout in high-viscosity crude.',
      status: safeEnvelopeActive ? 'ENFORCED' : 'BYPASSED',
      color: safeEnvelopeActive ? 'text-status-healthy' : 'text-status-critical',
    },
    {
      name: 'Rod Floating Anti-Buckling Interlock',
      rule: 'Risk > 0.60 Advisory | > 0.85 Auto Step-Down',
      purpose: 'Prevents delayed seating and impact loading on traveling valve pickup.',
      status: safeEnvelopeActive ? 'ENFORCED' : 'BYPASSED',
      color: safeEnvelopeActive ? 'text-status-healthy' : 'text-status-critical',
    },
    {
      name: 'Parted Rod Emergency Shutdown',
      rule: 'Load < 40 kN with 0 BOPD Trip',
      purpose: 'Automatic VFD inverter lockout upon parted rod string detection.',
      status: safeEnvelopeActive ? 'ENFORCED' : 'BYPASSED',
      color: safeEnvelopeActive ? 'text-status-healthy' : 'text-status-critical',
    },
    {
      name: 'Operating Speed Hard Bounds',
      rule: '2.0 SPM Minimum | 8.0 SPM Maximum',
      purpose: 'Ensures operation remains within certified mechanical equipment limits.',
      status: safeEnvelopeActive ? 'ENFORCED' : 'BYPASSED',
      color: safeEnvelopeActive ? 'text-status-healthy' : 'text-status-critical',
    },
  ];

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-status-healthy" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Active Mechanical Safety Envelope & Interlocks
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSafeEnvelope(!safeEnvelopeActive)}
            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
              safeEnvelopeActive
                ? 'bg-status-healthy/15 border-status-healthy text-status-healthy'
                : 'bg-status-critical/15 border-status-critical text-status-critical animate-pulse'
            }`}
          >
            {safeEnvelopeActive ? '● ALL INTERLOCKS ARMED' : '⚠ ENVELOPE BYPASSED'}
          </button>
        </div>
      </div>

      {/* Operating Mode Selector Banner */}
      <div className="bg-bg-inset p-2.5 rounded border border-border space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-text-muted flex items-center justify-between">
          <span>CONTROL ROOM GOVERNANCE MODE:</span>
          <span className="text-status-cyan font-bold">{operatingMode}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['ADVISORY', 'SUPERVISED', 'SIMULATION'] as OperatingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setOperatingMode(mode)}
              className={`p-2 rounded border text-left text-xs font-mono transition-all ${
                operatingMode === mode
                  ? 'bg-status-cyan/15 border-status-cyan text-status-cyan font-bold shadow'
                  : 'bg-bg-panel border-border text-text-secondary hover:border-border-highlight hover:text-text-primary'
              }`}
            >
              <div className="font-bold">{mode}</div>
              <div className="text-[9px] text-text-muted mt-0.5 truncate">
                {mode === 'ADVISORY' && 'Operator accepts AI'}
                {mode === 'SUPERVISED' && 'Auto-apply with notice'}
                {mode === 'SIMULATION' && 'Unrestricted sandbox'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interlock Rules Table */}
      <div className="space-y-1.5">
        {interlocks.map((item) => (
          <div
            key={item.name}
            className="p-2 rounded bg-bg-inset border border-border flex items-center justify-between text-xs font-mono space-x-2"
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-text-primary">{item.name}</span>
                <span className="text-[10px] text-status-cyan bg-bg-panel px-1.5 py-0.2 rounded border border-border">
                  {item.rule}
                </span>
              </div>
              <div className="text-[10px] text-text-secondary">{item.purpose}</div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border border-border shrink-0 ${item.color}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {!safeEnvelopeActive && (
        <div className="p-2 rounded bg-status-critical/10 border border-status-critical text-status-critical text-[11px] font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>CAUTION: Safety interlocks bypassed for testing. Unchecked rate changes may damage mechanical rod string in heavy crude.</span>
        </div>
      )}
    </div>
  );
};
