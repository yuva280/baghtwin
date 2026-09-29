import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProductionVsSteamChartProps {
  currentSteamVolume: number;
}

export const ProductionVsSteamChart: React.FC<ProductionVsSteamChartProps> = ({
  currentSteamVolume,
}) => {
  // Generate curve data showing diminishing oil returns vs steam volume
  const curveData = [];
  for (let steam = 600; steam <= 2200; steam += 100) {
    // Diminishing returns production curve
    const oilProd = Math.round(1800 + 3800 * (1 - Math.exp(-steam / 900)));
    // SOR = Steam (m³) / Oil (converted m³ / bbl ~ bbl * 0.159)
    const sor = Math.round((steam / (oilProd * 0.159)) * 100) / 100;

    curveData.push({
      steam,
      oilProd,
      sor,
    });
  }

  return (
    <div className="panel-scada p-3 rounded space-y-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-status-healthy" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Cumulative Oil Production & SOR vs Steam Usage (Diminishing Returns)
          </h2>
        </div>
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-status-healthy font-semibold">
            SHADED: OPTIMAL OPERATING WINDOW (1,300–1,600 m³)
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={curveData} margin={{ top: 10, right: 25, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
            <XAxis
              dataKey="steam"
              stroke="#5F6875"
              fontSize={10}
              tickLine={false}
              unit=" m³"
              fontFamily="JetBrains Mono"
            />
            {/* Left Y-axis: Oil Production (bbl) */}
            <YAxis
              yAxisId="left"
              stroke="#22C55E"
              fontSize={10}
              tickLine={false}
              unit=" bbl"
              domain={[1000, 6000]}
              fontFamily="JetBrains Mono"
            />
            {/* Right Y-axis: Steam-Oil Ratio */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#22D3EE"
              fontSize={10}
              tickLine={false}
              unit=" SOR"
              domain={[2.5, 4.5]}
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-bg-panel border border-border p-2 rounded shadow-xl text-xs font-mono space-y-1">
                    <div className="text-text-primary font-bold">Steam Injected: {d.steam} m³</div>
                    <div className="text-status-healthy">Cumulative Oil: {d.oilProd.toLocaleString()} bbl</div>
                    <div className="text-status-cyan font-bold">Steam-Oil Ratio: {d.sor.toFixed(2)}</div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />

            {/* Shaded Optimal Operating Region (1300 to 1600 m³) */}
            <ReferenceArea
              yAxisId="left"
              x1={1300}
              x2={1600}
              fill="#22C55E"
              fillOpacity={0.08}
              stroke="#22C55E"
              strokeDasharray="3 3"
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="oilProd"
              stroke="#22C55E"
              strokeWidth={2.4}
              dot={false}
              name="Cumulative Oil (bbl)"
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="sor"
              stroke="#22D3EE"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="Steam-Oil Ratio (SOR)"
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Physics Insight */}
      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border">
        <span>Current Steam Setting: <strong className="text-status-warning">{currentSteamVolume} m³</strong></span>
        <span>Beyond 1,600 m³, thermal breakthrough causes SOR to climb without proportional oil uplift.</span>
      </div>
    </div>
  );
};
