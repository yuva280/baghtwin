import React, { useState } from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { useSimulationStore } from '../store/simulationStore';
import { mockService, CSSOptimizationCandidate } from '../services/mockService';
import { CssTimeline } from '../components/css/CssTimeline';
import { CssControls } from '../components/css/CssControls';
import { ParetoFrontChart } from '../components/css/ParetoFrontChart';
import { CssEconomicsCard } from '../components/css/CssEconomicsCard';
import { ProductionVsSteamChart } from '../components/css/ProductionVsSteamChart';

export const CSSOptimizer: React.FC = () => {
  const { currentWell, updateCurrentWell } = useWellStore();
  const { addAuditEntry } = useSimulationStore();

  // Optimization input states
  const [steamVolume, setSteamVolume] = useState<number>(currentWell.steamInjectedM3 || 1450);
  const [injectionPressure, setInjectionPressure] = useState<number>(currentWell.injectionPressureBar || 85);
  const [soakDays, setSoakDays] = useState<number>(currentWell.soakDays || 5.0);
  const [viscosityCutoff, setViscosityCutoff] = useState<number>(11500);

  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<CSSOptimizationCandidate[]>(() =>
    mockService.getCSSOptimization(currentWell.id)
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('OPT-2');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  // Run NSGA-II optimization simulation
  const handleRunOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      // Re-evaluate candidates based on current slider inputs
      const updatedCandidates: CSSOptimizationCandidate[] = [
        {
          id: 'OPT-1',
          steamVolumeM3: Math.max(800, steamVolume - 350),
          injectionPressureBar: Math.max(65, injectionPressure - 5),
          soakDays: Math.max(2.5, soakDays - 1.0),
          estimatedOilBbl: 3200,
          estimatedSOR: 3.75,
          paretoRank: 2,
          isRecommended: false,
        },
        {
          id: 'OPT-2',
          steamVolumeM3: steamVolume,
          injectionPressureBar: injectionPressure,
          soakDays: soakDays,
          estimatedOilBbl: 4680,
          estimatedSOR: 3.10, // Optimal Pareto trade-off
          paretoRank: 1,
          isRecommended: true,
        },
        {
          id: 'OPT-3',
          steamVolumeM3: Math.min(2000, steamVolume + 350),
          injectionPressureBar: Math.min(105, injectionPressure + 10),
          soakDays: Math.min(7.0, soakDays + 1.5),
          estimatedOilBbl: 5350,
          estimatedSOR: 3.38,
          paretoRank: 1,
          isRecommended: false,
        },
      ];
      setCandidates(updatedCandidates);
      setIsOptimizing(false);
    }, 1000);
  };

  // Apply selected candidate to well state and simulator
  const handleApplyCandidate = (candidate: CSSOptimizationCandidate) => {
    updateCurrentWell({
      steamInjectedM3: candidate.steamVolumeM3,
      injectionPressureBar: candidate.injectionPressureBar,
      soakDays: candidate.soakDays,
      sor: candidate.estimatedSOR,
    });

    addAuditEntry({
      id: `AUD-CSS-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      parameter: 'CSS Cycle Optimization',
      oldValue: currentWell.steamInjectedM3,
      newValue: candidate.steamVolumeM3,
      unit: 'm³ steam',
      trigger: `NSGA-II Pareto trade-off applied (SOR: ${candidate.estimatedSOR.toFixed(2)})`,
      appliedBy: 'OPERATOR',
      status: 'APPLIED',
    });

    setAppliedNotice(
      `✓ Candidate ${candidate.id} applied: Steam ${candidate.steamVolumeM3} m³, Soak ${candidate.soakDays}d, Target SOR ${candidate.estimatedSOR.toFixed(2)} synchronized across Digital Twin!`
    );

    setTimeout(() => {
      setAppliedNotice(null);
    }, 4500);
  };

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-status-warning" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              CSS Cycle Optimizer & Steam-Oil Ratio Analytics
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              P0 HERO
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Cyclic Steam Stimulation multi-objective optimization (NSGA-II Pareto Front) • Baghewala Field
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-bg-panel border border-border rounded">
            <span className="text-text-secondary">ASSET:</span>
            <span className="text-status-cyan font-bold">{currentWell.id}</span>
            <span className="text-border-highlight">|</span>
            <span className="text-text-muted">CURRENT SOR:</span>
            <span className="text-status-warning font-bold">{currentWell.sor.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Notification Toast */}
      {appliedNotice && (
        <div className="p-3 rounded bg-status-healthy/15 border border-status-healthy text-status-healthy text-xs font-mono flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{appliedNotice}</span>
        </div>
      )}

      {/* 2. Timeline Sequence (Section 65) */}
      <CssTimeline well={currentWell} />

      {/* 3. Controls & Pareto Front Row (Section 66 & 67) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <CssControls
          steamVolume={steamVolume}
          setSteamVolume={setSteamVolume}
          injectionPressure={injectionPressure}
          setInjectionPressure={setInjectionPressure}
          soakDays={soakDays}
          setSoakDays={setSoakDays}
          viscosityCutoff={viscosityCutoff}
          setViscosityCutoff={setViscosityCutoff}
          isOptimizing={isOptimizing}
          onRunOptimization={handleRunOptimization}
        />
        <ParetoFrontChart
          candidates={candidates}
          selectedCandidateId={selectedCandidateId}
          onSelectCandidate={setSelectedCandidateId}
          onApplyCandidate={handleApplyCandidate}
        />
      </div>

      {/* 4. Production vs Steam & Economics Row (Section 68 & 69) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <ProductionVsSteamChart currentSteamVolume={steamVolume} />
        <CssEconomicsCard well={currentWell} targetSOR={3.10} />
      </div>
    </div>
  );
};
