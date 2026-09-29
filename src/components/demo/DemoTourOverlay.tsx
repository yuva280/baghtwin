import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';
import { useDemoStore } from '../../store/demoStore';
import { TOUR_STEPS } from '../../demo/tourSteps';

export const DemoTourOverlay: React.FC = () => {
  const {
    isDemoActive,
    currentStepIndex,
    isAutoPlaying,
    secondsRemaining,
    stopDemo,
    nextStep,
    prevStep,
    setStep,
    toggleAutoPlay,
    tickCountdown,
  } = useDemoStore();

  const navigate = useNavigate();
  const location = useLocation();
  const [showTechDetails, setShowTechDetails] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex % TOUR_STEPS.length];

  // Synchronize route when step changes
  useEffect(() => {
    if (!isDemoActive || !currentStep) return;
    if (location.pathname !== currentStep.route) {
      navigate(currentStep.route);
    }
  }, [isDemoActive, currentStepIndex, currentStep, location.pathname, navigate]);

  // Central 1-second auto-play ticker
  useEffect(() => {
    if (!isDemoActive || !isAutoPlaying) return;
    const interval = setInterval(() => {
      tickCountdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [isDemoActive, isAutoPlaying, tickCountdown]);

  if (!isDemoActive || !currentStep) return null;

  const stageColors: Record<string, { bg: string; text: string; border: string }> = {
    MONITOR: { bg: 'bg-status-cyan/15', text: 'text-status-cyan', border: 'border-status-cyan/40' },
    PREDICT: { bg: 'bg-status-warning/15', text: 'text-status-warning', border: 'border-status-warning/40' },
    DETECT: { bg: 'bg-status-critical/15', text: 'text-status-critical', border: 'border-status-critical/40' },
    RECOMMEND: { bg: 'bg-status-violet/15', text: 'text-status-violet', border: 'border-status-violet/40' },
    CONTROL: { bg: 'bg-status-warning/15', text: 'text-status-warning', border: 'border-status-warning/40' },
    RECOVERY: { bg: 'bg-status-healthy/15', text: 'text-status-healthy', border: 'border-status-healthy/40' },
    OPTIMIZE: { bg: 'bg-status-cyan/15', text: 'text-status-cyan', border: 'border-status-cyan/40' },
    EXECUTIVE: { bg: 'bg-status-healthy/15', text: 'text-status-healthy', border: 'border-status-healthy/40' },
    SURVEILLANCE: { bg: 'bg-status-blue/15', text: 'text-status-blue', border: 'border-status-blue/40' },
  };

  const style = stageColors[currentStep.stage] || stageColors.MONITOR;

  return (
    <div className="fixed bottom-3 right-3 sm:right-6 z-50 max-w-xl w-[calc(100vw-24px)] sm:w-full transition-all duration-300">
      <div className="bg-bg-panel/95 backdrop-blur-md border-2 border-status-cyan/60 shadow-[0_8px_30px_rgb(0,0,0,0.8)] rounded-xl overflow-hidden">
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 bg-bg-inset border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-cyan" />
            </span>
            <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wide flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-status-cyan" />
              <span>JUDGE TOUR: BAGHTWIN DIGITAL TWIN</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${style.bg} ${style.text} ${style.border}`}>
              {currentStep.stage}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              title={isMinimized ? 'Expand tour view' : 'Minimize tour banner'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={stopDemo}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-border transition-colors"
              title="Close Guided Demo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimized View Strip */}
        {isMinimized ? (
          <div className="px-4 py-2 flex items-center justify-between text-xs font-mono">
            <div className="truncate mr-2">
              <span className="text-status-cyan font-bold mr-2">
                STEP {currentStepIndex + 1}/{TOUR_STEPS.length}:
              </span>
              <span className="text-text-primary font-semibold">{currentStep.title}</span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={toggleAutoPlay}
                className="px-2 py-0.5 rounded text-[10px] border border-border text-status-cyan hover:bg-status-cyan/10"
              >
                {isAutoPlaying ? `PLAYING (${secondsRemaining}s)` : 'PAUSED'}
              </button>
              <button onClick={prevStep} className="p-1 rounded hover:bg-border text-text-secondary">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={nextStep} className="p-1 rounded bg-status-cyan text-bg hover:brightness-110">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Tour Card Body */
          <div className="p-3.5 space-y-3">
            {/* Step & Progress Indicators */}
            <div className="flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-text-secondary">
                  STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
                </span>
                <span className="text-border-highlight">|</span>
                <span className="text-status-cyan">{currentStep.subtitle}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-text-muted">
                  {Math.round(((currentStepIndex + 1) / TOUR_STEPS.length) * 100)}%
                </span>
                {isAutoPlaying && (
                  <span className="px-1.5 py-0.2 rounded bg-status-warning/15 text-status-warning font-bold text-[10px]">
                    NEXT IN {secondsRemaining}s
                  </span>
                )}
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h3 className="text-sm font-bold text-text-primary font-mono flex items-center space-x-1.5">
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Technical Detail Collapsible (For SIH Judges) */}
            <div className="rounded border border-border bg-bg-inset/70 p-2.5 space-y-1.5">
              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="w-full flex items-center justify-between text-[10px] font-mono text-status-cyan hover:underline font-semibold"
              >
                <span className="flex items-center space-x-1">
                  <Cpu className="w-3 h-3 text-status-cyan" />
                  <span>TECHNICAL DOMAIN EXPLANATION (SIH 2026 JUDGING NOTES)</span>
                </span>
                {showTechDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showTechDetails && (
                <p className="text-[11px] font-mono text-text-muted leading-relaxed border-t border-border/50 pt-1.5">
                  {currentStep.technicalNote}
                </p>
              )}
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center justify-center space-x-1 pt-1">
              {TOUR_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setStep(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-status-cyan'
                      : idx < currentStepIndex
                      ? 'w-2 bg-status-cyan/40'
                      : 'w-2 bg-border hover:bg-text-muted'
                  }`}
                  title={step.title}
                />
              ))}
            </div>

            {/* Action Buttons & Playback Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={toggleAutoPlay}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-medium border transition-all ${
                    isAutoPlaying
                      ? 'bg-status-warning/20 border-status-warning text-status-warning shadow'
                      : 'border-border text-text-secondary hover:text-text-primary bg-bg-inset'
                  }`}
                  title={isAutoPlaying ? 'Pause automatic step advancement' : 'Resume automatic step advancement (7–9s per step)'}
                >
                  {isAutoPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isAutoPlaying ? `PAUSE (${secondsRemaining}s)` : 'AUTO PLAY'}</span>
                </button>
                <button
                  onClick={() => setStep(0)}
                  className="p-1 rounded text-text-muted hover:text-text-primary border border-border hover:bg-border transition-colors"
                  title="Restart tour from Step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="px-2.5 py-1 text-xs font-mono rounded border border-border text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  PREV
                </button>
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-1 px-3 py-1 text-xs font-mono font-bold rounded bg-status-cyan text-bg hover:brightness-110 active:scale-95 shadow transition-all"
                >
                  <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'FINISH' : 'NEXT STEP'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
