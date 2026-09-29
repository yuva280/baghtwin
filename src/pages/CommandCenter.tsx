import React from 'react';
import { LayoutDashboard, Radio } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { KpiCard } from '../components/cards/KpiCard';
import { DynamicInsightCard } from '../components/cards/DynamicInsightCard';
import { TwinPipeline } from '../components/pipeline/TwinPipeline';
import { ThermalDeclineChart } from '../components/charts/ThermalDeclineChart';
import { ViscosityTempChart } from '../components/charts/ViscosityTempChart';
import { RecommendationPanel } from '../components/controls/RecommendationPanel';
import { TwinVsActualCard } from '../components/cards/TwinVsActualCard';
import { EventFeed } from '../components/alerts/EventFeed';
import { TOOLTIPS } from '../constants';

export const CommandCenter: React.FC = () => {
  const { currentWell, telemetryHistory } = useWellStore();

  // Extract sparklines from bounded telemetry history (last 15 points)
  const sparkOil = telemetryHistory.map((s) => ({ val: s.oilProductionBpd }));
  const sparkTemp = telemetryHistory.map((s) => ({ val: s.reservoirTempC }));
  const sparkVisc = telemetryHistory.map((s) => ({ val: s.viscosityCp }));
  const sparkSOR = telemetryHistory.map((_s) => ({ val: currentWell.sor }));
  const sparkSPM = telemetryHistory.map((s) => ({ val: s.spm }));
  const sparkLoad = telemetryHistory.map((s) => ({ val: s.motorLoadPct }));

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Baghewala Digital Twin — Command Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              P0 HERO
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time well-to-surface monitoring, prediction and optimization • Baghewala Heavy Oil Field
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-bg-panel border border-border rounded">
            <Radio className="w-3.5 h-3.5 text-status-healthy animate-pulse" />
            <span className="text-text-secondary">ASSET:</span>
            <span className="text-status-cyan font-bold">{currentWell.id}</span>
            <span className="text-text-muted">({currentWell.name})</span>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards Row (Section 47: Six Heroes) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
        <KpiCard
          title="Oil Production"
          value={currentWell.oilProductionBpd.toFixed(1)}
          unit="BOPD"
          trend="up"
          trendValue="+3.4%"
          statusColor="healthy"
          sparklineData={sparkOil}
          tooltipText={TOOLTIPS.BOPD}
          secondaryText={`Water cut: ${currentWell.waterCutPct}%`}
        />
        <KpiCard
          title="Reservoir Temp"
          value={currentWell.reservoirTempC.toFixed(1)}
          unit="°C"
          trend="down"
          trendValue="-0.8°C/d"
          statusColor={currentWell.reservoirTempC < 48 ? 'critical' : currentWell.reservoirTempC < 55 ? 'warning' : 'healthy'}
          sparklineData={sparkTemp}
          tooltipText="Near-wellbore thermal condition following Cyclic Steam Stimulation soak."
          secondaryText={`Bottomhole: ${currentWell.bottomholeTempC.toFixed(1)}°C`}
        />
        <KpiCard
          title="Heavy Oil Viscosity"
          value={currentWell.viscosityCp.toLocaleString()}
          unit="cP"
          trend="up"
          trendValue="+420 cP"
          statusColor={currentWell.viscosityCp > 10000 ? 'critical' : currentWell.viscosityCp > 8000 ? 'warning' : 'cyan'}
          sparklineData={sparkVisc}
          tooltipText="Dynamic viscosity in centipoise at reservoir temperature for 18.2° API crude."
          secondaryText={currentWell.viscosityCp > 9000 ? 'Viscous drag critical' : 'Flow acceptable'}
        />
        <KpiCard
          title="Steam-Oil Ratio"
          value={currentWell.sor.toFixed(2)}
          unit="m³/m³"
          trend="stable"
          trendValue="3.10 target"
          statusColor="cyan"
          sparklineData={sparkSOR}
          tooltipText={TOOLTIPS.SOR}
          secondaryText={`Steam Inj: ${currentWell.steamInjectedM3} m³`}
        />
        <KpiCard
          title="SRP Operating Speed"
          value={currentWell.spm.toFixed(1)}
          unit="SPM"
          trend="stable"
          trendValue="±0.5 limiter"
          statusColor="blue"
          sparklineData={sparkSPM}
          tooltipText={TOOLTIPS.SPM}
          secondaryText={`VFD: ${currentWell.vfdHz.toFixed(1)} Hz`}
        />
        <KpiCard
          title="Motor Load"
          value={currentWell.motorLoadPct.toFixed(1)}
          unit="%"
          trend={currentWell.motorLoadPct > 85 ? 'up' : 'stable'}
          trendValue={currentWell.motorLoadPct > 85 ? 'WARN' : 'NOMINAL'}
          statusColor={currentWell.motorLoadPct > 90 ? 'critical' : currentWell.motorLoadPct > 82 ? 'warning' : 'healthy'}
          sparklineData={sparkLoad}
          tooltipText="Surface beam unit prime mover continuous thermal load."
          secondaryText={`Torque: ${currentWell.motorTorque} N·m`}
        />
      </div>

      {/* 3. Dynamic Insight Banner (Section 49) */}
      <DynamicInsightCard well={currentWell} />

      {/* 4. Digital Twin Architectural Pipeline (Section 51) */}
      <TwinPipeline well={currentWell} />

      {/* 5. Core Analytical Charts Row (Section 48 & 50) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <ThermalDeclineChart
          currentDay={currentWell.cycleDay}
          currentTempC={currentWell.reservoirTempC}
        />
        <ViscosityTempChart
          currentTempC={currentWell.reservoirTempC}
          currentViscCp={currentWell.viscosityCp}
          cycleDay={currentWell.cycleDay}
        />
      </div>

      {/* 6. Actionable Intelligence Row (Section 52 & 53 & Event Feed) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5">
        <div className="xl:col-span-2 space-y-3.5">
          <RecommendationPanel well={currentWell} />
          <TwinVsActualCard well={currentWell} />
        </div>
        <div className="xl:col-span-1">
          <EventFeed wellId={currentWell.id} />
        </div>
      </div>
    </div>
  );
};
