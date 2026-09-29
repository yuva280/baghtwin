import React from 'react';
import { 
  FileBarChart, 
  TrendingUp, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  Award
} from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { TOTAL_WELLS, ACTIVE_PRODUCING_WELLS } from '../constants';

export const Executive: React.FC = () => {
  const { wells } = useWellStore();

  const totalProd = wells.reduce((sum, w) => sum + (w.status === 'PRODUCING' ? w.oilProductionBpd : 0), 0);
  const alarmCount = wells.filter((w) => w.status === 'ALARM').length;

  const valuePillars = [
    {
      title: 'Workover Avoidance & Mechanical Integrity',
      impact: '3 Workovers Averted',
      annualizedSavings: '$126,000 / Year',
      desc: 'Proactive SPM downstroke rate control mitigates compressive rod floating and prevents parted sucker rod workovers (saving 14 days of rig downtime per event).',
      icon: ShieldCheck,
      color: 'text-status-healthy',
      border: 'border-status-healthy/40',
    },
    {
      title: 'Steam-Oil Ratio (SOR) Optimization',
      impact: '-9.4% Steam Fuel Reduction',
      annualizedSavings: '$198,000 / Year',
      desc: 'NSGA-II multi-objective cycle designer optimizes steam injection volume (1,450 m³) and soak periods, lowering SOR from 3.42 to 3.10 m³/m³.',
      icon: Flame,
      color: 'text-status-warning',
      border: 'border-status-warning/40',
    },
    {
      title: 'Heavy Oil Production Stabilization',
      impact: '+4.2% Net Crude Deliverability',
      annualizedSavings: '+$312,000 / Year',
      desc: 'PINN thermal decline forecast prevents premature pumping unit thermal cutoff, sustaining optimal heavy oil inflow throughout the 35–45 day production cycle.',
      icon: TrendingUp,
      color: 'text-status-cyan',
      border: 'border-status-cyan/40',
    },
  ];

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <FileBarChart className="w-4 h-4 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Executive Field Summary & Economic Impact Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              PROTOTYPE ESTIMATE • SIH 2026
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            High-level operational return on investment (ROI), asset reliability, and thermal recovery optimization • Baghewala Field
          </p>
        </div>

        <span className="text-xs font-mono text-status-warning">
          ● DEMO MODE EVALUATION
        </span>
      </div>

      {/* 2. Executive Hero KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="panel-scada p-4 rounded space-y-1">
          <div className="text-[11px] text-text-muted uppercase font-medium">TOTAL FLEET PRODUCTION</div>
          <div className="text-3xl font-bold text-text-primary">
            {Math.round(totalProd).toLocaleString()} <span className="text-sm font-normal text-text-muted">BOPD</span>
          </div>
          <div className="text-[11px] text-status-healthy flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 inline" />
            <span>+4.2% AI Lift Optimization</span>
          </div>
        </div>

        <div className="panel-scada p-4 rounded space-y-1">
          <div className="text-[11px] text-text-muted uppercase font-medium">ASSET UTILIZATION</div>
          <div className="text-3xl font-bold text-status-healthy">
            {ACTIVE_PRODUCING_WELLS} / {TOTAL_WELLS}
          </div>
          <div className="text-[11px] text-text-secondary">
            60.7% Producing • {alarmCount} in Alarm
          </div>
        </div>

        <div className="panel-scada p-4 rounded space-y-1">
          <div className="text-[11px] text-text-muted uppercase font-medium">AVERAGE FLEET SOR</div>
          <div className="text-3xl font-bold text-status-cyan">
            3.24 <span className="text-sm font-normal text-text-muted">m³/m³</span>
          </div>
          <div className="text-[11px] text-status-healthy">
            ▼ -0.38 vs Conventional CSS
          </div>
        </div>

        <div className="panel-scada p-4 rounded space-y-1">
          <div className="text-[11px] text-text-muted uppercase font-medium">ESTIMATED ANNUAL ROI</div>
          <div className="text-3xl font-bold text-status-violet">
            $636,000 <span className="text-sm font-normal text-text-muted">/ yr</span>
          </div>
          <div className="text-[11px] text-status-healthy">
            Payback Period: ~4.2 Months
          </div>
        </div>
      </div>

      {/* 3. Three Strategic Value Pillars (Section 74) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-bold text-text-primary uppercase flex items-center space-x-1.5">
            <Award className="w-4 h-4 text-status-cyan" />
            <span>Digital Twin Core Value Pillars (SIH 2026 Problem Statement 26120)</span>
          </span>
          <span className="text-[10px] text-text-muted">OIL INDIA LIMITED ASSET</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {valuePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className={`panel-scada p-4 rounded flex flex-col justify-between space-y-3 border ${pillar.border} bg-bg-panel`}
              >
                <div>
                  <div className="flex items-center space-x-2 border-b border-border pb-2 mb-2">
                    <Icon className={`w-4 h-4 ${pillar.color}`} />
                    <h3 className="text-xs font-mono font-bold text-text-primary">{pillar.title}</h3>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className={`text-base font-mono font-bold ${pillar.color}`}>
                      {pillar.impact}
                    </span>
                    <span className="text-xs font-mono font-bold text-status-healthy">
                      {pillar.annualizedSavings}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-text-secondary leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono text-text-muted">
                  <span>Status: Active Verification</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-healthy" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Strategic Comparison: Traditional Operation vs BaghTwin AI Digital Twin */}
      <div className="panel-scada p-4 rounded space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <h2 className="text-xs font-mono font-bold uppercase text-text-primary">
            Operational Paradigm Comparison: Traditional vs BaghTwin Digital Twin
          </h2>
          <span className="text-[10px] font-mono text-status-cyan">FIELD TRANSFORMATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Traditional Operation */}
          <div className="p-3 rounded bg-bg-inset border border-border space-y-2 text-xs font-mono">
            <div className="text-status-warning font-bold flex items-center space-x-1.5">
              <span>TRADITIONAL FIELD OPERATIONS (REACTIVE)</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-text-secondary pl-3 list-disc">
              <li>SRP speed set once at fixed 6.0–6.5 SPM without thermal dynamic adaptation.</li>
              <li>Reservoir cooling causes viscosity surges unnoticed until rod parting or fluid pound occurs.</li>
              <li>Dynacards inspected manually once a month via portable dynamometer trucks.</li>
              <li>Steam cycle volume set by rule of thumb, leading to premature thermal breakthrough and high SOR (&gt;3.6).</li>
              <li>Unplanned workover downtime averages 14–21 days per rod parting event.</li>
            </ul>
          </div>

          {/* BaghTwin Digital Twin */}
          <div className="p-3 rounded bg-status-cyan/5 border border-status-cyan/40 space-y-2 text-xs font-mono">
            <div className="text-status-cyan font-bold flex items-center space-x-1.5">
              <span>BAGHTWIN CLOSED-LOOP DIGITAL TWIN (PREDICTIVE)</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-text-primary pl-3 list-disc">
              <li>Real-time PINN thermal tracking correlates cooling with Walther viscosity dynamics.</li>
              <li>Continuous 1D-CNN dynacard classifier detects rod floating 4–8 hours before mechanical impact.</li>
              <li>Advisory / supervised SPM rate-limited trim (±0.5 SPM/min) maintains full barrel fillage safely.</li>
              <li>NSGA-II multi-objective Pareto front identifies optimal steam-soak trade-offs, saving ~350 m³ steam per cycle.</li>
              <li>Zero uncommanded mechanical trips; MTBF increases from 140 to 180+ operating days.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
