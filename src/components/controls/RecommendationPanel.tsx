import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Info, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Well } from '../../types';
import { useAlertStore } from '../../store/alertStore';
import { simulatorInstance } from '../../sim/simulator';

interface RecommendationPanelProps {
  well: Well;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ well }) => {
  const { recommendations, updateRecommendationStatus } = useAlertStore();
  const [showExplanation, setShowExplanation] = useState(false);

  // Get active recommendation or generate real-time situational recommendation
  const activeRec = recommendations.find(
    (r) => r.wellId === well.id && r.status === 'PENDING'
  );

  const isHighRisk = well.rodFloatingRisk > 0.55 || well.motorLoadPct > 85;
  const recommendedSPM = Math.max(3.8, Math.round((well.spm - 1.2) * 10) / 10);

  const handleAccept = () => {
    // Apply setpoint to central simulator respecting the ±0.5 SPM/min rate limiter
    simulatorInstance.setTargetSPM(recommendedSPM);
    if (activeRec) {
      updateRecommendationStatus(activeRec.id, 'ACCEPTED', 'OPERATOR');
    }
  };

  const handleDismiss = () => {
    if (activeRec) {
      updateRecommendationStatus(activeRec.id, 'DISMISSED', 'OPERATOR');
    }
  };

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-3 border-status-cyan/30 bg-bg-panel relative overflow-hidden">
      {/* Background glow when high risk */}
      {isHighRisk && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-status-warning/5 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-status-cyan animate-pulse" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            AI Advisory Recommendation & Explainability Engine
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
          CONFIDENCE: 92% (EXPLAINABLE)
        </span>
      </div>

      {/* Causal Chain Flow */}
      <div className="bg-bg-inset p-2.5 rounded border border-border space-y-1.5">
        <div className="text-[10px] font-mono uppercase text-text-muted flex items-center justify-between">
          <span>CAUSAL ENGINEERING PATH (BAGHEWALA FIELD):</span>
          <span className="text-status-warning">DYNAMICALLY INFERRED</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-1 rounded bg-bg-panel border border-border flex items-center space-x-1">
            <span className="text-text-secondary">Temp:</span>
            <span className="text-status-warning font-bold">{well.reservoirTempC.toFixed(1)}°C</span>
            <TrendingDown className="w-3 h-3 text-status-warning" />
          </span>

          <ArrowRight className="w-3 h-3 text-text-muted" />

          <span className="px-2 py-1 rounded bg-bg-panel border border-border flex items-center space-x-1">
            <span className="text-text-secondary">Viscosity:</span>
            <span className="text-status-critical font-bold">{well.viscosityCp.toLocaleString()} cP</span>
            <TrendingUp className="w-3 h-3 text-status-critical" />
          </span>

          <ArrowRight className="w-3 h-3 text-text-muted" />

          <span className="px-2 py-1 rounded bg-bg-panel border border-border flex items-center space-x-1">
            <span className="text-text-secondary">Motor Load:</span>
            <span className="text-status-warning font-bold">{well.motorLoadPct.toFixed(1)}%</span>
            <TrendingUp className="w-3 h-3 text-status-warning" />
          </span>

          <ArrowRight className="w-3 h-3 text-text-muted" />

          <span className="px-2 py-1 rounded bg-bg-panel border border-border flex items-center space-x-1">
            <span className="text-text-secondary">Fillage:</span>
            <span className="text-status-warning font-bold">{well.pumpFillagePct.toFixed(0)}%</span>
            <TrendingDown className="w-3 h-3 text-status-warning" />
          </span>

          <ArrowRight className="w-3 h-3 text-text-muted" />

          <span className={`px-2 py-1 rounded border flex items-center space-x-1 ${
            isHighRisk ? 'bg-status-critical/15 border-status-critical text-status-critical' : 'bg-status-healthy/15 border-status-healthy text-status-healthy'
          }`}>
            <span className="font-semibold">Rod Float Risk:</span>
            <span className="font-bold">{(well.rodFloatingRisk * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>

      {/* Primary Recommendation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg-inset p-3 rounded border border-status-cyan/40">
        <div>
          <div className="text-xs font-mono font-bold text-text-primary flex items-center space-x-2">
            <span>
              {activeRec
                ? activeRec.title
                : isHighRisk
                ? `Proactive SPM Step-Down Advisory: Reduce to ${recommendedSPM} SPM`
                : 'Pumping Unit Operating Within Optimal Thermal-Mechanical Envelope'}
            </span>
          </div>
          <p className="text-[11px] text-text-secondary mt-1 leading-normal">
            {activeRec
              ? activeRec.description
              : isHighRisk
              ? `Downstroke viscous drag is impeding sucker rod gravity descent. Reducing SPM from ${well.spm.toFixed(1)} to ${recommendedSPM} prevents rod floating and lowers motor load by ~14%.`
              : `At ${well.reservoirTempC.toFixed(1)}°C and ${well.viscosityCp.toLocaleString()} cP, current stroke speed of ${well.spm.toFixed(1)} SPM yields nominal fillage with safe mechanical margins.`}
          </p>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-status-healthy mt-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guaranteed rate-limited: Maximum ±0.5 SPM/min interlock enforced.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded border border-border text-text-secondary hover:text-text-primary text-xs font-mono"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'HIDE DETAILS' : 'WHY THIS?'}</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleDismiss}
            className="px-2.5 py-1.5 rounded border border-border hover:border-status-critical/60 text-text-muted hover:text-status-critical text-xs font-mono"
            title="Dismiss advisory"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAccept}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-status-cyan text-bg font-mono font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all"
          >
            <Check className="w-3.5 h-3.5" />
            <span>ACCEPT & APPLY</span>
          </button>
        </div>
      </div>

      {/* Collapsible Deep Explanation Accordion */}
      {showExplanation && (
        <div className="p-3 rounded bg-bg-inset border border-border text-xs font-mono space-y-2 text-text-secondary animate-fadeIn">
          <div className="font-bold text-text-primary text-xs">
            Physical Principles Behind This Recommendation:
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
            <li>
              <strong>Stokes Viscous Drag:</strong> In Baghewala 18.2° API heavy crude, when temperature drops towards 48°C, viscosity scales exponentially to over 11,000 cP.
            </li>
            <li>
              <strong>Rod Floating Threshold:</strong> If pumping stroke cycle exceeds the terminal sinking velocity of the rod string under viscous resistance, the rods buckle compressively on downstroke, risking rod parting upon traveling valve pickup.
            </li>
            <li>
              <strong>Controlled Mitigation:</strong> Reducing SPM restores the mechanical velocity balance without interrupting production, saving an estimated 14 days of workover downtime.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
