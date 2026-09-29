import React from 'react';
import { CheckCircle, BellRing, ShieldCheck } from 'lucide-react';
import { useAlertStore } from '../../store/alertStore';

interface EventFeedProps {
  wellId: string;
}

export const EventFeed: React.FC<EventFeedProps> = ({ wellId }) => {
  const { alerts, acknowledgeAlert } = useAlertStore();

  const wellAlerts = alerts.filter((a) => a.wellId === wellId);

  return (
    <div className="panel-scada p-3 rounded flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center space-x-2">
          <BellRing className="w-4 h-4 text-status-warning" />
          <h2 className="text-xs font-mono font-bold tracking-wide text-text-primary uppercase">
            Live Telemetry Alarms & Sequence of Events
          </h2>
        </div>
        <span className="text-[10px] font-mono text-status-cyan">
          {wellAlerts.length} LOGGED
        </span>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {wellAlerts.length === 0 ? (
          <div className="p-4 text-center text-text-muted font-mono text-xs flex flex-col items-center justify-center space-y-1">
            <ShieldCheck className="w-6 h-6 text-status-healthy/60" />
            <span>All operating metrics nominal. Zero active alarms.</span>
          </div>
        ) : (
          wellAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-2 rounded border text-xs font-mono flex items-start justify-between space-x-2 transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'bg-status-critical/10 border-status-critical/40 text-text-primary'
                  : alert.severity === 'WARNING'
                  ? 'bg-status-warning/10 border-status-warning/40 text-text-primary'
                  : 'bg-bg-inset border-border text-text-secondary'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-status-critical text-white'
                        : 'bg-status-warning text-bg'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="font-semibold text-text-primary text-[11px]">{alert.title}</span>
                  <span className="text-text-muted text-[10px]">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] text-text-secondary">{alert.message}</p>
              </div>

              {alert.status === 'ACTIVE' && (
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="px-2 py-1 text-[10px] shrink-0 rounded bg-bg-panel border border-border hover:border-status-cyan text-status-cyan font-bold transition-colors"
                >
                  ACK
                </button>
              )}
              {alert.status === 'ACKNOWLEDGED' && (
                <span className="text-[10px] shrink-0 text-text-muted flex items-center space-x-0.5">
                  <CheckCircle className="w-3 h-3 text-status-healthy" />
                  <span>ACKED</span>
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
