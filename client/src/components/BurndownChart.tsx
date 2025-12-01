import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import type { BurndownPoint } from "@/lib/types";

interface BurndownChartProps {
  data: BurndownPoint[];
  title?: string;
}

export function BurndownChart({ data, title = "Sprint Burndown" }: BurndownChartProps) {
  return (
    <Card data-testid="card-burndown-chart">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
                label={{ value: 'Story Points', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
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
              <Line
                type="linear"
                dataKey="ideal"
                name="Ideal"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
