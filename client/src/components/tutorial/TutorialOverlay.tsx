import { useEffect, useState, useCallback, useRef } from 'react';
import { useTutorial } from './TutorialContext';
import type { TutorialStep } from './TutorialContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Keyboard,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'right' | 'bottom' | 'left';
}

export default function TutorialOverlay() {
  const { 
    isActive, 
    isPaused,
    currentStep, 
    currentStepIndex, 
    steps, 
    nextStep, 
    prevStep,
    goToStep,
    endTutorial,
    progress
  } = useTutorial();
  
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateOptimalPosition = useCallback((
    elementRect: DOMRect,
    preferredPosition?: string
  ): 'top' | 'right' | 'bottom' | 'left' => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 380;
    const tooltipHeight = 280;
    const margin = 24;

    const spaceAbove = elementRect.top;
    const spaceBelow = viewportHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = viewportWidth - elementRect.right;

    if (preferredPosition && preferredPosition !== 'auto') {
      return preferredPosition as 'top' | 'right' | 'bottom' | 'left';
    }

    const positions = [
      { pos: 'bottom' as const, space: spaceBelow, needed: tooltipHeight + margin },
      { pos: 'top' as const, space: spaceAbove, needed: tooltipHeight + margin },
      { pos: 'right' as const, space: spaceRight, needed: tooltipWidth + margin },
      { pos: 'left' as const, space: spaceLeft, needed: tooltipWidth + margin },
    ];

    for (const { pos, space, needed } of positions) {
      if (space >= needed) return pos;
    }

    return spaceBelow >= spaceAbove ? 'bottom' : 'top';
  }, []);

  const calculatePosition = useCallback((step: TutorialStep) => {
    const element = document.querySelector(step.targetSelector);
    if (!element) {
      console.warn(`Tutorial target not found: ${step.targetSelector}`);
      return;
    }

    const rect = element.getBoundingClientRect();
    const padding = step.spotlightPadding ?? 12;
    
    const elementRect: ElementRect = {
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    
    setTargetRect(elementRect);

    const position = calculateOptimalPosition(rect, step.position);
    const tooltipWidth = 380;
    const tooltipHeight = 280;
    const arrowOffset = 20;

    let top = 0;
    let left = 0;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    switch (position) {
      case 'top':
        top = rect.top - tooltipHeight - arrowOffset + window.scrollY;
        left = centerX - tooltipWidth / 2;
        break;
      case 'bottom':
        top = rect.bottom + arrowOffset + window.scrollY;
        left = centerX - tooltipWidth / 2;
        break;
      case 'left':
        top = centerY - tooltipHeight / 2 + window.scrollY;
        left = rect.left - tooltipWidth - arrowOffset;
        break;
      case 'right':
        top = centerY - tooltipHeight / 2 + window.scrollY;
        left = rect.right + arrowOffset;
        break;
    }

    const viewportWidth = window.innerWidth;
    if (left < 16) left = 16;
    if (left + tooltipWidth > viewportWidth - 16) left = viewportWidth - tooltipWidth - 16;
    if (top < 16 + window.scrollY) top = rect.bottom + arrowOffset + window.scrollY;

    setTooltipPosition({ top, left, arrowPosition: position });
  }, [calculateOptimalPosition]);

  useEffect(() => {
    if (!isActive || !currentStep || isPaused) return;

    setIsTransitioning(true);
    const element = document.querySelector(currentStep.targetSelector);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isInView) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      const timer = setTimeout(() => {
        calculatePosition(currentStep);
        setIsTransitioning(false);
      }, isInView ? 100 : 400);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, isPaused, calculatePosition]);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const handleResize = () => {
      if (currentStep) {
        calculatePosition(currentStep);
      }
    };

    const handleScroll = () => {
      if (currentStep && !isTransitioning) {
        calculatePosition(currentStep);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isActive, isPaused, currentStep, calculatePosition, isTransitioning]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        endTutorial();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, endTutorial]);

  useEffect(() => {
    if (showKeyboardHint && isActive) {
      const timer = setTimeout(() => {
        setShowKeyboardHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showKeyboardHint, isActive]);

  if (!isActive || !currentStep || !targetRect || !tooltipPosition || isPaused) return null;

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9998] pointer-events-none"
        data-testid="tutorial-overlay"
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-auto"
          style={{ minHeight: document.body.scrollHeight }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <motion.rect
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            </mask>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        <motion.div
          className="absolute pointer-events-none rounded-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 3px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-primary"
            animate={{
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="absolute z-[9999] pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: 380,
          }}
        >
          <div 
            className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
            data-testid="tutorial-tooltip"
          >
            <div className="h-1 bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-primary to-chart-2"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToStep(idx)}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all duration-300",
                        idx === currentStepIndex 
                          ? "bg-primary scale-125 ring-4 ring-primary/20" 
                          : idx < currentStepIndex
                          ? "bg-primary/60"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      data-testid={`dot-step-${idx}`}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {currentStepIndex + 1} / {steps.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={endTutorial}
                    className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                    data-testid="button-close-tutorial"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 
                  className="text-xl font-semibold text-foreground leading-tight"
                  data-testid="text-step-title"
                >
                  {currentStep.title}
                </h3>
                {/* <p 
                  className="text-muted-foreground text-sm leading-relaxed"
                  data-testid="text-step-description"
                >
                  {currentStep.description}
                </p> */}
                <div
                  className="text-muted-foreground text-sm leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: currentStep.description }}
                />
                {currentStep.action && (
                  <div className="flex items-center gap-2 text-xs text-primary font-medium bg-primary/10 px-3 py-2 rounded-lg">
                    <Keyboard className="h-3.5 w-3.5" />
                    {currentStep.action}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={isFirstStep}
                  className={cn(
                    "gap-2 px-4",
                    isFirstStep && "opacity-0 pointer-events-none"
                  )}
                  data-testid="button-prev-step"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                
                <Button
                  onClick={nextStep}
                  className="gap-2 px-6 bg-primary min-w-[120px]"
                  data-testid="button-next-step"
                >
                  {isLastStep ? (
                    <>
                      <Check className="h-4 w-4" />
                      Complete
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showKeyboardHint && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-white/70 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full whitespace-nowrap"
              >
                <Keyboard className="h-3 w-3" />
                Use arrow keys or Enter to navigate
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={cn(
              "absolute w-4 h-4 bg-card/95 backdrop-blur-xl rotate-45 border-border/50",
              tooltipPosition.arrowPosition === 'bottom' && "-top-2 left-1/2 -translate-x-1/2 border-t border-l",
              tooltipPosition.arrowPosition === 'top' && "-bottom-2 left-1/2 -translate-x-1/2 border-b border-r",
              tooltipPosition.arrowPosition === 'right' && "top-1/2 -left-2 -translate-y-1/2 border-l border-b",
              tooltipPosition.arrowPosition === 'left' && "top-1/2 -right-2 -translate-y-1/2 border-r border-t"
            )}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
