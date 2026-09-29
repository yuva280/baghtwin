import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Cpu, CheckCircle2, Award } from 'lucide-react';
import { CSSOptimizationCandidate } from '../../services/mockService';

interface ParetoFrontChartProps {
  candidates: CSSOptimizationCandidate[];
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  onApplyCandidate: (candidate: CSSOptimizationCandidate) => void;
}

export const ParetoFrontChart: React.FC<ParetoFrontChartProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onApplyCandidate,
}) => {
  // Format for Recharts Scatter
  const paretoPoints = candidates.map((c) => ({
    x: c.estimatedOilBbl,
    y: c.estimatedSOR,
    z: c.steamVolumeM3,
    candidate: c,
  }));

  const optimalCandidate = candidates.find((c) => c.isRecommended) || candidates[1];
  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) || optimalCandidate;

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-status-violet" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            NSGA-II Multi-Objective Pareto Front — SIMULATED
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-violet/15 text-status-violet border border-status-violet/30 flex items-center space-x-1">
          <Cpu className="w-3 h-3 mr-0.5" />
          <span>OBJECTIVES: MAX OIL vs MIN SOR</span>
        </span>
      </div>

      {/* Selected Candidate Summary Banner */}
      <div className="bg-bg-inset p-3 rounded border border-status-violet/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="font-bold text-text-primary">
              Candidate {selectedCandidate.id} {selectedCandidate.isRecommended && '(Optimal Trade-Off)'}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-status-healthy/15 text-status-healthy font-semibold">
              PARETO RANK {selectedCandidate.paretoRank}
            </span>
          </div>
          <div className="text-[11px] font-mono text-text-secondary flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
            <span>Steam: <strong className="text-status-warning">{selectedCandidate.steamVolumeM3} m³</strong></span>
            <span>Pressure: <strong className="text-status-cyan">{selectedCandidate.injectionPressureBar} bar</strong></span>
            <span>Soak: <strong className="text-status-violet">{selectedCandidate.soakDays} Days</strong></span>
            <span>Est. Oil: <strong className="text-status-healthy">{selectedCandidate.estimatedOilBbl.toLocaleString()} bbl</strong></span>
            <span>Est. SOR: <strong className="text-status-cyan">{selectedCandidate.estimatedSOR.toFixed(2)}</strong></span>
          </div>
        </div>

        <button
          onClick={() => onApplyCandidate(selectedCandidate)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-status-cyan text-bg font-mono font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>APPLY CYCLE TO WELL</span>
        </button>
      </div>

      {/* Recharts Scatter Plot */}
      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
            <XAxis
              type="number"
              dataKey="x"
              name="Cumulative Oil"
              unit=" bbl"
              stroke="#5F6875"
              fontSize={10}
              domain={[2000, 6200]}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Steam-Oil Ratio (SOR)"
              stroke="#5F6875"
              fontSize={10}
              domain={[2.8, 4.2]}
              unit=" SOR"
              fontFamily="JetBrains Mono"
            />
            <ZAxis type="number" dataKey="z" range={[80, 240]} name="Steam Vol (m³)" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload.candidate as CSSOptimizationCandidate;
                return (
                  <div className="bg-bg-panel border border-border p-2.5 rounded shadow-xl text-xs font-mono space-y-1">
                    <div className="text-status-cyan font-bold">
                      {d.id} {d.isRecommended ? '★ Optimal Compromise' : ''}
                    </div>
                    <div className="text-text-primary">Cumulative Oil: {d.estimatedOilBbl.toLocaleString()} bbl</div>
                    <div className="text-status-warning">Steam Volume: {d.steamVolumeM3} m³</div>
                    <div className="text-status-violet">Soak Period: {d.soakDays} days</div>
                    <div className="text-status-healthy font-bold">Steam-Oil Ratio: {d.estimatedSOR.toFixed(2)}</div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
            <Scatter
              name="NSGA-II Candidate Designs"
              data={paretoPoints}
              fill="#A78BFA"
              onClick={(e) => onSelectCandidate(e.candidate.id)}
              className="cursor-pointer"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Axis Description Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border">
        <span>X-AXIS: Cumulative Production Potential (Higher is better)</span>
        <span>Y-AXIS: Steam-Oil Ratio (Lower is better)</span>
      </div>
    </div>
  );
};
