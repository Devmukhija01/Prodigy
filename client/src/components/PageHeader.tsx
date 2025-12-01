import { Sparkles } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  showBadge?: boolean;
  badgeText?: string;
}

export default function PageHeader({ title, description, showBadge = true, badgeText = "Your Network" }: PageHeaderProps) {
  return (
    <header className="text-center space-y-4 pb-4">
      {showBadge && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary tracking-wide uppercase">
            {badgeText}
          </span>
        </div>
      )}
      <h1 
        className="text-4xl md:text-5xl font-bold tracking-tight"
        data-testid="text-page-title"
      >
        <span className="text-gradient">{title}</span>
      </h1>
      {description && (
        <p 
          className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
          data-testid="text-page-description"
        >
          {description}
        </p>
      )}
    </header>
  );
}
