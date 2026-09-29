import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  BrainCircuit, 
  Clock, 
  ShieldAlert, 
  Flame, 
  Filter,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useAlertStore } from '../store/alertStore';
import { useWellStore } from '../store/wellStore';
import { AlertSeverity } from '../types';

export const Predictions: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert } = useAlertStore();
  const { currentWell } = useWellStore();

  const [severityFilter, setSeverityFilter] = useState<'ALL' | AlertSeverity>('ALL');
  const [filterWellId, setFilterWellId] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesWell = filterWellId === 'ALL' || a.wellId === filterWellId;
    return matchesSev && matchesWell;
  });

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'TRIGGERED').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING' && a.status === 'ACTIVE').length;

  // Predictive Horizons
  const predictions = [
    {
      title: 'Thermal Decline & Viscosity Surge',
      model: 'PINN Thermal Model — SIMULATED',
      horizon: 'Next 6–18 Hours',
      confidence: 94,
      prediction: `At current cooling decay rate (τ = 9d), reservoir temperature will reach ${(currentWell.reservoirTempC - 1.2).toFixed(1)}°C, escalating crude viscosity past ${(currentWell.viscosityCp + 650).toLocaleString()} cP.`,
      hazard: 'Higher viscous resistance will increase downstroke drag by ~12%.',
      color: 'text-status-warning',
      bg: 'border-status-warning/30 bg-status-warning/5',
      icon: Flame,
    },
    {
      title: 'Rod Floating & Buckling Onset',
      model: '1D-CNN + Stokes Drag Model — SIMULATED',
      horizon: 'Next 4 Hours',
      confidence: 89,
      prediction: currentWell.rodFloatingRisk > 0.55
        ? 'Severe rod floating active. Compressive stress index is critical.'
        : `Terminal rod fall velocity approaching SRP stroke speed. Risk score is projected to cross 0.60 threshold within 4 hours at ${currentWell.spm.toFixed(1)} SPM.`,
      hazard: 'Delayed seating risks shock impact loading on traveling valve pickup.',
      color: 'text-status-critical',
      bg: 'border-status-critical/30 bg-status-critical/5',
      icon: ShieldAlert,
    },
    {
      title: 'Multivariate Operational Anomaly',
      model: 'Isolation Forest — SIMULATED',
      horizon: 'Real-Time Window',
      confidence: 91,
      prediction: `Composite anomaly score is ${(currentWell.anomalyScore * 100).toFixed(0)}%. ${
        currentWell.anomalyScore > 0.4
          ? 'Significant deviation in motor load / fillage correlation detected.'
          : 'Operating point sits within 95th percentile confidence envelope.'
      }`,
      hazard: 'Monitored across casing, tubing, motor load, and fillage features.',
      color: 'text-status-violet',
      bg: 'border-status-violet/30 bg-status-violet/5',
      icon: BrainCircuit,
    },
  ];

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <BellRing className="w-4 h-4 text-status-warning" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              AI Predictions, Anomaly Detection & Active Alarms
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-warning/15 text-status-warning border border-status-warning/30">
              PINN & ISOLATION FOREST — SIMULATED
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time alarm lifecycles, deduplication, and forward mechanical risk forecasting • Baghewala Field
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-bg-panel border border-border text-status-critical font-bold">
            {criticalCount} CRITICAL
          </span>
          <span className="px-2.5 py-1 rounded bg-bg-panel border border-border text-status-warning font-bold">
            {warningCount} WARNINGS
          </span>
          <span className="px-2.5 py-1 rounded bg-bg-panel border border-border text-status-cyan font-bold">
            {activeAlertsCount} TOTAL ACTIVE
          </span>
        </div>
      </div>

      {/* 2. Forward Predictive Forecast Horizons (Section 70) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-text-primary uppercase flex items-center space-x-1.5">
            <BrainCircuit className="w-4 h-4 text-status-violet" />
            <span>Forward AI Risk Predictions & Thermal Horizons</span>
          </span>
          <span className="text-[10px] text-text-muted">CYCLE DAY {currentWell.cycleDay.toFixed(1)} PROJECTIONS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {predictions.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`panel-scada p-3 rounded flex flex-col justify-between space-y-2 border ${p.bg}`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className={`font-bold ${p.color} flex items-center space-x-1.5`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{p.title}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-bg-panel border border-border text-status-cyan font-semibold">
                      {p.confidence}% CONF
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-text-muted flex items-center space-x-1 mb-1.5">
                    <Cpu className="w-3 h-3 text-status-violet" />
                    <span>{p.model}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-text-muted" />
                    <span>{p.horizon}</span>
                  </div>
                  <p className="text-[11px] font-mono text-text-primary leading-relaxed">
                    {p.prediction}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-text-secondary flex items-start space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0 mt-0.5" />
                  <span>{p.hazard}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="panel-scada p-2.5 rounded flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted text-[11px]">SEVERITY:</span>
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-status-critical/20 border-status-critical text-status-critical font-bold'
                    : sev === 'WARNING'
                    ? 'bg-status-warning/20 border-status-warning text-status-warning font-bold'
                    : 'bg-status-cyan/20 border-status-cyan text-status-cyan font-bold'
                  : 'border-border text-text-secondary hover:text-text-primary bg-bg-inset'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-text-muted">TARGET WELL:</span>
          <select
            value={filterWellId}
            onChange={(e) => setFilterWellId(e.target.value)}
            className="bg-bg-inset border border-border px-2 py-1 rounded text-text-primary text-xs font-mono focus:outline-none cursor-pointer"
          >
            <option value="ALL">ALL WELLS (56 WELLS)</option>
            <option value={currentWell.id}>{currentWell.id} (CURRENT WELL)</option>
            <option value="BGW-WELL-017">BGW-WELL-017 (ALARM WELL)</option>
          </select>
        </div>
      </div>

      {/* 4. Active Alarms & Deduplicated Lifecycle Table (Section 44) */}
      <div className="panel-scada p-3 rounded space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-text-primary uppercase">
            <span>Deduplicated Alarm Lifecycle Register</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">
            {filteredAlerts.length} ALERTS MATCHING FILTER
          </span>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-text-muted font-mono text-xs flex flex-col items-center justify-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-status-healthy/60" />
              <span>No alerts matching the selected criteria. System operating within nominal parameters.</span>
            </div>
          ) : (
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="text-text-muted border-b border-border text-[10px] uppercase bg-bg-inset">
                  <th className="p-2 font-medium">Timestamp</th>
                  <th className="p-2 font-medium">Well ID</th>
                  <th className="p-2 font-medium">Severity</th>
                  <th className="p-2 font-medium">Alarm Title & Physical Violation</th>
                  <th className="p-2 font-medium">Metric Value</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium text-right">Lifecycle Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-bg-inset transition-colors">
                    <td className="p-2 text-text-muted whitespace-nowrap">{alert.timestamp}</td>
                    <td className="p-2 font-bold text-status-cyan">{alert.wellId}</td>
                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-status-critical text-white'
                            : alert.severity === 'WARNING'
                            ? 'bg-status-warning text-bg'
                            : 'bg-status-blue text-white'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-2 max-w-md">
                      <div className="font-semibold text-text-primary">{alert.title}</div>
                      <div className="text-[11px] text-text-secondary mt-0.5">{alert.message}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap text-text-primary">
                      {typeof alert.currentValue === 'number'
                        ? alert.currentValue > 100
                          ? alert.currentValue.toLocaleString()
                          : alert.currentValue.toFixed(1)
                        : alert.currentValue}
                      <span className="text-[10px] text-text-muted ml-1">
                        (limit: {alert.thresholdValue})
                      </span>
                    </td>
                    <td className="p-2">
                      <span
                        className={`text-[10px] font-bold ${
                          alert.status === 'ACTIVE'
                            ? 'text-status-warning animate-pulse'
                            : alert.status === 'ACKNOWLEDGED'
                            ? 'text-status-cyan'
                            : 'text-status-healthy'
                        }`}
                      >
                        ● {alert.status}
                      </span>
                    </td>
                    <td className="p-2 text-right space-x-1.5 whitespace-nowrap">
                      {alert.status === 'ACTIVE' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-1 rounded bg-bg-panel border border-border hover:border-status-cyan text-status-cyan text-[10px] font-bold transition-colors"
                        >
                          ACKNOWLEDGE
                        </button>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-2 py-1 rounded bg-status-healthy/15 border border-status-healthy text-status-healthy text-[10px] font-bold hover:bg-status-healthy/25 transition-colors"
                        >
                          RESOLVE
                        </button>
                      )}
                      {alert.status === 'RESOLVED' && (
                        <span className="text-[10px] text-text-muted flex items-center justify-end space-x-1">
                          <CheckCircle className="w-3.5 h-3.5 text-status-healthy" />
                          <span>RESOLVED</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
