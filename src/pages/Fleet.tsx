import React, { useState } from 'react';
import { Grid, Cpu } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { WellStatus } from '../types';

export const Fleet: React.FC = () => {
  const { wells, selectWell, selectedWellId, isSyncing } = useWellStore();
  const [statusFilter, setStatusFilter] = useState<'ALL' | WellStatus>('ALL');

  const filteredWells = wells.filter((w) => statusFilter === 'ALL' || w.status === statusFilter);

  // Fleet KPIs
  const totalProduction = wells.reduce((sum, w) => sum + (w.status === 'PRODUCING' ? w.oilProductionBpd : 0), 0);
  const activeProducingCount = wells.filter((w) => w.status === 'PRODUCING').length;
  const alarmCount = wells.filter((w) => w.status === 'ALARM').length;
  const avgSOR = 3.24;

  const filterTabs: { id: 'ALL' | WellStatus; label: string; count: number }[] = [
    { id: 'ALL', label: 'ALL WELLS', count: wells.length },
    { id: 'PRODUCING', label: 'PRODUCING', count: wells.filter((w) => w.status === 'PRODUCING').length },
    { id: 'STEAMING', label: 'STEAMING', count: wells.filter((w) => w.status === 'STEAMING').length },
    { id: 'SOAKING', label: 'SOAKING', count: wells.filter((w) => w.status === 'SOAKING').length },
    { id: 'ALARM', label: 'ALARM', count: wells.filter((w) => w.status === 'ALARM').length },
    { id: 'MAINTENANCE', label: 'MAINTENANCE', count: wells.filter((w) => w.status === 'MAINTENANCE').length },
    { id: 'INACTIVE', label: 'INACTIVE', count: wells.filter((w) => w.status === 'INACTIVE').length },
  ];

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <Grid className="w-4 h-4 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Baghewala Field Fleet Overview (56 Thermal Heavy Oil Wells)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              OIL INDIA ASSET
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Fleet-wide thermal stimulation surveillance, artificial lift monitoring, and centralized telemetry dispatch
          </p>
        </div>

        {isSyncing && (
          <span className="flex items-center text-status-cyan font-mono text-xs animate-pulse">
            <Cpu className="w-4 h-4 mr-1.5" />
            SYNCING DIGITAL TWIN STATE...
          </span>
        )}
      </div>

      {/* 2. Fleet KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">EST. FLEET PRODUCTION</div>
          <div className="text-2xl font-bold text-status-healthy mt-0.5">
            {Math.round(totalProduction).toLocaleString()} <span className="text-xs">BOPD</span>
          </div>
          <div className="text-[10px] text-status-healthy">34 Wells Active</div>
        </div>

        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">ACTIVE WELLS</div>
          <div className="text-2xl font-bold text-status-cyan mt-0.5">
            {activeProducingCount} / {wells.length}
          </div>
          <div className="text-[10px] text-text-secondary">60.7% Fleet Utilization</div>
        </div>

        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">ALARM / INTERVENTION</div>
          <div className="text-2xl font-bold text-status-critical mt-0.5">{alarmCount} Wells</div>
          <div className="text-[10px] text-status-warning">High Viscosity & Drag</div>
        </div>

        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">FLEET AVERAGE SOR</div>
          <div className="text-2xl font-bold text-status-violet mt-0.5">{avgSOR} m³/m³</div>
          <div className="text-[10px] text-text-muted">Target: 3.10 m³/m³</div>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-bg-panel p-1.5 rounded border border-border">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
              statusFilter === tab.id
                ? tab.id === 'ALARM'
                  ? 'bg-status-critical/20 border border-status-critical text-status-critical font-bold'
                  : 'bg-status-cyan/20 border border-status-cyan text-status-cyan font-bold shadow'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-inset border border-transparent'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-1.5 text-[10px] opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* 4. Well Cards Grid (56 Wells) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {filteredWells.map((well) => {
          const isSelected = well.id === selectedWellId;
          const isAlarm = well.status === 'ALARM';
          const isSteaming = well.status === 'STEAMING';
          const isSoaking = well.status === 'SOAKING';

          return (
            <div
              key={well.id}
              onClick={() => selectWell(well.id)}
              className={`panel-scada p-3 rounded cursor-pointer transition-all flex flex-col justify-between space-y-2 group ${
                isSelected
                  ? 'border-status-cyan bg-status-cyan/10 shadow-lg scale-[1.01]'
                  : isAlarm
                  ? 'border-status-critical/40 hover:border-status-critical'
                  : 'hover:border-border-highlight'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/60 pb-1.5 mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-text-primary group-hover:text-status-cyan transition-colors">
                      {well.id}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono px-1 rounded bg-status-cyan text-bg font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      well.status === 'PRODUCING'
                        ? 'bg-status-healthy/15 text-status-healthy'
                        : isAlarm
                        ? 'bg-status-critical text-white animate-pulse'
                        : isSteaming
                        ? 'bg-status-warning/15 text-status-warning'
                        : isSoaking
                        ? 'bg-status-violet/15 text-status-violet'
                        : 'bg-bg-inset text-text-muted'
                    }`}
                  >
                    ● {well.status}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-text-secondary truncate mb-2">
                  {well.name}
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono bg-bg-inset p-2 rounded border border-border">
                  <div>
                    <span className="text-[9px] text-text-muted block">PRODUCTION</span>
                    <span className="font-bold text-text-primary">
                      {well.oilProductionBpd.toFixed(1)} <span className="text-[9px] font-normal text-text-muted">BOPD</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-text-muted block">VISCOSITY</span>
                    <span className={`font-bold ${well.viscosityCp > 10000 ? 'text-status-critical' : 'text-text-primary'}`}>
                      {well.viscosityCp.toLocaleString()} <span className="text-[9px] font-normal text-text-muted">cP</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-text-muted block">TEMPERATURE</span>
                    <span className="text-status-warning font-bold">
                      {well.reservoirTempC.toFixed(1)}°C
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-text-muted block">SRP SPEED</span>
                    <span className="text-status-cyan font-bold">
                      {well.spm.toFixed(1)} <span className="text-[9px] font-normal text-text-muted">SPM</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border/50">
                <span>Phase: <strong className="text-text-secondary">{well.cyclePhase} (D{well.cycleDay})</strong></span>
                <span className={well.rodFloatingRisk > 0.55 ? 'text-status-critical font-bold' : 'text-status-healthy'}>
                  Risk: {(well.rodFloatingRisk * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
