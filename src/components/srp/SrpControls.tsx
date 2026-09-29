import React, { useState } from 'react';
import { SlidersHorizontal, AlertTriangle, ShieldCheck, Check, Clock } from 'lucide-react';
import { Well } from '../../types';
import { useSimulationStore } from '../../store/simulationStore';
import { CONSTANTS } from '../../constants';

interface SrpControlsProps {
  well: Well;
}

export const SrpControls: React.FC<SrpControlsProps> = ({ well }) => {
  const { targetSPM, setTargetSPM, safeEnvelopeActive } = useSimulationStore();
  const [inputSPM, setInputSPM] = useState<number>(targetSPM);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync internal state when external targetSPM updates
  React.useEffect(() => {
    setInputSPM(targetSPM);
  }, [targetSPM]);

  const presets = [
    { label: 'Cold Idle (2.5 SPM)', spm: 2.5, desc: 'Extreme viscosity (>12k cP)' },
    { label: 'Viscosity Mitigated (4.2 SPM)', spm: 4.2, desc: 'Recommended during cooling' },
    { label: 'Nominal Heavy Oil (5.8 SPM)', spm: 5.8, desc: 'Standard operating baseline' },
    { label: 'High Deliverability (7.0 SPM)', spm: 7.0, desc: 'Fresh post-steam heated crude' },
  ];

  const handleApplySPM = (val: number) => {
    // Validate safety bounds
    if (safeEnvelopeActive) {
      if (val < CONSTANTS.MIN_SPM || val > CONSTANTS.MAX_SPM) {
        setValidationError(
          `⚠ SETPOINT OUTSIDE SAFE OPERATING ENVELOPE: Value must remain within [${CONSTANTS.MIN_SPM.toFixed(1)} - ${CONSTANTS.MAX_SPM.toFixed(1)} SPM]`
        );
        return;
      }
    }
    setValidationError(null);
    setTargetSPM(val, 'Operator UI setpoint adjustment', 'OPERATOR');
  };

  // Difference between target and current well SPM
  const spmDelta = Math.abs(targetSPM - well.spm);
  const isMoving = spmDelta > 0.05;
  // Estimated time in seconds to reach target under ±0.5 SPM/min (0.00833 SPM/sec)
  const timeRemainingSec = Math.round((spmDelta / (CONSTANTS.MAX_SPM_RATE_PER_MIN / 60)));

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Sucker Rod Pump VFD Speed Controller
          </h2>
        </div>
        <span className="text-[10px] font-mono text-status-healthy flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-status-healthy" />
          <span>SAFETY INTERLOCK ACTIVE (±0.5 SPM/MIN)</span>
        </span>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-2.5 rounded bg-status-critical/15 border border-status-critical text-status-critical text-xs font-mono flex items-center space-x-2 animate-shake">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main SPM Slider & Direct Readout */}
      <div className="bg-bg-inset p-3 rounded border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-text-muted">Target Operating Speed</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono font-bold text-status-cyan">
                {inputSPM.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-text-secondary">SPM</span>
              <span className="text-text-muted text-[10px] font-mono">
                ({((inputSPM / 6.0) * 50.0).toFixed(1)} Hz VFD)
              </span>
            </div>
          </div>

          {/* Current Actual Status Pill */}
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-text-muted">Actual Current SPM</div>
            <div className="text-xl font-mono font-bold text-text-primary">
              {well.spm.toFixed(1)} SPM
            </div>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={1.5}
            max={8.5}
            step={0.1}
            value={inputSPM}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setInputSPM(val);
              handleApplySPM(val);
            }}
            className="w-full accent-status-cyan cursor-pointer bg-bg-panel h-2 rounded-lg"
          />
          <div className="flex justify-between text-[10px] font-mono text-text-muted">
            <span>2.0 SPM MIN</span>
            <span className="text-status-cyan font-bold">4.2 RECOMMENDED</span>
            <span>5.8 NOMINAL</span>
            <span>8.0 SPM MAX</span>
          </div>
        </div>

        {/* Rate Limiter Live Status */}
        {isMoving && (
          <div className="p-2 rounded bg-status-cyan/10 border border-status-cyan/30 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-status-cyan animate-spin" />
              <span className="text-status-cyan font-semibold">
                Slewing to {targetSPM.toFixed(1)} SPM at ±0.5 SPM/min rate limit...
              </span>
            </div>
            <span className="text-text-secondary text-[11px]">
              Est. remaining: ~{timeRemainingSec}s
            </span>
          </div>
        )}
      </div>

      {/* Preset Profiles */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-text-muted">
          OPERATIONAL SPEED PRESETS (OPTIMIZED FOR THERMAL CYCLES):
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {presets.map((p) => {
            const isSelected = Math.abs(targetSPM - p.spm) < 0.1;
            return (
              <button
                key={p.label}
                onClick={() => {
                  setInputSPM(p.spm);
                  handleApplySPM(p.spm);
                }}
                className={`p-2 rounded border text-left font-mono transition-all ${
                  isSelected
                    ? 'bg-status-cyan/15 border-status-cyan text-status-cyan font-bold shadow'
                    : 'bg-bg-inset border-border text-text-secondary hover:border-border-highlight hover:text-text-primary'
                }`}
              >
                <div className="text-xs flex items-center justify-between">
                  <span>{p.spm} SPM</span>
                  {isSelected && <Check className="w-3 h-3 text-status-cyan" />}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5 truncate">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
