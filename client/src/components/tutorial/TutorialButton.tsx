import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTutorial } from './TutorialContext';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Play, RotateCcw } from 'lucide-react';

export default function TutorialButton() {
  const { isActive, setShowWelcomeDialog, hasCompletedTutorial } = useTutorial();

  const handleClick = () => {
    localStorage.removeItem('prodigy_tutorial_state');
    setShowWelcomeDialog(true);
  };

  if (isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ delay: 0.8, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleClick}
              className="h-12 rounded-lg shadow-lg shadow-primary/20 flex items-center gap-2.5 px-5 bg-primary hover:shadow-xl hover:shadow-primary/30 transition-shadow group"
              data-testid="button-start-tutorial-fab"
            >
              <motion.div
                animate={{ rotate: hasCompletedTutorial ? 0 : [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: hasCompletedTutorial ? 0 : Infinity, repeatDelay: 3 }}
              >
                {hasCompletedTutorial ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <HelpCircle className="h-4 w-4" />
                )}
              </motion.div>
              <span className="font-medium text-sm">
                {hasCompletedTutorial ? 'Restart Tour' : 'Start Tutorial'}
              </span>
              <Play className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            <p>{hasCompletedTutorial ? 'Take the guided tour again' : 'Learn the basics with a quick tour'}</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
}
