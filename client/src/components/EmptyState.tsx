import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
}

export default function EmptyState({ icon: Icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  const isCompact = variant === 'compact';
  
  return (
    <div 
      className={`flex flex-col items-center justify-center text-center ${isCompact ? 'py-10 px-4' : 'py-16 px-6'}`}
      data-testid="empty-state-container"
    >
      <div className={`
        rounded-2xl bg-gradient-to-br from-primary/10 to-chart-3/10 
        flex items-center justify-center mb-5
        ${isCompact ? 'w-14 h-14' : 'w-20 h-20'}
      `}>
        <div className={`
          rounded-xl bg-gradient-to-br from-primary/20 to-chart-3/20 
          flex items-center justify-center
          ${isCompact ? 'w-10 h-10' : 'w-14 h-14'}
        `}>
          <Icon className={`text-primary ${isCompact ? 'w-5 h-5' : 'w-7 h-7'}`} aria-hidden="true" />
        </div>
      </div>
      <h3 
        className={`font-semibold text-foreground mb-2 ${isCompact ? 'text-base' : 'text-xl'}`}
        data-testid="text-empty-title"
      >
        {title}
      </h3>
      <p 
        className={`text-muted-foreground max-w-xs ${isCompact ? 'text-sm' : 'text-base'}`}
        data-testid="text-empty-description"
      >
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="mt-5"
          data-testid="button-empty-action"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
