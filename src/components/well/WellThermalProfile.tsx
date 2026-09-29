import React from 'react';
import { Flame, Droplet, ShieldCheck, Thermometer } from 'lucide-react';
import { Well } from '../../types';

interface WellThermalProfileProps {
  well: Well;
}

export const WellThermalProfile: React.FC<WellThermalProfileProps> = ({ well }) => {
  // Compute depth intervals
  const depthSlices = [
    { depthM: 0, label: 'Surface Wellhead', tempC: 32.0, viscCp: 15800, loadKn: well.polishedRodLoadKn },
    { depthM: 300, label: 'Upper VIT String', tempC: 38.5, viscCp: 14200, loadKn: well.polishedRodLoadKn * 0.85 },
    { depthM: 600, label: 'Mid-Wellbore VIT', tempC: 44.0, viscCp: 12600, loadKn: well.polishedRodLoadKn * 0.68 },
    { depthM: 900, label: 'Lower Production Casing', tempC: 50.2, viscCp: 9400, loadKn: well.polishedRodLoadKn * 0.45 },
    { depthM: 1150, label: 'Perforated Pay Zone', tempC: well.reservoirTempC, viscCp: well.viscosityCp, loadKn: 24.0 },
  ];

  return (
    <div className="panel-scada p-3 rounded space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-status-warning" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Depth-Wise Thermal & Viscosity Profile (0 – 1,150 m)
          </h2>
        </div>
        <span className="text-[10px] font-mono text-status-cyan bg-bg-inset px-2 py-0.5 rounded border border-border">
          PINN NUMERICAL PROFILE
        </span>
      </div>

      {/* Slices Table */}
      <div className="space-y-1.5">
        {depthSlices.map((slice) => (
          <div
            key={slice.depthM}
            className="p-2 rounded bg-bg-inset border border-border flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center space-x-3">
              <span className="w-14 text-text-primary font-bold">{slice.depthM} m</span>
              <div>
                <div className="font-semibold text-text-secondary text-[11px]">{slice.label}</div>
                <div className="text-[10px] text-text-muted">
                  Rod Tension: {slice.loadKn.toFixed(1)} kN
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-right">
              <div>
                <div className="text-status-warning font-bold flex items-center justify-end space-x-1">
                  <Flame className="w-3 h-3 inline" />
                  <span>{slice.tempC.toFixed(1)}°C</span>
                </div>
                <div className="text-[10px] text-text-muted">TEMPERATURE</div>
              </div>

              <div>
                <div className="text-status-violet font-bold flex items-center justify-end space-x-1">
                  <Droplet className="w-3 h-3 inline" />
                  <span>{slice.viscCp.toLocaleString()} cP</span>
                </div>
                <div className="text-[10px] text-text-muted">VISCOSITY</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Thermodynamic Energy Footprint */}
      <div className="p-2.5 rounded bg-bg-inset border border-border space-y-1 text-xs font-mono">
        <div className="flex items-center justify-between text-[10px] text-text-muted uppercase">
          <span>CSS THERMAL RETENTION ENVELOPE:</span>
          <span className="text-status-healthy font-semibold">SOAK INTEGRITY OK</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          At Day {well.cycleDay.toFixed(1)} of production, heat loss along the Vacuum Insulated Tubing is ~0.42°C/100m. 
          Bottomhole pay zone temperature of {well.reservoirTempC.toFixed(1)}°C keeps crude viscosity at {well.viscosityCp.toLocaleString()} cP within the {well.heatRadiusM}m stimulation chamber.
        </p>
        <div className="flex items-center space-x-2 text-[10px] text-status-healthy pt-1 border-t border-border/50">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VIT thermal efficiency: 94.2% nominal retention.</span>
        </div>
      </div>
    </div>
  );
};
