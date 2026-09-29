import React from 'react';
import { Cpu, AlertTriangle, ShieldCheck, CheckCircle2, Flame, Wrench } from 'lucide-react';
import { FaultClass } from '../../types';

interface ClassifierPanelProps {
  confidences: { name: string; probability: number }[];
  predictedFault: FaultClass;
  inferenceTimeMs: number;
  viscosityCp: number;
  motorLoadPct: number;
  pumpFillagePct: number;
  rodFloatingRisk: number;
}

export const ClassifierPanel: React.FC<ClassifierPanelProps> = ({
  confidences,
  predictedFault,
  inferenceTimeMs,
  viscosityCp,
  motorLoadPct,
  pumpFillagePct,
  rodFloatingRisk,
}) => {
  const getFaultBadge = (fault: FaultClass) => {
    switch (fault) {
      case 'NORMAL':
        return {
          title: 'Normal Full Pump Operation',
          color: 'text-status-healthy',
          bg: 'bg-status-healthy/15 border-status-healthy/40',
          severity: 'HEALTHY',
          icon: ShieldCheck,
          diagnosis: 'Traveling and standing valves operating in full synchronization. Nominal barrel fluid intake with complete fillage.',
          action: 'Maintain setpoint envelope. Continue routine thermal-lift surveillance.',
        };
      case 'ROD_FLOATING':
        return {
          title: 'Rod Floating & Delayed Downstroke Seating',
          color: 'text-status-warning',
          bg: 'bg-status-warning/15 border-status-warning/40',
          severity: 'WARNING',
          icon: AlertTriangle,
          diagnosis: `Severe downstroke viscous drag (${viscosityCp.toLocaleString()} cP) retards rod fall. Compressive stress creates lower-right card sag with ${(rodFloatingRisk * 100).toFixed(0)}% risk index.`,
          action: 'Trim SRP pumping speed by -0.8 to -1.4 SPM to match terminal sinking velocity.',
        };
      case 'FLUID_POUND':
        return {
          title: 'Fluid Pound / Incomplete Barrel Fillage',
          color: 'text-status-warning',
          bg: 'bg-status-warning/15 border-status-warning/40',
          severity: 'WARNING',
          icon: AlertTriangle,
          diagnosis: `Downhole pump fillage dropped to ${pumpFillagePct.toFixed(0)}%. Traveling valve impacts fluid surface violently during mid-downstroke, creating load spikes.`,
          action: 'Reduce SPM by -1.0 SPM to match reservoir inflow rate and prevent fatigue failure.',
        };
      case 'GAS_INTERFERENCE':
        return {
          title: 'Free Gas Interference / Compression Loop',
          color: 'text-status-violet',
          bg: 'bg-status-violet/15 border-status-violet/40',
          severity: 'ELEVATED',
          icon: Flame,
          diagnosis: 'Free solution gas compressing in working barrel during downstroke, delaying traveling valve opening and flattening load curve.',
          action: 'Increase casing gas bleed or adjust pump stroke length to maximize compression ratio.',
        };
      case 'PARTED_ROD':
        return {
          title: 'Sucker Rod String Parted (Emergency)',
          color: 'text-status-critical',
          bg: 'bg-status-critical/15 border-status-critical/40',
          severity: 'CRITICAL',
          icon: Wrench,
          diagnosis: 'Card load collapsed to tare string weight (~22 kN). Zero hydraulic work performed. Sucker rod mechanically disconnected.',
          action: 'Immediate automated VFD pump shutdown required. Schedule urgent workover rig.',
        };
      default:
        return {
          title: 'Mechanical Anomaly Detected',
          color: 'text-status-warning',
          bg: 'bg-status-warning/15 border-status-warning/40',
          severity: 'WARNING',
          icon: AlertTriangle,
          diagnosis: 'Card geometry deviates from baseline reference envelope.',
          action: 'Inspect surface transducer calibration and downhole valve integrity.',
        };
    }
  };

  const badge = getFaultBadge(predictedFault);
  const Icon = badge.icon;

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-status-violet" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            1D-CNN Fault Classifier — SIMULATED
          </h2>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-status-cyan bg-bg-inset px-2 py-0.5 rounded border border-border">
          <span>INFERENCE:</span>
          <span className="font-bold">{inferenceTimeMs.toFixed(1)} ms</span>
        </div>
      </div>

      {/* Probability Bars */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-text-muted flex items-center justify-between">
          <span>CLASSIFICATION CONFIDENCE BREAKDOWN:</span>
          <span className="text-text-secondary">SOFTMAX PROBABILITIES</span>
        </div>

        <div className="space-y-1.5">
          {confidences.map((item) => {
            const pct = Math.round(item.probability * 100);
            const isHighest = item.probability >= 0.5;

            return (
              <div key={item.name} className="space-y-0.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={isHighest ? 'text-text-primary font-bold' : 'text-text-secondary'}>
                    {item.name}
                  </span>
                  <span className={isHighest ? 'text-status-cyan font-bold' : 'text-text-muted'}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-bg-inset rounded-full overflow-hidden border border-border/50">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.name === 'Normal Full Pump'
                        ? 'bg-status-healthy'
                        : item.name === 'Parted Rod'
                        ? 'bg-status-critical'
                        : 'bg-status-cyan'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnosis Banner */}
      <div className={`p-3 rounded border space-y-1.5 ${badge.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Icon className={`w-4 h-4 ${badge.color}`} />
            <span className={`text-xs font-mono font-bold uppercase ${badge.color}`}>
              {badge.title}
            </span>
          </div>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${badge.color}`}>
            ● {badge.severity}
          </span>
        </div>

        <p className="text-[11px] font-mono text-text-secondary leading-relaxed">
          {badge.diagnosis}
        </p>

        <div className="pt-1 border-t border-border/50 text-[11px] font-mono flex items-start space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-status-healthy shrink-0 mt-0.5" />
          <span className="text-text-primary font-semibold">
            Action: <span className="font-normal text-text-secondary">{badge.action}</span>
          </span>
        </div>
      </div>

      {/* Multi-variable Indicator Footprint */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono bg-bg-inset p-2 rounded border border-border">
        <div>
          <div className="text-text-muted">VISCOSITY</div>
          <div className="text-text-primary font-bold">{viscosityCp.toLocaleString()} cP</div>
        </div>
        <div>
          <div className="text-text-muted">MOTOR LOAD</div>
          <div className={`font-bold ${motorLoadPct > 85 ? 'text-status-warning' : 'text-text-primary'}`}>
            {motorLoadPct.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-text-muted">FILLAGE</div>
          <div className={`font-bold ${pumpFillagePct < 70 ? 'text-status-warning' : 'text-text-primary'}`}>
            {pumpFillagePct.toFixed(0)}%
          </div>
        </div>
        <div>
          <div className="text-text-muted">FLOAT RISK</div>
          <div className={`font-bold ${rodFloatingRisk > 0.55 ? 'text-status-critical' : 'text-status-healthy'}`}>
            {(rodFloatingRisk * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};
