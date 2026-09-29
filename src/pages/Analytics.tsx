import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { History, TrendingUp, Thermometer, SlidersHorizontal } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { PhysicsEngine } from '../sim/physics';

export const Analytics: React.FC = () => {
  const { currentWell } = useWellStore();
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('30D');

  const numPoints = timeRange === '24H' ? 24 : timeRange === '7D' ? 14 : 30;

  // Synthesize realistic historical trajectory coupled to well physical laws
  const historyData = Array.from({ length: numPoints }).map((_, idx) => {
    let label = '';

    if (timeRange === '24H') {
      label = `${idx}:00`;
      const temp = currentWell.reservoirTempC + (24 - idx) * 0.04;
      const visc = PhysicsEngine.calculateViscosity(temp);
      const prod = PhysicsEngine.calculateProduction(temp, visc, currentWell.spm, currentWell.pumpFillagePct);
      const load = PhysicsEngine.calculateMotorLoad(visc, currentWell.spm);
      return {
        time: label,
        oilProd: prod,
        tempC: temp,
        viscosity: visc,
        motorLoad: load,
        spm: currentWell.spm,
        sor: currentWell.sor,
      };
    } else if (timeRange === '7D') {
      label = `Day -${7 - Math.floor(idx / 2)}`;
      const dayOffset = (numPoints - idx) * 0.5;
      const temp = Math.max(46, currentWell.reservoirTempC + dayOffset * 0.35);
      const visc = PhysicsEngine.calculateViscosity(temp);
      const prod = PhysicsEngine.calculateProduction(temp, visc, currentWell.spm, currentWell.pumpFillagePct);
      const load = PhysicsEngine.calculateMotorLoad(visc, currentWell.spm);
      return {
        time: label,
        oilProd: prod,
        tempC: Math.round(temp * 10) / 10,
        viscosity: visc,
        motorLoad: load,
        spm: currentWell.spm,
        sor: currentWell.sor,
      };
    } else {
      // 30D Window
      const day = idx + 1;
      label = `Day ${day}`;
      const temp = PhysicsEngine.calculateReservoirTemp('PRODUCTION', day);
      const visc = PhysicsEngine.calculateViscosity(temp);
      const spmVal = day > 18 ? 4.8 : 5.8;
      const prod = PhysicsEngine.calculateProduction(temp, visc, spmVal, 82);
      const load = PhysicsEngine.calculateMotorLoad(visc, spmVal);
      const sorVal = Math.round((currentWell.steamInjectedM3 / Math.max(10, prod * 6.29)) * 100) / 100;
      return {
        time: label,
        oilProd: prod,
        tempC: temp,
        viscosity: visc,
        motorLoad: load,
        spm: spmVal,
        sor: sorVal,
      };
    }
  });

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header with Range Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Historical Trend Analytics & Thermal Correlation
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              PHYSICS CORRELATED • {currentWell.id}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Multi-variable retrospective analysis: Reservoir cooling, viscosity escalation, motor load, and SOR cycles
          </p>
        </div>

        <div className="flex items-center space-x-1.5 bg-bg-inset border border-border p-0.5 rounded text-xs font-mono">
          <span className="text-[10px] text-text-muted px-2">TIMEFRAME:</span>
          {(['24H', '7D', '30D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                timeRange === r
                  ? 'bg-status-cyan/20 border border-status-cyan/50 text-status-cyan font-bold shadow'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Chart 1: Production (BOPD) vs SOR */}
      <div className="panel-scada p-3 rounded space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-status-healthy" />
            <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
              Heavy Crude Production (BOPD) & Steam-Oil Ratio ({timeRange})
            </h2>
          </div>
          <span className="text-[10px] font-mono text-text-muted">RECHARTS MULTI-AXIS</span>
        </div>

        <div className="h-60 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData} margin={{ top: 10, right: 25, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
              <XAxis dataKey="time" stroke="#5F6875" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
              <YAxis yAxisId="left" stroke="#22C55E" fontSize={10} unit=" bpd" domain={[20, 120]} fontFamily="JetBrains Mono" />
              <YAxis yAxisId="right" orientation="right" stroke="#22D3EE" fontSize={10} unit=" SOR" domain={[2.5, 4.5]} fontFamily="JetBrains Mono" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-bg-panel border border-border p-2 rounded shadow-xl text-xs font-mono space-y-1">
                      <div className="text-text-primary font-bold">{d.time}</div>
                      <div className="text-status-healthy">Production: {d.oilProd.toFixed(1)} BOPD</div>
                      <div className="text-status-cyan font-bold">SOR: {d.sor.toFixed(2)}</div>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
              <Line yAxisId="left" type="monotone" dataKey="oilProd" stroke="#22C55E" strokeWidth={2.4} dot={false} name="Crude Production (BOPD)" isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="sor" stroke="#22D3EE" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Steam-Oil Ratio (SOR)" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Grid Row: Chart 2 (Temp vs Viscosity) & Chart 3 (Motor Load vs SPM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Chart 2: Reservoir Temperature vs Viscosity */}
        <div className="panel-scada p-3 rounded space-y-2">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-4 h-4 text-status-warning" />
              <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
                Reservoir Cooling Decline vs Viscosity Escalation
              </h2>
            </div>
            <span className="text-[10px] font-mono text-status-warning">INVERSE WALTHER</span>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 25, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
                <XAxis dataKey="time" stroke="#5F6875" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis yAxisId="left" stroke="#F59E0B" fontSize={10} unit="°C" domain={[42, 70]} fontFamily="JetBrains Mono" />
                <YAxis yAxisId="right" orientation="right" stroke="#A78BFA" fontSize={10} unit=" cP" domain={[3000, 14000]} fontFamily="JetBrains Mono" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <ReferenceLine yAxisId="left" y={48} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '48°C CUTOFF', fill: '#EF4444', fontSize: 9 }} />
                <Line yAxisId="left" type="monotone" dataKey="tempC" stroke="#F59E0B" strokeWidth={2.4} dot={false} name="Reservoir Temp (°C)" isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="viscosity" stroke="#A78BFA" strokeWidth={2} dot={false} name="Crude Viscosity (cP)" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Motor Load vs Operating Speed SPM */}
        <div className="panel-scada p-3 rounded space-y-2">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-status-blue" />
              <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
                Beam Unit Motor Load & Controlled Speed Adjustment
              </h2>
            </div>
            <span className="text-[10px] font-mono text-status-healthy">±0.5 SPM/MIN SLEWING</span>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 25, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2630" />
                <XAxis dataKey="time" stroke="#5F6875" fontSize={10} tickLine={false} fontFamily="JetBrains Mono" />
                <YAxis yAxisId="left" stroke="#EF4444" fontSize={10} unit="%" domain={[30, 100]} fontFamily="JetBrains Mono" />
                <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" fontSize={10} unit=" SPM" domain={[2, 8]} fontFamily="JetBrains Mono" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono' }} />
                <ReferenceLine yAxisId="left" y={85} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: '85% WARN', fill: '#F59E0B', fontSize: 9 }} />
                <Line yAxisId="left" type="monotone" dataKey="motorLoad" stroke="#EF4444" strokeWidth={2.4} dot={false} name="Motor Load (%)" isAnimationActive={false} />
                <Line yAxisId="right" type="stepAfter" dataKey="spm" stroke="#3B82F6" strokeWidth={2} dot={false} name="Pumping Speed (SPM)" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
