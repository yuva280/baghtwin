import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  CartesianGrid,
} from 'recharts';
import { Droplet, ArrowRight } from 'lucide-react';
import { PhysicsEngine } from '../../sim/physics';

interface ViscosityTempChartProps {
  currentTempC: number;
  currentViscCp: number;
  cycleDay: number;
}

export const ViscosityTempChart: React.FC<ViscosityTempChartProps> = ({
  currentTempC,
  currentViscCp,
  cycleDay,
}) => {
  // Generate Walther curve for 44°C to 70°C
  const curveData = [];
  for (let t = 44; t <= 70; t += 2) {
    curveData.push({
      temp: t,
      viscosity: PhysicsEngine.calculateViscosity(t),
    });
  }

  // Calculate forward projections for +6h, +12h, +24h (assuming simulation speed/day progress)
  const proj6hTemp = PhysicsEngine.calculateReservoirTemp('PRODUCTION', cycleDay + 0.25);
  const proj6hVisc = PhysicsEngine.calculateViscosity(proj6hTemp);

  const proj12hTemp = PhysicsEngine.calculateReservoirTemp('PRODUCTION', cycleDay + 0.5);
  const proj12hVisc = PhysicsEngine.calculateViscosity(proj12hTemp);

  const proj24hTemp = PhysicsEngine.calculateReservoirTemp('PRODUCTION', cycleDay + 1.0);
  const proj24hVisc = PhysicsEngine.calculateViscosity(proj24hTemp);

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Droplet className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Heavy Oil Viscosity vs Temperature (Baghewala 18.2° API)
          </h2>
        </div>
        <span className="text-[10px] font-mono text-text-muted">CALIBRATED WALTHER MODEL</span>
      </div>

      {/* Projections Row */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono bg-bg-inset p-2 rounded border border-border">
        <div className="border-r border-border pr-1">
          <div className="text-[10px] text-text-muted">NOW</div>
          <div className="font-bold text-status-cyan">{currentViscCp.toLocaleString()} cP</div>
          <div className="text-[10px] text-text-secondary">{currentTempC.toFixed(1)}°C</div>
        </div>
        <div className="border-r border-border pr-1">
          <div className="text-[10px] text-text-muted">+6 HOURS</div>
          <div className="font-bold text-text-primary">{proj6hVisc.toLocaleString()} cP</div>
          <div className="text-[10px] text-text-secondary">{proj6hTemp.toFixed(1)}°C</div>
        </div>
        <div className="border-r border-border pr-1">
          <div className="text-[10px] text-text-muted">+12 HOURS</div>
          <div className="font-bold text-text-primary">{proj12hVisc.toLocaleString()} cP</div>
          <div className="text-[10px] text-text-secondary">{proj12hTemp.toFixed(1)}°C</div>
        </div>
        <div>
          <div className="text-[10px] text-text-muted">+24 HOURS</div>
          <div className="font-bold text-status-warning">{proj24hVisc.toLocaleString()} cP</div>
          <div className="text-[10px] text-text-secondary">{proj24hTemp.toFixed(1)}°C</div>
        </div>
      </div>

      {/* Recharts Curve */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curveData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
            <XAxis
              dataKey="temp"
              stroke="#5F6875"
              fontSize={10}
              tickLine={false}
              unit="°C"
              fontFamily="JetBrains Mono"
            />
            <YAxis
              domain={[2000, 16000]}
              stroke="#5F6875"
              fontSize={10}
              tickLine={false}
              unit=" cP"
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-bg-panel border border-border p-2 rounded shadow-xl text-xs font-mono">
                    <div className="text-text-primary">Temperature: {d.temp}°C</div>
                    <div className="text-status-cyan font-bold">Viscosity: {d.viscosity.toLocaleString()} cP</div>
                  </div>
                );
              }}
            />
            <ReferenceDot
              x={Math.round(currentTempC)}
              y={currentViscCp}
              r={5}
              fill="#22D3EE"
              stroke="#0B0E11"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="viscosity"
              stroke="#22D3EE"
              strokeWidth={2}
              dot={false}
              name="Viscosity (cP)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Physics Relationship Note */}
      <div className="text-[11px] font-mono text-text-secondary flex items-center justify-between pt-1 border-t border-border">
        <span className="flex items-center space-x-1">
          <span>COOLING (48°C)</span>
          <ArrowRight className="w-3 h-3 text-status-warning" />
          <span className="text-status-warning font-bold">12,000 cP (EXTREME DRAG)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span>STEAM HEATED (62°C)</span>
          <ArrowRight className="w-3 h-3 text-status-healthy" />
          <span className="text-status-healthy font-bold">5,000 cP (OPTIMAL FLOW)</span>
        </span>
      </div>
    </div>
  );
};
