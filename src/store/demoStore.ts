import { create } from 'zustand';
import { TOUR_STEPS } from '../demo/tourSteps';

interface DemoStoreState {
  isDemoActive: boolean;
  currentStepIndex: number;
  isAutoPlaying: boolean;
  secondsRemaining: number;
  startDemo: () => void;
  stopDemo: () => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleAutoPlay: () => void;
  setStep: (index: number) => void;
  tickCountdown: () => void;
}

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  isDemoActive: false,
  currentStepIndex: 0,
  isAutoPlaying: false,
  secondsRemaining: TOUR_STEPS[0].durationSeconds,

  startDemo: () => {
    TOUR_STEPS[0].action();
    set({
      isDemoActive: true,
      currentStepIndex: 0,
      isAutoPlaying: true,
      secondsRemaining: TOUR_STEPS[0].durationSeconds,
    });
  },

  stopDemo: () => {
    set({ isDemoActive: false, isAutoPlaying: false });
  },

  nextStep: () => {
    const nextIdx = (get().currentStepIndex + 1) % TOUR_STEPS.length;
    TOUR_STEPS[nextIdx].action();
    set({
      currentStepIndex: nextIdx,
      secondsRemaining: TOUR_STEPS[nextIdx].durationSeconds,
    });
  },

  prevStep: () => {
    const prevIdx = Math.max(0, get().currentStepIndex - 1);
    TOUR_STEPS[prevIdx].action();
    set({
      currentStepIndex: prevIdx,
      secondsRemaining: TOUR_STEPS[prevIdx].durationSeconds,
    });
  },

  toggleAutoPlay: () => {
    set((state) => ({ isAutoPlaying: !state.isAutoPlaying }));
  },

  setStep: (index: number) => {
    const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, index));
    TOUR_STEPS[clamped].action();
    set({
      currentStepIndex: clamped,
      secondsRemaining: TOUR_STEPS[clamped].durationSeconds,
    });
  },

  tickCountdown: () => {
    const { isDemoActive, isAutoPlaying, secondsRemaining, currentStepIndex } = get();
    if (!isDemoActive || !isAutoPlaying) return;

    if (secondsRemaining <= 1) {
      const nextIdx = currentStepIndex + 1;
      if (nextIdx >= TOUR_STEPS.length) {
        // Reached end of tour: pause or loop
        set({ isAutoPlaying: false, secondsRemaining: 0 });
      } else {
        TOUR_STEPS[nextIdx].action();
        set({
          currentStepIndex: nextIdx,
          secondsRemaining: TOUR_STEPS[nextIdx].durationSeconds,
        });
      }
    } else {
      set({ secondsRemaining: secondsRemaining - 1 });
    }
  },
}));
