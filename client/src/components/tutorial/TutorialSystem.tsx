import { useEffect } from 'react';
import { TutorialProvider, useTutorial } from './TutorialContext';
import type { TutorialStep } from './TutorialContext';
import WelcomeDialog from './WelcomeDialog';
import TutorialOverlay from './TutorialOverlay';
import TutorialButton from './TutorialButton';

interface TutorialSystemProps {
  children: React.ReactNode;
  steps: TutorialStep[];
  userName?: string;
  appName?: string;
}

function TutorialSetup({ steps, userName, appName, children }: TutorialSystemProps) {
  const { setSteps } = useTutorial();

  useEffect(() => {
    setSteps(steps);
  }, [steps, setSteps]);

  return (
    <>
      {children}
      <WelcomeDialog userName={userName} appName={appName} />
      <TutorialOverlay />
      <TutorialButton />
    </>
  );
}

export default function TutorialSystem({ children, steps, userName, appName }: TutorialSystemProps) {
  return (
    <TutorialProvider>
      <TutorialSetup steps={steps} userName={userName} appName={appName}>
        {children}
      </TutorialSetup>
    </TutorialProvider>
  );
}

export type { TutorialStep };
