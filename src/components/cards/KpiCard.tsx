import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { HelpCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue?: string;
  statusColor?: 'healthy' | 'warning' | 'critical' | 'cyan' | 'blue';
  sparklineData: { val: number }[];
  tooltipText: string;
  secondaryText?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  statusColor = 'cyan',
  sparklineData,
  tooltipText,
  secondaryText,
}) => {
  const colorMap = {
    healthy: '#22C55E',
    warning: '#F59E0B',
    critical: '#EF4444',
    cyan: '#22D3EE',
    blue: '#3B82F6',
  };

  const strokeColor = colorMap[statusColor] || '#22D3EE';

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between relative group hover:border-border-highlight transition-all">
      {/* Header & Tooltip */}
      <div className="flex items-center justify-between text-text-muted mb-1">
        <span className="text-[11px] font-mono font-medium tracking-wide uppercase truncate mr-1">
          {title}
        </span>
        <div className="relative group/tooltip">
          <HelpCircle className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary cursor-help" />
          <div className="absolute right-0 top-5 hidden group-hover/tooltip:block z-40 bg-bg-inset border border-border p-2 rounded shadow-xl text-[11px] text-text-secondary w-56 normal-case font-sans pointer-events-none">
            {tooltipText}
          </div>
        </div>
      </div>

      {/* Primary Value & Trend */}
      <div className="flex items-baseline justify-between my-1">
        <div className="flex items-baseline space-x-1.5 overflow-hidden">
          <span className="font-mono font-bold text-2xl lg:text-3xl text-text-primary tracking-tight">
            {value}
          </span>
          <span className="text-xs font-mono text-text-secondary uppercase">{unit}</span>
        </div>

        {trendValue && (
          <div className="flex items-center space-x-0.5 text-[11px] font-mono font-medium ml-2 shrink-0">
            {trend === 'up' && <TrendingUp className="w-3 h-3 text-status-healthy" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 text-status-warning" />}
            {trend === 'stable' && <Minus className="w-3 h-3 text-text-muted" />}
            <span
              className={
                trend === 'up'
                  ? 'text-status-healthy'
                  : trend === 'down'
                  ? 'text-status-warning'
                  : 'text-text-muted'
              }
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>

      {/* Sparkline & Secondary Metric */}
      <div className="flex items-end justify-between mt-1 pt-1.5 border-t border-border/50">
        <div className="text-[10px] font-mono text-text-muted truncate">
          {secondaryText || 'Nominal envelope'}
        </div>
        <div className="w-20 h-6 shrink-0">
          {sparklineData.length > 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
