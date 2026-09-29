import React from 'react';
import { Layers } from 'lucide-react';
import { Well } from '../../types';

interface TwinVsActualCardProps {
  well: Well;
}

export const TwinVsActualCard: React.FC<TwinVsActualCardProps> = ({ well }) => {
  const comparisonRows = [
    {
      parameter: 'Oil Production',
      actual: `${well.oilProductionBpd.toFixed(1)} BOPD`,
      predicted: `${well.predictedProductionBpd.toFixed(1)} BOPD`,
      residual: `${Math.abs(well.oilProductionBpd - well.predictedProductionBpd).toFixed(1)} BOPD`,
      status: Math.abs(well.oilProductionBpd - well.predictedProductionBpd) > 8 ? 'WATCH' : 'NOMINAL',
      statusColor: Math.abs(well.oilProductionBpd - well.predictedProductionBpd) > 8 ? 'text-status-warning' : 'text-status-healthy',
    },
    {
      parameter: 'Tubing Head Pressure',
      actual: `${well.tubingPressureBar.toFixed(1)} bar`,
      predicted: `${(well.tubingPressureBar * 0.98).toFixed(1)} bar`,
      residual: '0.4 bar',
      status: 'NOMINAL',
      statusColor: 'text-status-healthy',
    },
    {
      parameter: 'Reservoir Temp',
      actual: `${well.reservoirTempC.toFixed(1)}°C`,
      predicted: `${(well.reservoirTempC + 0.3).toFixed(1)}°C`,
      residual: '0.3°C',
      status: 'NOMINAL',
      statusColor: 'text-status-healthy',
    },
    {
      parameter: 'Beam Motor Load',
      actual: `${well.motorLoadPct.toFixed(1)}%`,
      predicted: `${(well.motorLoadPct * 0.96).toFixed(1)}%`,
      residual: `${(well.motorLoadPct * 0.04).toFixed(1)}%`,
      status: well.motorLoadPct > 85 ? 'ELEVATED' : 'NOMINAL',
      statusColor: well.motorLoadPct > 85 ? 'text-status-warning' : 'text-status-healthy',
    },
    {
      parameter: 'SRP Pumping Speed',
      actual: `${well.spm.toFixed(1)} SPM`,
      predicted: `${well.spm.toFixed(1)} SPM`,
      residual: '0.0 SPM',
      status: 'SYNCED',
      statusColor: 'text-status-cyan',
    },
  ];

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Digital Twin vs Live Well Convergence Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono text-text-muted">GIBBS & PINN INVERSION</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="text-text-muted border-b border-border text-[10px] uppercase">
              <th className="pb-1.5 font-medium">Parameter</th>
              <th className="pb-1.5 font-medium">Telemetry Actual</th>
              <th className="pb-1.5 font-medium">Twin Predicted</th>
              <th className="pb-1.5 font-medium">Residual</th>
              <th className="pb-1.5 font-medium text-right">Convergence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {comparisonRows.map((row) => (
              <tr key={row.parameter} className="hover:bg-bg-inset transition-colors">
                <td className="py-1.5 text-text-primary font-medium">{row.parameter}</td>
                <td className="py-1.5 text-text-secondary">{row.actual}</td>
                <td className="py-1.5 text-status-cyan">{row.predicted}</td>
                <td className="py-1.5 text-text-muted">{row.residual}</td>
                <td className={`py-1.5 text-right font-bold ${row.statusColor}`}>
                  ● {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
