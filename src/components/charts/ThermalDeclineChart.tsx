import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Flame, ShieldAlert, Cpu } from 'lucide-react';
import { PhysicsEngine } from '../../sim/physics';
import { CONSTANTS } from '../../constants';

interface ThermalDeclineChartProps {
  currentDay: number;
  currentTempC: number;
}

export const ThermalDeclineChart: React.FC<ThermalDeclineChartProps> = ({
  currentDay,
  currentTempC,
}) => {
  const [windowDays, setWindowDays] = useState<30 | 45>(30);

  // Generate continuous thermal decline curve (Days 0 to windowDays)
  const chartData = Array.from({ length: windowDays + 1 }).map((_, d) => {
    // Simulated actual: matches physics with slight historical variance
    const isPast = d <= currentDay;
    const actual = isPast ? PhysicsEngine.calculateReservoirTemp('PRODUCTION', d) : null;

    // PINN forecast: physics-informed neural network forward prediction
    const pinnForecast = PhysicsEngine.calculateReservoirTemp('PRODUCTION', d);
    const viscCp = PhysicsEngine.calculateViscosity(pinnForecast);

    return {
      day: `Day ${d}`,
      dayNum: d,
      Actual: d === Math.round(currentDay) ? currentTempC : actual,
      PINNForecast: pinnForecast,
      viscosity: viscCp,
    };
  });

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-status-warning" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Reservoir Temperature Decline — {windowDays}-Day Thermal Window
          </h2>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-status-violet/15 text-status-violet border border-status-violet/30 flex items-center space-x-1">
            <Cpu className="w-2.5 h-2.5 mr-0.5" />
            <span>PINN Thermal Forecast — SIMULATED</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="text-text-muted">WINDOW:</span>
          <button
            onClick={() => setWindowDays(30)}
            className={`px-2 py-0.5 rounded ${
              windowDays === 30
                ? 'bg-status-cyan/20 text-status-cyan border border-status-cyan/50 font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setWindowDays(45)}
            className={`px-2 py-0.5 rounded ${
              windowDays === 45
                ? 'bg-status-cyan/20 text-status-cyan border border-status-cyan/50 font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            45D
          </button>
        </div>
      </div>

      {/* Subheader Readout */}
      <div className="flex items-center justify-between text-[11px] font-mono bg-bg-inset p-2 rounded border border-border">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-text-muted mr-1.5">CURRENT TEMP:</span>
            <span className="text-status-warning font-bold">{currentTempC.toFixed(1)}°C</span>
          </div>
          <div>
            <span className="text-text-muted mr-1.5">CYCLE DAY:</span>
            <span className="text-text-primary font-bold">{currentDay.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-text-muted mr-1.5">THERMAL HALFLIFE:</span>
            <span className="text-status-cyan">τ = {CONSTANTS.TAU_DAYS} days</span>
          </div>
        </div>

        <div className="flex items-center text-status-critical space-x-1 text-[10px]">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>CRITICAL THRESHOLD: &lt; 48.0°C (Viscosity &gt; 12,000 cP)</span>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-56 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
            <XAxis
              dataKey="day"
              stroke="#5F6875"
              fontSize={10}
              tickLine={false}
              interval={4}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              domain={[42, 72]}
              stroke="#5F6875"
              fontSize={10}
              tickLine={false}
              unit="°C"
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-bg-panel border border-border p-2.5 rounded shadow-xl text-xs font-mono space-y-1">
                    <div className="text-text-primary font-bold">{d.day}</div>
                    {d.Actual !== null && (
                      <div className="text-status-warning">Actual: {d.Actual.toFixed(1)}°C</div>
                    )}
                    <div className="text-status-violet">PINN Forecast: {d.PINNForecast.toFixed(1)}°C</div>
                    <div className="text-status-cyan">Est. Viscosity: {d.viscosity.toLocaleString()} cP</div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '4px' }}
            />
            <ReferenceLine
              y={48.0}
              stroke="#EF4444"
              strokeDasharray="4 4"
              label={{
                value: 'CRITICAL 48°C (HIGH VISCOSITY)',
                fill: '#EF4444',
                fontSize: 9,
                position: 'insideBottomRight',
              }}
            />
            <ReferenceLine
              x={`Day ${Math.round(currentDay)}`}
              stroke="#22D3EE"
              strokeDasharray="2 2"
              label={{
                value: 'TODAY',
                fill: '#22D3EE',
                fontSize: 9,
                position: 'top',
              }}
            />
            <Line
              type="monotone"
              dataKey="Actual"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#F59E0B' }}
              name="Telemetry Actual (°C)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="PINNForecast"
              stroke="#A78BFA"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              name="PINN Model Forecast (°C)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
