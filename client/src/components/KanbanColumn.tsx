import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./TaskCard";
import type { Task, TeamMember, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  teamMembers: TeamMember[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: () => void;
  onDragStart?: (task: Task) => void;
  isDropTarget?: boolean;
}

const columnColors: Record<TaskStatus, string> = {
  backlog: "bg-muted/50",
  todo: "bg-blue-50 dark:bg-blue-950/30",
  in_progress: "bg-amber-50 dark:bg-amber-950/30",
  in_review: "bg-purple-50 dark:bg-purple-950/30",
  done: "bg-green-50 dark:bg-green-950/30",
};

const headerColors: Record<TaskStatus, string> = {
  backlog: "text-muted-foreground",
  todo: "text-blue-600 dark:text-blue-400",
  in_progress: "text-amber-600 dark:text-amber-400",
  in_review: "text-purple-600 dark:text-purple-400",
  done: "text-green-600 dark:text-green-400",
};

export function KanbanColumn({
  title,
  status,
  tasks,
  teamMembers,
  onTaskClick,
  onAddTask,
  onDragStart,
  isDropTarget,
}: KanbanColumnProps) {
  const totalPoints = tasks.reduce((acc, t) => acc + t.storyPoints, 0);

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg min-w-[280px] w-[280px] transition-all duration-200",
        columnColors[status],
        isDropTarget && "ring-2 ring-primary ring-offset-2"
      )}
      data-testid={`column-${status}`}
    >
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className={cn("font-semibold text-sm", headerColors[status])} data-testid={`text-column-title-${status}`}>
              {title}
            </h3>
            <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">{totalPoints} pts</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2 min-h-[100px]">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              teamMember={teamMembers.find((m) => m.id === task.assigneeId)}
              onClick={() => onTaskClick?.(task)}
              onDragStart={onDragStart}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed border-muted rounded-lg">
              No tasks
            </div>
          )}
        </div>
      </ScrollArea>

      {onAddTask && (
        <div className="p-2 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={onAddTask}
            data-testid={`button-add-task-${status}`}
          >
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>
      )}
    </div>
  );
}
