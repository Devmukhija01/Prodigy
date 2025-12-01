import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  count?: number;
  id?: string;
  icon?: LucideIcon;
}

export default function SectionHeader({ title, description, count, id, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 flex-wrap">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        )}
        <h2 
          id={id}
          className="text-xl font-bold text-foreground tracking-tight"
          data-testid={`text-section-${id || 'title'}`}
        >
          {title}
        </h2>
        {count !== undefined && count > 0 && (
          <Badge 
            className="gradient-primary text-white border-0 font-semibold text-xs px-2.5 py-0.5"
            data-testid="badge-count"
          >
            {count}
          </Badge>
        )}
      </div>
      {description && (
        <p 
          className="text-muted-foreground text-sm"
          data-testid="text-section-description"
        >
          {description}
        </p>
      )}
    </div>
  );
}
