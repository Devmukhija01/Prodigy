import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center py-12 px-6"
      data-testid="error-state-container"
      role="alert"
    >
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-destructive" aria-hidden="true" />
      </div>
      <h3 
        className="text-lg font-semibold text-foreground mb-1 text-center"
        data-testid="text-error-title"
      >
        {title}
      </h3>
      <p 
        className="text-muted-foreground text-center max-w-sm mb-5"
        data-testid="text-error-message"
      >
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          data-testid="button-retry"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}
