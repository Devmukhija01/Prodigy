import { GripVertical, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Task, TeamMember, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  teamMember?: TeamMember;
  isDragging?: boolean;
  onClick?: () => void;
  onDragStart?: (task: Task) => void;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: "High", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" },
  medium: { label: "Medium", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  low: { label: "Low", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
};

const priorityBorderColors: Record<Priority, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-green-500",
};

export function TaskCard({ task, teamMember, isDragging, onClick, onDragStart }: TaskCardProps) {
  const priority = priorityConfig[task.priority];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onDragStart?.(task);
  };

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "p-3 hover-elevate cursor-grab active:cursor-grabbing transition-all duration-200 border-l-4",
        priorityBorderColors[task.priority],
        isDragging && "rotate-2 shadow-lg opacity-90"
      )}
      onClick={onClick}
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start gap-2">
        <div className="text-muted-foreground cursor-grab mt-0.5" data-testid={`drag-handle-${task.id}`}>
          <GripVertical className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium leading-tight line-clamp-2" data-testid={`text-task-title-${task.id}`}>
              {task.title}
            </h4>
            <div 
              className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold"
              data-testid={`badge-story-points-${task.id}`}
            >
              {task.storyPoints}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={cn("text-xs px-1.5 py-0 no-default-hover-elevate", priority.className)}
              data-testid={`badge-priority-${task.id}`}
            >
              {priority.label}
            </Badge>
            
            {task.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-1.5 py-0"
                data-testid={`badge-tag-${task.id}-${tag}`}
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{task.tags.length - 2}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground font-mono">#{task.id}</span>
            
            {teamMember ? (
              <Avatar className="h-6 w-6" data-testid={`avatar-assignee-${task.id}`}>
                <AvatarFallback className="text-xs bg-muted">
                  {teamMember.initials}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground/50" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
