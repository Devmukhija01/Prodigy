import { Clock, CheckCircle, Edit, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Scheduled Posts",
      value: stats?.scheduledPosts || 0,
      change: "+12%",
      changeType: "positive",
      icon: Clock,
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      title: "Published Today",
      value: stats?.publishedToday || 0,
      change: "+8%",
      changeType: "positive",
      icon: CheckCircle,
      bgColor: "bg-success/10",
      iconColor: "text-success"
    },
    {
      title: "Draft Posts",
      value: stats?.draftPosts || 0,
      change: "No change",
      changeType: "neutral",
      icon: Edit,
      bgColor: "bg-warning/10",
      iconColor: "text-warning"
    },
    {
      title: "Active Templates",
      value: stats?.activeTemplates || 0,
      change: "+3",
      changeType: "positive",
      icon: Layers,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${stat.iconColor}`} size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm ${stat.changeType === 'positive' ? 'text-success' : stat.changeType === 'negative' ? 'text-destructive' : 'text-gray-500'}`}>
                  {stat.changeType === 'positive' && '↑'} {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  {stat.changeType === 'positive' ? 'from last week' : 'from last week'}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
