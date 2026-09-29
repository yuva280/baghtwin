import React from 'react';
import { History, UserCheck, Cpu, ArrowRight } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const SrpAuditLog: React.FC = () => {
  const { auditLog } = useSimulationStore();

  return (
    <div className="panel-scada p-3 rounded space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-status-cyan" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            SRP VFD Control Action & Safety Interlock Audit Trail
          </h2>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          {auditLog.length} EVENTS RECORDED
        </span>
      </div>

      <div className="overflow-x-auto max-h-56 overflow-y-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="text-text-muted border-b border-border text-[10px] uppercase bg-bg-inset">
              <th className="p-2 font-medium">Timestamp</th>
              <th className="p-2 font-medium">Parameter</th>
              <th className="p-2 font-medium">Old Value</th>
              <th className="p-2 font-medium">New Value</th>
              <th className="p-2 font-medium">Trigger / Engineering Rationale</th>
              <th className="p-2 font-medium">Applied By</th>
              <th className="p-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {auditLog.map((entry) => (
              <tr key={entry.id} className="hover:bg-bg-inset transition-colors">
                <td className="p-2 text-text-muted whitespace-nowrap">{entry.timestamp}</td>
                <td className="p-2 text-text-primary font-semibold">{entry.parameter}</td>
                <td className="p-2 text-text-secondary">
                  {entry.oldValue.toFixed(1)} {entry.unit}
                </td>
                <td className="p-2 font-bold text-status-cyan flex items-center space-x-1">
                  <ArrowRight className="w-3 h-3 text-text-muted inline" />
                  <span>{entry.newValue.toFixed(1)} {entry.unit}</span>
                </td>
                <td className="p-2 text-text-secondary max-w-xs truncate" title={entry.trigger}>
                  {entry.trigger}
                </td>
                <td className="p-2">
                  <span
                    className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      entry.appliedBy === 'TWIN'
                        ? 'bg-status-violet/15 text-status-violet border border-status-violet/30'
                        : 'bg-status-cyan/15 text-status-cyan border border-status-cyan/30'
                    }`}
                  >
                    {entry.appliedBy === 'TWIN' ? (
                      <Cpu className="w-2.5 h-2.5 mr-0.5" />
                    ) : (
                      <UserCheck className="w-2.5 h-2.5 mr-0.5" />
                    )}
                    <span>{entry.appliedBy}</span>
                  </span>
                </td>
                <td className="p-2 text-right">
                  <span className="text-status-healthy font-semibold text-[10px]">
                    ● {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
