import React from 'react';
import { DollarSign, TrendingDown, ShieldCheck } from 'lucide-react';
import { Well } from '../../types';

interface CssEconomicsCardProps {
  well: Well;
  targetSOR: number;
}

export const CssEconomicsCard: React.FC<CssEconomicsCardProps> = ({ well, targetSOR }) => {
  const currentCostPerBbl = 28.40;
  const optimizedCostPerBbl = 24.90;
  const savingsPerBbl = currentCostPerBbl - optimizedCostPerBbl;

  const comparisonRows = [
    {
      metric: 'Cycle Steam Volume',
      baseline: `${well.steamInjectedM3.toLocaleString()} m³`,
      optimized: '1,450 m³',
      delta: '-250 m³ (-14.7%)',
      positive: true,
    },
    {
      metric: 'Steam-Oil Ratio (SOR)',
      baseline: `${well.sor.toFixed(2)} m³/m³`,
      optimized: `${targetSOR.toFixed(2)} m³/m³`,
      delta: `-0.32 (-9.4%)`,
      positive: true,
    },
    {
      metric: 'Thermal Energy Input',
      baseline: '2.14 GJ/bbl',
      optimized: '1.82 GJ/bbl',
      delta: '-0.32 GJ/bbl (-15.0%)',
      positive: true,
    },
    {
      metric: 'Lifting Cost per Barrel',
      baseline: `$${currentCostPerBbl.toFixed(2)} / bbl`,
      optimized: `$${optimizedCostPerBbl.toFixed(2)} / bbl`,
      delta: `-$${savingsPerBbl.toFixed(2)} / bbl (-12.3%)`,
      positive: true,
    },
    {
      metric: 'Cycle Cumulative Oil',
      baseline: '4,240 bbl',
      optimized: '4,680 bbl',
      delta: '+440 bbl (+10.4%)',
      positive: true,
    },
  ];

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-status-healthy" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            CSS Energy Efficiency & Thermal Operating Economics
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-warning/15 text-status-warning border border-status-warning/30">
          PROTOTYPE ESTIMATE
        </span>
      </div>

      {/* 4 Metric Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="bg-bg-inset p-2.5 rounded border border-border">
          <div className="text-[10px] text-text-muted uppercase">STEAM CONSERVED</div>
          <div className="text-xl font-bold text-status-healthy mt-0.5">350 m³</div>
          <div className="text-[10px] text-status-healthy flex items-center space-x-0.5">
            <TrendingDown className="w-3 h-3" />
            <span>-14.7% Steam Fuel</span>
          </div>
        </div>

        <div className="bg-bg-inset p-2.5 rounded border border-border">
          <div className="text-[10px] text-text-muted uppercase">EST. SOR TARGET</div>
          <div className="text-xl font-bold text-status-cyan mt-0.5">{targetSOR.toFixed(2)}</div>
          <div className="text-[10px] text-status-healthy">▼ -0.32 vs Baseline</div>
        </div>

        <div className="bg-bg-inset p-2.5 rounded border border-border">
          <div className="text-[10px] text-text-muted uppercase">ENERGY EFFICIENCY</div>
          <div className="text-xl font-bold text-status-violet mt-0.5">1.82 GJ</div>
          <div className="text-[10px] text-text-muted">Per Barrel Produced</div>
        </div>

        <div className="bg-bg-inset p-2.5 rounded border border-border">
          <div className="text-[10px] text-text-muted uppercase">OPEX REDUCTION</div>
          <div className="text-xl font-bold text-status-healthy mt-0.5">-$3.50</div>
          <div className="text-[10px] text-status-healthy">Per Net Barrel Lifted</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="text-text-muted border-b border-border text-[10px] uppercase bg-bg-inset">
              <th className="p-2 font-medium">Economic Metric</th>
              <th className="p-2 font-medium">Current Cycle Plan</th>
              <th className="p-2 font-medium">Optimized Pareto Plan</th>
              <th className="p-2 font-medium text-right">Variance / Benefit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {comparisonRows.map((row) => (
              <tr key={row.metric} className="hover:bg-bg-inset transition-colors">
                <td className="p-2 text-text-primary font-medium">{row.metric}</td>
                <td className="p-2 text-text-secondary">{row.baseline}</td>
                <td className="p-2 text-status-cyan font-bold">{row.optimized}</td>
                <td className="p-2 text-right text-status-healthy font-semibold">
                  {row.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Prototype Honesty Footer */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3 h-3 text-status-healthy" />
          <span>Simulated numerical estimate • Based on Baghewala reservoir thermal properties</span>
        </span>
        <span className="text-status-warning">NOT LIVE FIELD OIL INDIA FINANCIALS</span>
      </div>
    </div>
  );
};
