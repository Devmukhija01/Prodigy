import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamCapacityProps {
  members: TeamMember[];
  title?: string;
}

export function TeamCapacity({ members, title = "Team Capacity" }: TeamCapacityProps) {
  const totalCapacity = members.reduce((acc, m) => acc + m.capacity, 0);
  const totalAllocated = members.reduce((acc, m) => acc + m.allocated, 0);
  const utilizationPercent = Math.round((totalAllocated / totalCapacity) * 100);

  return (
    <Card data-testid="card-team-capacity">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">Utilization: </span>
            <span className={cn(
              "font-semibold",
              utilizationPercent > 90 ? "text-red-600" : utilizationPercent > 75 ? "text-amber-600" : "text-green-600"
            )}>
              {utilizationPercent}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => {
            const percent = Math.round((member.allocated / member.capacity) * 100);
            const isOverloaded = percent > 100;
            const isHigh = percent > 85;
            
            return (
              <div key={member.id} className="space-y-2" data-testid={`capacity-member-${member.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs bg-muted">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    isOverloaded ? "text-red-600" : isHigh ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {member.allocated}h / {member.capacity}h
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={Math.min(percent, 100)} 
                    className={cn(
                      "h-2",
                      isOverloaded && "[&>div]:bg-red-500",
                      isHigh && !isOverloaded && "[&>div]:bg-amber-500"
                    )}
                  />
                  {isOverloaded && (
                    <div 
                      className="absolute top-0 h-2 bg-red-500/30 rounded-full" 
                      style={{ left: '100%', width: `${percent - 100}%`, maxWidth: '20%' }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Team</span>
            <span className="font-medium">{totalAllocated}h / {totalCapacity}h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
