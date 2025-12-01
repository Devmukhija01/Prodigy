import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Target, CheckCircle2, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/MetricCard";
import { SprintCard } from "@/components/SprintCard";
import { BurndownChart } from "@/components/BurndownChart";
import { VelocityChart } from "@/components/VelocityChart";
import { TeamCapacity } from "@/components/TeamCapacity";
import { TaskCard } from "@/components/TaskCard";
import { SprintFormDialog } from "@/components/SprintFormDialog";
import type { Sprint, Task, TeamMember } from "@/lib/types";
import { mockBurndownData, mockVelocityData } from "@/lib/mockData";

interface DashboardProps {
  sprints?: Sprint[];
  teamMembers?: TeamMember[];
}

export function Dashboard({ sprints = [], teamMembers = [] }: DashboardProps) {
  const [showSprintForm, setShowSprintForm] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const activeSprint = sprints.find(s => s.status === "active");
  const sprintTasks = tasks.filter(t => t.sprintId === activeSprint?.id);
  const totalPoints = sprintTasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = sprintTasks.filter(t => t.status === "done").reduce((acc, t) => acc + t.storyPoints, 0);
  const progressPercent = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;
  const inProgressTasks = sprintTasks.filter(t => t.status === "in_progress");
  const avgVelocity = Math.round(mockVelocityData.reduce((acc, d) => acc + d.completed, 0) / mockVelocityData.length);

  return (
    <div className="p-6 space-y-6" data-testid="page-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {activeSprint ? `Current: ${activeSprint.name}` : "No active sprint"}
          </p>
        </div>
        <Button onClick={() => setShowSprintForm(true)} data-testid="button-new-sprint">
          <Plus className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sprint Progress"
          value={`${progressPercent}%`}
          subtitle={`${completedPoints} of ${totalPoints} points`}
          icon={Target}
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Completed Tasks"
          value={sprintTasks.filter(t => t.status === "done").length}
          subtitle="this sprint"
          icon={CheckCircle2}
          trend="up"
          trendValue="+3"
        />
        <MetricCard
          title="In Progress"
          value={inProgressTasks.length}
          subtitle="tasks actively worked on"
          icon={Clock}
          trend="neutral"
          trendValue="0"
        />
        <MetricCard
          title="Avg Velocity"
          value={avgVelocity}
          subtitle="points per sprint"
          icon={TrendingUp}
          trend="up"
          trendValue="+5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BurndownChart data={mockBurndownData} />
          <VelocityChart data={mockVelocityData} />
        </div>
        
        <div className="space-y-6">
          <TeamCapacity members={teamMembers} />
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">In Progress</CardTitle>
                <Link href="/board">
                  <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-view-board">
                    View Board
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {inProgressTasks.slice(0, 3).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  teamMember={teamMembers.find(m => m.id === task.assigneeId)}
                />
              ))}
              {inProgressTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks in progress
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Sprints</h2>
          <Link href="/sprints">
            <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-all-sprints">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprints.slice(0, 3).map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              teamMembers={teamMembers}
            />
          ))}
        </div>
      </div>

      <SprintFormDialog
        open={showSprintForm}
        onOpenChange={setShowSprintForm}
        onSubmit={() => {}}
      />
    </div>
  );
}

export default Dashboard;
