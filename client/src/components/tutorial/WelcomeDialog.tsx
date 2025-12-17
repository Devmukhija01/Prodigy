import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTutorial } from './TutorialContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface WelcomeDialogProps {
  userName?: string;
  appName?: string;
}

export default function WelcomeDialog({ userName = 'User', appName = 'Dashboard' }: WelcomeDialogProps) {
  const { showWelcomeDialog, setShowWelcomeDialog, startTutorial, skipTutorial } = useTutorial();

  return (
    <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
      <DialogContent 
        className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-2xl"
        data-testid="dialog-welcome"
        aria-describedby="welcome-dialog-description"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Welcome to the application</DialogTitle>
          <DialogDescription id="welcome-dialog-description">
            Take a guided tour to learn about the application features
          </DialogDescription>
        </VisuallyHidden.Root>
        <AnimatePresence>
          {showWelcomeDialog && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-2/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                {/* <button
                  onClick={skipTutorial}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted/50 transition-colors"
                  data-testid="button-close-welcome"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button> */}.
                <button onClick={skipTutorial}> <X className='h-4 w-4 text-muted-foreground'/></button>

                <div className="relative z-10 px-8 py-10">
                  <div className="text-center space-y-6">
                    <motion.div 
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25"
                      animate={{ 
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    >
                      <motion.span 
                        className="text-4xl"
                        initial={{ rotate: 0 }}
                        animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                        transition={{ 
                          duration: 2.5,
                          ease: "easeInOut",
                          times: [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1],
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        👋
                      </motion.span>
                    </motion.div>

                    <div className="space-y-3">
                      <motion.h2 
                        className="text-2xl font-bold text-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Hi {userName}, Welcome to {appName}
                      </motion.h2>
                      
                      <motion.p 
                        className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        The interface has been redesigned for faster navigation and better clarity. 
                        Take a quick tour to discover key features and get the most out of your experience.
                      </motion.p>
                    </div>

                    <motion.div 
                      className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        variant="outline"
                        onClick={skipTutorial}
                        className="min-w-[140px] h-12 text-base"
                        data-testid="button-skip-tutorial"
                      >
                        Skip for now
                      </Button>
                      <Button
                        onClick={startTutorial}
                        className="min-w-[160px] h-12 text-base bg-primary gap-2 group"
                        data-testid="button-start-tutorial"
                      >
                        <Sparkles className="h-4 w-4" />
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </motion.div>

                    <motion.p 
                      className="text-xs text-muted-foreground/70"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Takes about 30 seconds
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
