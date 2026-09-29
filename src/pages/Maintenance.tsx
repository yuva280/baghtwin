import React from 'react';
import { Wrench, Clock } from 'lucide-react';
import { useWellStore } from '../store/wellStore';

export const Maintenance: React.FC = () => {
  const { currentWell } = useWellStore();

  // Dynamic component health calculation based on active rod floating risk & motor load
  const rodHealth = Math.max(35, Math.round(82 - currentWell.rodFloatingRisk * 35));
  const motorHealth = Math.max(40, Math.round(92 - (currentWell.motorLoadPct > 85 ? (currentWell.motorLoadPct - 85) * 2.5 : 0)));
  const pumpHealth = Math.max(45, Math.round(currentWell.pumpEfficiencyPct * 0.95));
  const tubingHealth = 92;

  const equipmentList = [
    {
      name: 'Sucker Rod String (API Grade D Tapered)',
      category: 'Downhole Mechanical Lift',
      healthPct: rodHealth,
      status: rodHealth < 50 ? 'CRITICAL' : rodHealth < 70 ? 'WARNING' : 'HEALTHY',
      rulDays: Math.round(currentWell.mtbfDays * 0.65),
      failureMode: 'Compressive downstroke buckling & cyclic fatigue from viscous crude drag (>10k cP)',
      lastWorkover: '2025-11-20',
      nextScheduled: '2026-11-15',
      workoverCostEst: '$42,000 (Downtime: 14 days)',
      inspectionMethod: 'Electromagnetic Flux Leakage (FLI) & Dynacard Inversion',
    },
    {
      name: 'Surface Beam Unit Motor & Gear Reducer',
      category: 'Surface Mechanical Drive',
      healthPct: motorHealth,
      status: motorHealth < 60 ? 'WARNING' : 'HEALTHY',
      rulDays: Math.round(currentWell.mtbfDays * 0.8),
      failureMode: 'Gearbox torque overload and continuous motor thermal winding stress (>85% load)',
      lastWorkover: '2026-02-10',
      nextScheduled: '2026-08-10',
      workoverCostEst: '$18,500 (Downtime: 3 days)',
      inspectionMethod: 'Vibration FFT Spectrum & Lubricant Viscometry',
    },
    {
      name: 'Downhole Plunger Pump Barrel & Valves (2.25")',
      category: 'Subsurface Displacement Lift',
      healthPct: pumpHealth,
      status: pumpHealth < 55 ? 'WARNING' : 'HEALTHY',
      rulDays: Math.round(currentWell.mtbfDays * 0.9),
      failureMode: 'Traveling and standing valve seat erosion from fine formation sand fines',
      lastWorkover: '2026-04-18',
      nextScheduled: '2027-04-18',
      workoverCostEst: '$28,000 (Downtime: 7 days)',
      inspectionMethod: 'Gibbs Wave Reconstruction & Downhole Intake Pressure',
    },
    {
      name: 'Vacuum Insulated Tubing String (VIT)',
      category: 'Thermal Insulation Wellbore',
      healthPct: tubingHealth,
      status: 'HEALTHY',
      rulDays: 340,
      failureMode: 'Annular vacuum degradation during cyclic high-pressure steam stimulation',
      lastWorkover: '2025-08-05',
      nextScheduled: '2027-08-05',
      workoverCostEst: '$65,000 (Rig intervention)',
      inspectionMethod: 'Annulus Helium Leak Testing & Distributed Temp Sensing (DTS)',
    },
  ];

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Predictive Equipment Maintenance & Remaining Useful Life (RUL)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              SIMULATED PREDICTION • PROTOTYPE
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Physics-coupled asset health indexing, failure modes, and proactive workover prevention • Baghewala Field
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-bg-panel border border-border rounded">
            <span className="text-text-secondary">ASSET:</span>
            <span className="text-status-cyan font-bold">{currentWell.id}</span>
            <span className="text-border-highlight">|</span>
            <span className="text-text-muted">SYSTEM MTBF:</span>
            <span className="text-status-violet font-bold">{currentWell.mtbfDays} DAYS</span>
          </div>
        </div>
      </div>

      {/* 2. System-Level Health Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">SYSTEM MTBF (DAYS)</div>
          <div className="text-2xl font-bold text-status-violet mt-0.5">{currentWell.mtbfDays}d</div>
          <div className="text-[10px] text-text-secondary">Baseline: 180 Days</div>
        </div>

        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">CRITICAL SUBASSEMBLY</div>
          <div className="text-base font-bold text-status-warning mt-1 truncate">Sucker Rod String</div>
          <div className="text-[10px] text-status-warning">Compressive Drag Risk</div>
        </div>

        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">AVERTED WORKOVERS</div>
          <div className="text-2xl font-bold text-status-healthy mt-0.5">3 Events</div>
          <div className="text-[10px] text-status-healthy">Via Proactive SPM Trim</div>
        </div>

        <div className="panel-scada p-3 rounded">
          <div className="text-[10px] text-text-muted uppercase">EST. COST AVOIDED</div>
          <div className="text-2xl font-bold text-status-healthy mt-0.5">$126,000</div>
          <div className="text-[10px] text-text-muted">Rig & Production Downtime</div>
        </div>
      </div>

      {/* 3. Detailed Equipment Component Cards (Section 71) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {equipmentList.map((eq) => {
          const isCrit = eq.status === 'CRITICAL';
          const isWarn = eq.status === 'WARNING';

          return (
            <div
              key={eq.name}
              className={`panel-scada p-3 rounded flex flex-col justify-between space-y-3 border transition-all ${
                isCrit
                  ? 'border-status-critical/40 bg-status-critical/5'
                  : isWarn
                  ? 'border-status-warning/40 bg-status-warning/5'
                  : 'hover:border-border-highlight'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-text-primary">{eq.name}</h3>
                    <span className="text-[10px] font-mono text-text-muted">{eq.category}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isCrit
                        ? 'bg-status-critical text-white animate-pulse'
                        : isWarn
                        ? 'bg-status-warning text-bg'
                        : 'bg-status-healthy/15 text-status-healthy'
                    }`}
                  >
                    ● {eq.status}
                  </span>
                </div>

                {/* Health Bar */}
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted text-[11px]">Subsystem Health Index:</span>
                    <span
                      className={`font-bold ${
                        isCrit
                          ? 'text-status-critical'
                          : isWarn
                          ? 'text-status-warning'
                          : 'text-status-healthy'
                      }`}
                    >
                      {eq.healthPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-bg-inset rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCrit
                          ? 'bg-status-critical'
                          : isWarn
                          ? 'bg-status-warning'
                          : 'bg-status-healthy'
                      }`}
                      style={{ width: `${eq.healthPct}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-bg-inset p-2 rounded border border-border mb-2">
                  <div>
                    <div className="text-[10px] text-text-muted">REMAINING USEFUL LIFE</div>
                    <div className="text-sm font-bold text-status-cyan">{eq.rulDays} Days</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted">PRIMARY FAILURE MODE</div>
                    <div className="text-[11px] text-text-secondary leading-tight mt-0.5">
                      {eq.failureMode}
                    </div>
                  </div>
                </div>

                {/* Inspection & Cost */}
                <div className="space-y-1 text-[11px] font-mono text-text-secondary">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>Last Overhaul: {eq.lastWorkover} • Next: {eq.nextScheduled}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Wrench className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    <span>Diagnostics: {eq.inspectionMethod}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>Intervention Impact: <strong className="text-status-warning">{eq.workoverCostEst}</strong></span>
                <span className="text-status-healthy">Surveillance: Active</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
