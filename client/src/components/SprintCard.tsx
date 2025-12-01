import { Calendar, Target, Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Sprint, TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO } from "date-fns";

interface SprintCardProps {
  sprint: Sprint;
  teamMembers?: TeamMember[];
  onClick?: () => void;
}

const statusConfig = {
  planning: { label: "Planning", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" },
  active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
};

export function SprintCard({ sprint, teamMembers = [], onClick }: SprintCardProps) {
  const status = statusConfig[sprint.status];
  const totalPoints = sprint.tasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = sprint.tasks
    .filter((t) => t.status === "done")
    .reduce((acc, t) => acc + t.storyPoints, 0);
  const progressPercent = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
  
  const startDate = parseISO(sprint.startDate);
  const endDate = parseISO(sprint.endDate);
  const today = new Date();
  const totalDays = differenceInDays(endDate, startDate);
  const daysLeft = Math.max(0, differenceInDays(endDate, today));
  
  const assignedMembers = teamMembers.filter((m) =>
    sprint.tasks.some((t) => t.assigneeId === m.id)
  );

  return (
    <Card 
      className="hover-elevate cursor-pointer transition-all duration-200" 
      onClick={onClick}
      data-testid={`card-sprint-${sprint.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold" data-testid={`text-sprint-name-${sprint.id}`}>
              {sprint.name}
            </h3>
            {sprint.goal && (
              <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-sprint-goal-${sprint.id}`}>
                {sprint.goal}
              </p>
            )}
          </div>
          <Badge 
            variant="secondary" 
            className={cn("no-default-hover-elevate shrink-0", status.className)}
            data-testid={`badge-sprint-status-${sprint.id}`}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(startDate, "MMM d")} - {format(endDate, "MMM d")}</span>
          </div>
          {sprint.status === "active" && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{daysLeft} days left</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completedPoints}/{totalPoints} pts</span>
          </div>
          <Progress value={progressPercent} className="h-2" data-testid={`progress-sprint-${sprint.id}`} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{sprint.tasks.length}</span>
              <span className="text-muted-foreground">tasks</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium">{sprint.tasks.filter(t => t.status === "done").length}</span>
              <span className="text-muted-foreground">done</span>
            </div>
          </div>
          
          {assignedMembers.length > 0 && (
            <div className="flex -space-x-2" data-testid={`avatars-sprint-team-${sprint.id}`}>
              {assignedMembers.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="h-7 w-7 border-2 border-card">
                  <AvatarFallback className="text-xs bg-muted">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignedMembers.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                  +{assignedMembers.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
