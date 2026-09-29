import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Activity,
  LineChart,
  Flame,
  SlidersHorizontal,
  BellRing,
  Wrench,
  History,
  Grid,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  FlameKindling
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { operatingMode } = useSimulationStore();

  const navItems = [
    { to: '/', label: 'Command Center', icon: LayoutDashboard },
    { to: '/digital-twin', label: 'Digital Twin', icon: Layers },
    { to: '/monitoring', label: 'Well Monitoring', icon: Activity },
    { to: '/dynocard', label: 'Dynacard Analysis', icon: LineChart },
    { to: '/css-optimizer', label: 'CSS Optimizer', icon: Flame },
    { to: '/srp-control', label: 'SRP Control', icon: SlidersHorizontal },
    { to: '/predictions', label: 'Predictions & Alerts', icon: BellRing },
    { to: '/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/analytics', label: 'Historical Analytics', icon: History },
    { to: '/fleet', label: 'Field Fleet (56 Wells)', icon: Grid },
    { to: '/executive', label: 'Executive Overview', icon: FileBarChart },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-bg-panel border-r border-border flex flex-col justify-between transition-all duration-200 select-none z-20 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="p-3 border-b border-border flex items-center justify-between">
          {!collapsed ? (
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-status-cyan/15 border border-status-cyan/40 flex items-center justify-center text-status-cyan">
                <FlameKindling className="w-5 h-5 text-status-cyan" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-mono font-bold text-sm tracking-wider text-text-primary leading-tight">
                  BAGHTWIN
                </h1>
                <p className="text-[10px] text-status-cyan font-mono leading-none">
                  Well-to-Surface Twin
                </p>
                <p className="text-[9px] text-text-muted mt-0.5 truncate leading-none">
                  Oil India • Baghewala
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded bg-status-cyan/15 border border-status-cyan/40 flex items-center justify-center text-status-cyan">
              <FlameKindling className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-border rounded text-text-secondary hover:text-text-primary transition-colors ml-1"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded px-2.5 py-2 text-xs transition-all relative group ${
                    isActive
                      ? 'bg-status-cyan/10 text-status-cyan font-medium border-l-2 border-status-cyan'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-inset'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${collapsed ? 'mx-auto' : 'mr-2.5'}`} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Block */}
      <div className="p-2.5 border-t border-border bg-bg-inset text-[10px] font-mono space-y-1">
        {!collapsed ? (
          <>
            <div className="flex items-center text-status-healthy font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-status-healthy mr-1.5 animate-pulse" />
              DIGITAL TWIN ONLINE
            </div>
            <div className="flex items-center text-status-warning">
              <span className="w-1.5 h-1.5 rounded-full bg-status-warning mr-1.5" />
              SIMULATED TELEMETRY
            </div>
            <div className="flex items-center justify-between text-text-muted pt-0.5 border-t border-border">
              <span>MODE:</span>
              <span className="text-status-cyan font-bold">{operatingMode}</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-1.5 py-1">
            <span className="w-2 h-2 rounded-full bg-status-healthy animate-pulse" title="Digital Twin Online" />
            <span className="w-2 h-2 rounded-full bg-status-warning" title="Simulated Telemetry" />
          </div>
        )}
      </div>
    </aside>
  );
};
