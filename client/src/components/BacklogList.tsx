import { useState } from "react";
import { Plus, GripVertical, ChevronRight, Search, Filter, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task, TeamMember, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BacklogListProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  selectedTasks: string[];
  onSelectTask: (taskId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
  onMoveToSprint?: (taskIds: string[]) => void;
}

const priorityConfig: Record<Priority, { color: string }> = {
  high: { color: "bg-red-500" },
  medium: { color: "bg-amber-500" },
  low: { color: "bg-green-500" },
};

export function BacklogList({
  tasks,
  teamMembers,
  selectedTasks,
  onSelectTask,
  onSelectAll,
  onTaskClick,
  onAddTask,
  onMoveToSprint,
}: BacklogListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "points" | "title">("priority");

  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sortBy === "points") return b.storyPoints - a.storyPoints;
      return a.title.localeCompare(b.title);
    });

  const allSelected = filteredTasks.length > 0 && filteredTasks.every((t) => selectedTasks.includes(t.id));
  const someSelected = selectedTasks.length > 0;
  const totalPoints = filteredTasks.reduce((acc, t) => acc + t.storyPoints, 0);

  return (
    <div className="space-y-4" data-testid="backlog-list">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-backlog-search"
          />
        </div>
        
        <Select value={sortBy} onValueChange={(v: typeof sortBy) => setSortBy(v)}>
          <SelectTrigger className="w-[140px]" data-testid="select-backlog-sort">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="points">Story Points</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>

        {onAddTask && (
          <Button onClick={onAddTask} data-testid="button-add-backlog-task">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {someSelected && onMoveToSprint && (
        <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
          <span className="text-sm font-medium">{selectedTasks.length} selected</span>
          <Button size="sm" onClick={() => onMoveToSprint(selectedTasks)} data-testid="button-move-to-sprint">
            <ChevronRight className="h-4 w-4 mr-1" />
            Move to Sprint
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onSelectAll(false)}>
            Clear
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <div className="flex items-center gap-3 p-3 bg-muted/50 border-b">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            data-testid="checkbox-select-all"
          />
          <span className="text-sm font-medium flex-1">
            {filteredTasks.length} tasks
          </span>
          <span className="text-sm text-muted-foreground">{totalPoints} pts total</span>
        </div>

        <div className="divide-y">
          {filteredTasks.map((task) => {
            const member = teamMembers.find((m) => m.id === task.assigneeId);
            const isSelected = selectedTasks.includes(task.id);

            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 p-3 hover-elevate transition-colors cursor-pointer",
                  isSelected && "bg-primary/5"
                )}
                onClick={() => onTaskClick(task)}
                data-testid={`backlog-task-${task.id}`}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelectTask(task.id, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`checkbox-task-${task.id}`}
                />
                
                <div className="text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div className={cn("w-1 h-8 rounded-full", priorityConfig[task.priority].color)} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{task.title}</span>
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs hidden sm:inline-flex">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">#{task.id}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-semibold">
                    {task.storyPoints}
                  </div>
                  
                  {member ? (
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-7 w-7" />
                  )}
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-2">No tasks in backlog</p>
              {onAddTask && (
                <Button variant="outline" onClick={onAddTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first task
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
