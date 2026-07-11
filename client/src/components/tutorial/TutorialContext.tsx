import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface TutorialStep {
  id: string;
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  spotlightPadding?: number;
  action?: string;
}

interface TutorialContextType {
  isActive: boolean;
  currentStepIndex: number;
  steps: TutorialStep[];
  showWelcomeDialog: boolean;
  hasCompletedTutorial: boolean;
  isPaused: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  goToStep: (index: number) => void;
  setShowWelcomeDialog: (show: boolean) => void;
  setSteps: (steps: TutorialStep[]) => void;
  currentStep: TutorialStep | null;
  progress: number;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

const STORAGE_KEY = 'prodigy_tutorial_state';

interface StoredState {
  completed: boolean;
  currentStep: number;
  lastUpdated: number;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: StoredState = JSON.parse(stored);
        return state.completed;
      }
    } catch (e) {
      console.error('Failed to load tutorial state');
    }
    return false;
  });

  useEffect(() => {
    if (!hasCompletedTutorial) {
      const timer = setTimeout(() => {
        setShowWelcomeDialog(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTutorial]);

  const saveState = useCallback((completed: boolean, step: number) => {
    try {
      const state: StoredState = {
        completed,
        currentStep: step,
        lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save tutorial state');
    }
  }, []);

  const startTutorial = useCallback(() => {
    setShowWelcomeDialog(false);
    setCurrentStepIndex(0);
    setIsActive(true);
    setIsPaused(false);
    saveState(false, 0);
  }, [saveState]);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setCurrentStepIndex(0);
    setHasCompletedTutorial(true);
    saveState(true, 0);
  }, [saveState]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      saveState(false, newIndex);
    } else {
      endTutorial();
    }
  }, [currentStepIndex, steps.length, endTutorial, saveState]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      saveState(false, newIndex);
    }
  }, [currentStepIndex, saveState]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      saveState(false, index);
    }
  }, [steps.length, saveState]);

  const skipTutorial = useCallback(() => {
    setShowWelcomeDialog(false);
    setIsActive(false);
    setIsPaused(false);
    saveState(true, 0);
    setHasCompletedTutorial(true);
  }, [saveState]);

  const pauseTutorial = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTutorial = useCallback(() => {
    setIsPaused(false);
  }, []);

  const currentStep = isActive && steps[currentStepIndex] ? steps[currentStepIndex] : null;
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        isPaused,
        currentStepIndex,
        steps,
        showWelcomeDialog,
        hasCompletedTutorial,
        startTutorial,
        endTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        pauseTutorial,
        resumeTutorial,
        goToStep,
        setShowWelcomeDialog,
        setSteps,
        currentStep,
        progress,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
