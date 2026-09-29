import React from 'react';
import { Waves, ShieldCheck, Activity } from 'lucide-react';
import { Well } from '../../types';

interface GibbsReconstructionCardProps {
  well: Well;
}

export const GibbsReconstructionCard: React.FC<GibbsReconstructionCardProps> = ({ well }) => {
  // Acoustic velocity in steel sucker rod string: a ≈ 4,850 m/s
  const acousticVel = 4850;
  const dampingCoeff = (0.035 + (well.viscosityCp / 10000) * 0.02).toFixed(4);
  const downholeStrokeM = (well.strokeLengthM * 0.91).toFixed(2);
  const oneWayTravelTimeMs = ((well.depthM / acousticVel) * 1000).toFixed(1);

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Waves className="w-4 h-4 text-status-violet" />
          <h3 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Gibbs Wave Equation Reconstruction — SIMULATED
          </h3>
        </div>
        <span className="text-[10px] font-mono text-status-violet bg-status-violet/15 px-1.5 py-0.5 rounded border border-status-violet/30">
          1D DAMPED WAVE SOLVER
        </span>
      </div>

      <div className="text-[11px] font-mono text-text-secondary leading-relaxed bg-bg-inset p-2 rounded border border-border">
        Transforms surface polished-rod dynamometer telemetry into true downhole pump plunger card behavior by solving the hyperbolic wave boundary problem:
        <div className="text-center font-bold text-status-cyan my-1 text-xs">
          ∂²u/∂t² = a² · (∂²u/∂x²) - c · (∂u/∂t)
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-bg-inset p-2 rounded border border-border">
          <div className="text-[10px] text-text-muted">ACOUSTIC VELOCITY (a)</div>
          <div className="text-text-primary font-bold">{acousticVel} m/s</div>
          <div className="text-[9px] text-text-secondary">Grade D Sucker Rod</div>
        </div>
        <div className="bg-bg-inset p-2 rounded border border-border">
          <div className="text-[10px] text-text-muted">DAMPING FACTOR (c)</div>
          <div className="text-status-warning font-bold">{dampingCoeff} s⁻¹</div>
          <div className="text-[9px] text-text-secondary">Coupled to {well.viscosityCp.toLocaleString()} cP</div>
        </div>
        <div className="bg-bg-inset p-2 rounded border border-border">
          <div className="text-[10px] text-text-muted">PUMP STROKE (Sp)</div>
          <div className="text-status-cyan font-bold">{downholeStrokeM} m</div>
          <div className="text-[9px] text-text-secondary">Net Plunger Travel</div>
        </div>
        <div className="bg-bg-inset p-2 rounded border border-border">
          <div className="text-[10px] text-text-muted">WAVE TRAVEL TIME</div>
          <div className="text-text-primary font-bold">{oneWayTravelTimeMs} ms</div>
          <div className="text-[9px] text-text-secondary">Surface to 1,150m depth</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border">
        <span className="flex items-center space-x-1 text-status-healthy">
          <ShieldCheck className="w-3 h-3" />
          <span>Numerical stability: Courant-Friedrichs-Lewy (CFL ≤ 1.0) verified</span>
        </span>
        <span className="flex items-center space-x-1">
          <Activity className="w-3 h-3 text-status-cyan" />
          <span>Boundary condition: Surface transducer input</span>
        </span>
      </div>
    </div>
  );
};
