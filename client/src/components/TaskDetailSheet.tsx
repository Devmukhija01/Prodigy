import { useState } from "react";
import { X, User, Tag, Calendar, MessageSquare, Activity } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Task, TeamMember, Priority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskDetailSheetProps {
  task: Task | null;
  teamMembers: TeamMember[];
  onClose: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "text-red-600" },
  { value: "medium", label: "Medium", color: "text-amber-600" },
  { value: "low", label: "Low", color: "text-green-600" },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

export function TaskDetailSheet({ task, teamMembers, onClose, onUpdate }: TaskDetailSheetProps) {
  const [description, setDescription] = useState(task?.description || "");

  if (!task) return null;

  const assignee = teamMembers.find((m) => m.id === task.assigneeId);

  return (
    <Sheet open={!!task} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto" data-testid="sheet-task-detail">
        <SheetHeader className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="text-left pr-8" data-testid="text-task-detail-title">
              {task.title}
            </SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground font-mono">#{task.id}</p>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <Select
                value={task.status}
                onValueChange={(value: TaskStatus) => onUpdate({ status: value })}
              >
                <SelectTrigger data-testid="select-task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
              <Select
                value={task.priority}
                onValueChange={(value: Priority) => onUpdate({ priority: value })}
              >
                <SelectTrigger data-testid="select-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className={option.color}>{option.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assignee</label>
              <Select
                value={task.assigneeId || "unassigned"}
                onValueChange={(value) => onUpdate({ assigneeId: value === "unassigned" ? undefined : value })}
              >
                <SelectTrigger data-testid="select-task-assignee">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">{member.initials}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Story Points</label>
              <Select
                value={task.storyPoints.toString()}
                onValueChange={(value) => onUpdate({ storyPoints: parseInt(value) })}
              >
                <SelectTrigger data-testid="select-task-points">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 8, 13, 21].map((points) => (
                    <SelectItem key={points} value={points.toString()}>
                      {points} {points === 1 ? "point" : "points"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => onUpdate({ description })}
              placeholder="Add a description..."
              className="min-h-[120px] resize-none"
              data-testid="textarea-task-description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
                + Add tag
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Activity className="h-4 w-4" />
              Activity
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">AC</AvatarFallback>
                </Avatar>
                <div>
                  <p><span className="font-medium">Alex Chen</span> moved to In Progress</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">SM</AvatarFallback>
                </Avatar>
                <div>
                  <p><span className="font-medium">Sarah Miller</span> added to Sprint 14</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
