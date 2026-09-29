import { Layers, Cpu } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { useSimulationStore } from '../store/simulationStore';
import { WellSchematic } from '../components/well/WellSchematic';
import { WellThermalProfile } from '../components/well/WellThermalProfile';

export const DigitalTwin: React.FC = () => {
  const { currentWell } = useWellStore();
  const { activeFault } = useSimulationStore();

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Wellbore & Reservoir Digital Twin
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              P0 HERO
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Interactive cross-section schematic from surface pumping unit to downhole 1,150 m perforation • Baghewala Field
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-bg-panel border border-border rounded">
            <span className="text-text-secondary">ASSET:</span>
            <span className="text-status-cyan font-bold">{currentWell.id}</span>
            <span className="text-border-highlight">|</span>
            <span className="text-text-muted">DEPTH:</span>
            <span className="text-text-primary font-bold">{currentWell.depthM} m</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Well Cross-Section Digital Twin */}
      <WellSchematic well={currentWell} activeFault={activeFault} />

      {/* 3. Lower Deep-Engineering Inspection Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Left: Depth-wise Thermal & Viscosity Profile */}
        <WellThermalProfile well={currentWell} />

        {/* Right: Subsurface Pump & Artificial Lift Mechanics */}
        <div className="panel-scada p-3 rounded space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-status-cyan" />
              <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
                Subsurface Artificial Lift Telemetry
              </h2>
            </div>
            <span className="text-[10px] font-mono text-status-cyan bg-bg-inset px-2 py-0.5 rounded border border-border">
              DOWNHOLE SENSORS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
            <div className="bg-bg-inset p-2.5 rounded border border-border">
              <div className="text-[10px] text-text-muted uppercase">PUMP SPEED</div>
              <div className="text-lg font-bold text-status-cyan">{currentWell.spm.toFixed(1)} SPM</div>
              <div className="text-[10px] text-text-secondary">VFD: {currentWell.vfdHz.toFixed(1)} Hz</div>
            </div>

            <div className="bg-bg-inset p-2.5 rounded border border-border">
              <div className="text-[10px] text-text-muted uppercase">MOTOR LOAD</div>
              <div className={`text-lg font-bold ${currentWell.motorLoadPct > 85 ? 'text-status-warning' : 'text-status-healthy'}`}>
                {currentWell.motorLoadPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-text-secondary">Torque: {currentWell.motorTorque} N·m</div>
            </div>

            <div className="bg-bg-inset p-2.5 rounded border border-border">
              <div className="text-[10px] text-text-muted uppercase">PUMP FILLAGE</div>
              <div className={`text-lg font-bold ${currentWell.pumpFillagePct < 70 ? 'text-status-warning' : 'text-status-healthy'}`}>
                {currentWell.pumpFillagePct.toFixed(0)}%
              </div>
              <div className="text-[10px] text-text-secondary">Working Barrel</div>
            </div>

            <div className="bg-bg-inset p-2.5 rounded border border-border">
              <div className="text-[10px] text-text-muted uppercase">ROD TENSION</div>
              <div className="text-lg font-bold text-text-primary">{currentWell.polishedRodLoadKn.toFixed(1)} kN</div>
              <div className="text-[10px] text-text-secondary">At Stuffing Box</div>
            </div>

            <div className="bg-bg-inset p-2.5 rounded border border-border">
              <div className="text-[10px] text-text-muted uppercase">FLOAT HAZARD</div>
              <div className={`text-lg font-bold ${currentWell.rodFloatingRisk > 0.55 ? 'text-status-critical' : 'text-status-healthy'}`}>
                {(currentWell.rodFloatingRisk * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-text-secondary">Stokes Drag Index</div>
            </div>

            <div className="bg-bg-inset p-2.5 rounded border border-border">
              <div className="text-[10px] text-text-muted uppercase">ANOMALY SCORE</div>
              <div className="text-lg font-bold text-status-violet">
                {(currentWell.anomalyScore * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-text-secondary">Isolation Forest</div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-bg-inset border border-border text-xs font-mono space-y-1">
            <div className="flex items-center justify-between text-[10px] text-text-muted uppercase">
              <span>DOWNHOLE CONDITIONS & VALVES:</span>
              <span className="text-status-healthy font-semibold">COUPLED TO SIMULATOR</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Plunger stroke is synchronized with the surface walking beam. Standing valve opens on the upstroke to draw {currentWell.reservoirTempC.toFixed(1)}°C heavy crude through perforations. Traveling valve opens on downstroke to displace crude into the Vacuum Insulated Tubing column.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
