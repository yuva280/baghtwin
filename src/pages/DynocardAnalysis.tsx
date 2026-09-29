import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Sliders, RotateCcw } from 'lucide-react';
import { useWellStore } from '../store/wellStore';
import { useSimulationStore } from '../store/simulationStore';
import { DynacardEngine } from '../sim/dynocard';
import { simulatorInstance } from '../sim/simulator';
import { DynacardCanvas } from '../components/dynocard/DynacardCanvas';
import { ClassifierPanel } from '../components/dynocard/ClassifierPanel';
import { FaultInjectionBar } from '../components/dynocard/FaultInjectionBar';
import { GibbsReconstructionCard } from '../components/dynocard/GibbsReconstructionCard';
import { DynacardPoint } from '../types';

export const DynocardAnalysis: React.FC = () => {
  const { currentWell } = useWellStore();
  const { activeFault } = useSimulationStore();
  const [showIdealOverlay, setShowIdealOverlay] = useState(false);

  // Active fault to display (priority: manual activeFault, else well.faultClass)
  const currentFault = activeFault || currentWell.faultClass || 'NORMAL';

  // Dynacard points with smooth morphing transition (Section 40)
  const [displayedSurfacePoints, setDisplayedSurfacePoints] = useState<DynacardPoint[]>(() =>
    DynacardEngine.generateSurfaceCard(currentFault, currentWell.viscosityCp, currentWell.spm)
  );

  const prevPointsRef = useRef<DynacardPoint[]>(displayedSurfacePoints);
  const targetPointsRef = useRef<DynacardPoint[]>(displayedSurfacePoints);
  const animationStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // When fault, viscosity, or SPM changes, morph smoothly over 1.2 seconds
  useEffect(() => {
    const newTarget = DynacardEngine.generateSurfaceCard(
      currentFault,
      currentWell.viscosityCp,
      currentWell.spm
    );
    prevPointsRef.current = displayedSurfacePoints;
    targetPointsRef.current = newTarget;
    animationStartTimeRef.current = performance.now();

    const durationMs = 1200; // 1.2s smooth morph

    const animate = (time: number) => {
      const elapsed = time - animationStartTimeRef.current;
      const progress = Math.min(1.0, elapsed / durationMs);

      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const interpolated = DynacardEngine.interpolateCards(
        prevPointsRef.current,
        targetPointsRef.current,
        ease
      );
      setDisplayedSurfacePoints(interpolated);

      if (progress < 1.0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentFault, currentWell.viscosityCp, currentWell.spm]);

  // Compute downhole card from current displayed surface card
  const displayedDownholePoints = DynacardEngine.generateDownholeCard(
    displayedSurfacePoints,
    currentFault
  );

  // Ideal baseline card for overlay comparison
  const idealSurfaceCard = DynacardEngine.generateSurfaceCard('NORMAL', 5000, 5.0);

  // 1D-CNN classification metrics
  const classification = DynacardEngine.classifyDynacard(currentFault);

  // Quick corrective action handler
  const handleQuickTrim = () => {
    const targetSPM = Math.max(3.8, Math.round((currentWell.spm - 1.2) * 10) / 10);
    simulatorInstance.setTargetSPM(targetSPM);
  };

  const handleResetNominal = () => {
    simulatorInstance.setTargetSPM(5.8);
    useSimulationStore.getState().setActiveFault('NORMAL');
  };

  return (
    <div className="space-y-3.5 max-w-[1720px] mx-auto pb-6">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-status-cyan" />
            <h1 className="text-base lg:text-lg font-bold tracking-wide text-text-primary">
              Dynamometer Card Analysis & AI Classification
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-cyan/15 text-status-cyan border border-status-cyan/30">
              P0 HERO
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Surface and Downhole (Gibbs Wave) Dynacards with simulated 1D-CNN classification and fault injection.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <label className="flex items-center space-x-1.5 cursor-pointer select-none text-text-secondary hover:text-text-primary">
            <input
              type="checkbox"
              checked={showIdealOverlay}
              onChange={(e) => setShowIdealOverlay(e.target.checked)}
              className="rounded bg-bg-inset border-border text-status-cyan focus:ring-0 cursor-pointer"
            />
            <span>Overlay Ideal Card (5.0 SPM)</span>
          </label>

          <span className="px-2.5 py-1 rounded bg-bg-panel border border-border text-status-cyan font-bold">
            {currentWell.id}
          </span>
        </div>
      </div>

      {/* 2. Fault Injection Control Bar (Section 42 & 58) */}
      <FaultInjectionBar activeFault={activeFault} />

      {/* 3. Primary Two-Card Comparison (Section 57: Left Surface, Right Downhole) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <DynacardCanvas
          title="Surface Dynamometer Card"
          points={displayedSurfacePoints}
          strokeLengthM={currentWell.strokeLengthM}
          color="#22D3EE"
          type="SURFACE"
          idealPoints={idealSurfaceCard}
          showIdealOverlay={showIdealOverlay}
        />
        <DynacardCanvas
          title="Downhole Plunger Pump Card"
          points={displayedDownholePoints}
          strokeLengthM={currentWell.strokeLengthM}
          color="#A78BFA"
          type="DOWNHOLE"
        />
      </div>

      {/* 4. Corrective Action & Control Ribbon (If Risk or Fault Active) */}
      {(currentWell.rodFloatingRisk > 0.55 || (activeFault && activeFault !== 'NORMAL')) && (
        <div className="panel-scada p-3 rounded border-status-warning/50 bg-status-warning/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-status-warning animate-ping" />
            <span className="text-status-warning font-bold uppercase">
              Abnormal Dynacard Signature Active:
            </span>
            <span className="text-text-secondary">
              Downstroke mechanical stress detected. Closed-loop safety limiter active (Max ±0.5 SPM/min).
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0 text-xs font-mono">
            <button
              onClick={handleQuickTrim}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-status-cyan text-bg font-bold shadow hover:brightness-110 active:scale-95 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>APPLY RECOMMENDED SPM TRIM (-1.2 SPM)</span>
            </button>
            <button
              onClick={handleResetNominal}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded border border-border text-text-muted hover:text-text-primary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Classification & Reconstruction Technical Row (Section 41 & 39) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        <ClassifierPanel
          confidences={classification.confidences}
          predictedFault={currentFault}
          inferenceTimeMs={classification.inferenceTimeMs}
          viscosityCp={currentWell.viscosityCp}
          motorLoadPct={currentWell.motorLoadPct}
          pumpFillagePct={currentWell.pumpFillagePct}
          rodFloatingRisk={currentWell.rodFloatingRisk}
        />
        <GibbsReconstructionCard well={currentWell} />
      </div>
    </div>
  );
};
