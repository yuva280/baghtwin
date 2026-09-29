import React from 'react';
import { Lightbulb, AlertTriangle, TrendingDown } from 'lucide-react';
import { Well } from '../../types';

interface DynamicInsightCardProps {
  well: Well;
}

export const DynamicInsightCard: React.FC<DynamicInsightCardProps> = ({ well }) => {
  // Compute dynamic insights based on current physical simulation parameters
  let headline = '';
  let detail = '';
  let severity: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (well.rodFloatingRisk > 0.8 || well.motorLoadPct > 92) {
    severity = 'critical';
    headline = 'Critical Mechanical Resistance Escalation';
    detail = `Viscosity has risen to ${well.viscosityCp.toLocaleString()} cP as reservoir cooled to ${well.reservoirTempC.toFixed(1)}°C. At current speed (${well.spm.toFixed(1)} SPM), motor load is at ${well.motorLoadPct.toFixed(1)}% and downstroke drag poses immediate risk of rod floating and buckled compression.`;
  } else if (well.rodFloatingRisk > 0.55 || well.motorLoadPct > 82) {
    severity = 'warning';
    headline = 'Thermal Decline Accelerating Viscous Drag';
    detail = `Cycle Day ${well.cycleDay.toFixed(1)} cooling is elevating viscosity (${well.viscosityCp.toLocaleString()} cP). Pump fillage has slipped to ${well.pumpFillagePct.toFixed(0)}%. Digital Twin predicts rod float onset within 6 hours unless SPM is trimmed by ~0.8-1.2 SPM.`;
  } else if (well.cyclePhase === 'INJECTION') {
    severity = 'warning';
    headline = 'Active Steam Injection Phase In Progress';
    detail = `High-pressure steam injection (${well.steamInjectedM3.toLocaleString()} m³) is raising near-wellbore temperature to ${well.reservoirTempC.toFixed(1)}°C, reducing crude viscosity for the upcoming production soak.`;
  } else if (well.cyclePhase === 'SOAK') {
    severity = 'healthy';
    headline = 'Thermal Soak Equilibration';
    detail = `Well is closed in for thermal diffusion. Heat chamber radius is currently ${well.heatRadiusM}m with reservoir temperature maintaining ${well.reservoirTempC.toFixed(1)}°C.`;
  } else {
    severity = 'healthy';
    headline = 'Steady-State Thermal Production Envelope';
    detail = `Reservoir temperature (${well.reservoirTempC.toFixed(1)}°C) maintains viscosity at ${well.viscosityCp.toLocaleString()} cP. Polished rod load is stable at ${well.polishedRodLoadKn} kN with nominal pump fillage of ${well.pumpFillagePct.toFixed(0)}%.`;
  }

  return (
    <div
      className={`panel-scada p-3 rounded flex items-start space-x-3 border transition-colors ${
        severity === 'critical'
          ? 'bg-status-critical/10 border-status-critical/40'
          : severity === 'warning'
          ? 'bg-status-warning/10 border-status-warning/40'
          : 'bg-status-healthy/5 border-status-healthy/30'
      }`}
    >
      <div className="p-2 rounded bg-bg-panel border border-border shrink-0 mt-0.5">
        {severity === 'critical' ? (
          <AlertTriangle className="w-4 h-4 text-status-critical" />
        ) : severity === 'warning' ? (
          <TrendingDown className="w-4 h-4 text-status-warning" />
        ) : (
          <Lightbulb className="w-4 h-4 text-status-healthy" />
        )}
      </div>

      <div className="space-y-0.5 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span
            className={`font-bold tracking-wide uppercase ${
              severity === 'critical'
                ? 'text-status-critical'
                : severity === 'warning'
                ? 'text-status-warning'
                : 'text-status-healthy'
            }`}
          >
            {headline}
          </span>
          <span className="text-[10px] text-text-muted">● AI REAL-TIME INFERENCE</span>
        </div>
        <p className="text-text-secondary text-[11px] leading-relaxed">{detail}</p>
      </div>
    </div>
  );
};
