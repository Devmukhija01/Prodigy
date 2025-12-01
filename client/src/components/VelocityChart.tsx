import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import type { VelocityData } from "@/lib/types";

interface VelocityChartProps {
  data: VelocityData[];
  title?: string;
}

export function VelocityChart({ data, title = "Team Velocity" }: VelocityChartProps) {
  const avgVelocity = Math.round(data.reduce((acc, d) => acc + d.completed, 0) / data.length);

  return (
    <Card data-testid="card-velocity-chart">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="text-sm">
            <span className="text-muted-foreground">Avg: </span>
            <span className="font-semibold">{avgVelocity} pts</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
              <XAxis 
                dataKey="sprintName" 
                tick={{ fontSize: 11 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine 
                y={avgVelocity} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                label={{ 
                  value: `Avg: ${avgVelocity}`, 
                  position: 'right',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 11,
                }}
              />
              <Bar 
                dataKey="committed" 
                name="Committed" 
                fill="hsl(var(--muted))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="completed" 
                name="Completed" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
