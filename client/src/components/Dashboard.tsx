import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, TrendingUp, MessageCircle, Send, FileText, Clock, DollarSign, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Post, Template, Task } from '@shared/schema';
import { WeatherCard } from '@/components/ui/weather-card';
import axios from "axios";
import { LineChart, AreaChart, PieChart, RadarChart, CartesianGrid, XAxis, YAxis, Line, Area, Pie, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Search, Download, Award, Globe, AlertCircle, CheckCircle, BarChart3, Activity, Filter } from "lucide-react"; 
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
// import { CalendarHeatmap } from 'react-calendar-heatmap';
// import 'react-calendar-heatmap/style.css';
import { BarChart, Bar, Tooltip, Legend } from 'recharts';

const CURRENT_USER_ID = 1;
interface User {
  firstName: string;
  lastName: string;
  email: string;
  registerId: string;
}

export const Dashboard = () => {
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['/api/posts/user', CURRENT_USER_ID],
  });

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ['/api/templates/user', CURRENT_USER_ID],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks/user', CURRENT_USER_ID],
  });

  const recentPosts = posts.slice(0, 3);
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const [user, setUser] = useState<User | null>(null);

  // Fetch user data
  useEffect(() => {
    axios
      .get("http://localhost:5055/api/user/me", { withCredentials: true })
      .then((res) => {
        console.log("Fetched user:", res.data);
        setUser(res.data);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);
  const stats = [
    {
      title: "Total Posts",
      value: posts.length,
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Templates",
      value: templates.length,
      icon: FileText,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Pending Tasks",
      value: pendingTasks.length,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Completed Tasks",
      value: completedTasks.length,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];
  const performanceData = [
    { month: "Jan", productivity: 78, completion: 85, utilization: 72, velocity: 42 },
    { month: "Feb", productivity: 82, completion: 88, utilization: 76, velocity: 38 },
    { month: "Mar", productivity: 79, completion: 91, utilization: 74, velocity: 45 },
    { month: "Apr", productivity: 85, completion: 89, utilization: 81, velocity: 48 },
    { month: "May", productivity: 88, completion: 92, utilization: 85, velocity: 52 },
    { month: "Jun", productivity: 91, completion: 94, utilization: 89, velocity: 55 },
    { month: "Jul", productivity: 87, completion: 90, utilization: 83, velocity: 49 },
    { month: "Aug", productivity: 93, completion: 96, utilization: 91, velocity: 58 },
    { month: "Sep", productivity: 89, completion: 93, utilization: 87, velocity: 53 },
    { month: "Oct", productivity: 95, completion: 97, utilization: 94, velocity: 61 },
    { month: "Nov", productivity: 92, completion: 95, utilization: 90, velocity: 56 },
    { month: "Dec", productivity: 96, completion: 98, utilization: 95, velocity: 63 }
  ];

  // Team velocity data for burndown chart
  const velocityData = [
    { sprint: "Sprint 1", planned: 100, completed: 85, ideal: 100 },
    { sprint: "Sprint 2", planned: 95, completed: 92, ideal: 85 },
    { sprint: "Sprint 3", planned: 88, completed: 94, ideal: 70 },
    { sprint: "Sprint 4", planned: 82, completed: 89, ideal: 55 },
    { sprint: "Sprint 5", planned: 75, completed: 86, ideal: 40 },
    { sprint: "Sprint 6", planned: 68, completed: 78, ideal: 25 },
    { sprint: "Sprint 7", planned: 60, completed: 72, ideal: 10 },
    { sprint: "Sprint 8", planned: 50, completed: 58, ideal: 0 }
  ];

  // Resource utilization data
  const resourceData = [
    { team: "Frontend", current: 94, capacity: 100, efficiency: 96 },
    { team: "Backend", current: 87, capacity: 100, efficiency: 92 },
    { team: "DevOps", current: 78, capacity: 100, efficiency: 89 },
    { team: "QA", current: 91, capacity: 100, efficiency: 95 },
    { team: "Design", current: 85, capacity: 100, efficiency: 88 }
  ];

  // ROI performance data
  const roiData = [
    { name: "Project ROI", value: 340, color: "var(--chart-1)" },
    { name: "Team Efficiency", value: 96, color: "var(--chart-2)" },
    { name: "Client Satisfaction", value: 98, color: "var(--chart-3)" },
    { name: "Cost Optimization", value: 87, color: "var(--chart-4)" }
  ];

  // Sparkline data for KPI cards
  const sparklineData = {
    projects: [
      { value: 142 }, { value: 145 }, { value: 148 }, { value: 152 }, { value: 156 }
    ],
    hours: [
      { value: 2400 }, { value: 2450 }, { value: 2500 }, { value: 2520 }, { value: 2547 }
    ],
    team: [
      { value: 20 }, { value: 21 }, { value: 22 }, { value: 23 }, { value: 24 }
    ],
    completion: [
      { value: 88 }, { value: 90 }, { value: 92 }, { value: 93 }, { value: 94 }
    ]
  };

  // Advanced analytics data
  const radarData = [
    { skill: 'Frontend', teamA: 95, teamB: 88, fullMark: 100 },
    { skill: 'Backend', teamA: 88, teamB: 92, fullMark: 100 },
    { skill: 'DevOps', teamA: 78, teamB: 85, fullMark: 100 },
    { skill: 'Testing', teamA: 91, teamB: 90, fullMark: 100 },
    { skill: 'Design', teamA: 85, teamB: 78, fullMark: 100 },
    { skill: 'Mobile', teamA: 82, teamB: 95, fullMark: 100 },
  ];

  // Heatmap calendar data (simplified for demonstration)
  const heatmapData = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(2024, 0, i + 1),
    count: Math.floor(Math.random() * 5),
    projects: Math.floor(Math.random() * 3) + 1
  }));

  // Real-time metrics
  const realtimeMetrics = [
    { label: "Active Users", value: 1247, change: +12, icon: Users, color: "text-blue-600" },
    { label: "Revenue Today", value: 15420, change: +8.5, icon: DollarSign, color: "text-green-600" },
    { label: "API Calls", value: 89234, change: -2.1, icon: Zap, color: "text-purple-600" },
    { label: "Performance", value: 98.7, change: +1.2, icon: Target, color: "text-orange-600" }
  ];

  // Advanced table data
  const tableData = [
    { id: 1, project: "E-commerce Platform", status: "In Progress", progress: 87, team: "Frontend", priority: "High", deadline: "2024-01-15" },
    { id: 2, project: "Mobile App Redesign", status: "Completed", progress: 100, team: "Design", priority: "Medium", deadline: "2024-01-10" },
    { id: 3, project: "API Integration", status: "Planning", progress: 23, team: "Backend", priority: "High", deadline: "2024-01-20" },
    { id: 4, project: "Database Optimization", status: "In Progress", progress: 65, team: "DevOps", priority: "Low", deadline: "2024-01-25" },
    { id: 5, project: "User Analytics", status: "Testing", progress: 92, team: "QA", priority: "Medium", deadline: "2024-01-18" }
  ];

  const chartConfig = {
    productivity: {
      label: "Team Productivity",
      color: "hsl(var(--chart-1))",
    },
    completion: {
      label: "Project Completion",
      color: "hsl(var(--chart-2))",
    },
    utilization: {
      label: "Resource Utilization", 
      color: "hsl(var(--chart-3))",
    },
    velocity: {
      label: "Sprint Velocity",
      color: "hsl(var(--chart-4))",
    },
    planned: {
      label: "Planned Work",
      color: "hsl(var(--chart-1))",
    },
    completed: {
      label: "Completed Work",
      color: "hsl(var(--chart-2))",
    },
    ideal: {
      label: "Ideal Burndown",
      color: "hsl(var(--chart-3))",
    },
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // const userName = 'Alex';
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="greeting-title">
                Hi {user ? `${user.firstName}` : ""} 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1" data-testid="greeting-message">
                {getGreeting()}, have a great day!
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Here's what's happening with your social media accounts.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span data-testid="current-time">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <Calendar className="w-4 h-4" />
                <span data-testid="current-date">
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <Card className="glass-effect shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send size={20} />
              <span>Recent Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No posts yet. Create your first post to get started!
                </p>
              ) : (
                recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {post.content.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={`${getStatusColor(post.status)} text-white`}>
                          {post.status}
                        </Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {post.createdAt ? formatDate(post.createdAt) : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="glass-effect shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock size={20} />
              <span>Pending Tasks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No pending tasks. Great job staying on top of things!
                </p>
              ) : (
                pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Due: {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect shadow-xl">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Send size={24} />
              <span>Create Post</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <FileText size={24} />
              <span>New Template</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Calendar size={24} />
              <span>Schedule Content</span>
            </Button>
          </div>
        </CardContent>
      </Card>
                {/* Performance Analytics Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Performance Trend Analysis */}
            <Card className="shadow-sm border-slate-200" data-testid="card-performance-trends">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Performance Trend Analysis
                </CardTitle>
                <p className="text-sm text-slate-600">12-month productivity, completion rates, and resource utilization trends</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="productivity" 
                      strokeWidth={3}
                      dot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      strokeWidth={3}
                      dot={{ r: 4 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="utilization" 
                      strokeWidth={3}
                      dot={{ r: 4 }} 
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Sprint Velocity & Burndown Chart */}
            <Card className="shadow-sm border-slate-200" data-testid="card-velocity-burndown">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Sprint Velocity & Burndown
                </CardTitle>
                <p className="text-sm text-slate-600">Current sprint progress and team velocity tracking</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <AreaChart data={velocityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sprint" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="planned" 
                      stackId="1" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completed" 
                      stackId="2" 
                      fillOpacity={0.8}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ideal" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Resource Utilization & ROI Performance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Resource Utilization */}
            <Card className="shadow-sm border-slate-200" data-testid="card-resource-utilization">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Resource Utilization Analysis
                </CardTitle>
                <p className="text-sm text-slate-600">Team capacity and efficiency metrics across departments</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <BarChart data={resourceData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="team" type="category" width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="current" fill="hsl(var(--chart-1))" radius={4} />
                    <Bar dataKey="efficiency" fill="hsl(var(--chart-2))" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* ROI Performance Indicators */}
            <Card className="shadow-sm border-slate-200" data-testid="card-roi-performance">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  ROI Performance Indicators
                </CardTitle>
                <p className="text-sm text-slate-600">Key performance metrics and return on investment analysis</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <PieChart>
                    <Pie
                      data={roiData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}${entry.name === 'Project ROI' ? '%' : '%'}`}
                    >
                      {roiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Predictive Analytics Section */}
          <div className="mb-8">
            <Card className="shadow-sm border-slate-200" data-testid="card-predictive-analytics">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Predictive Analytics Dashboard
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">AI-powered forecasting for project completion and resource planning</p>
                  </div>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                    ML Powered
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Completion Forecast */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg" data-testid="forecast-completion">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">Project Completion Forecast</h4>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Next Sprint</span>
                        <span className="font-medium text-green-600">96% likely</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Q4 Goals</span>
                        <span className="font-medium text-blue-600">87% on track</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Year Target</span>
                        <span className="font-medium text-purple-600">94% projected</span>
                      </div>
                    </div>
                  </div>

                  {/* Resource Demand Prediction */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg" data-testid="forecast-resources">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">Resource Demand Prediction</h4>
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Next Month</span>
                        <span className="font-medium text-orange-600">+2 developers</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Q4 Peak</span>
                        <span className="font-medium text-red-600">+5 team members</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Utilization</span>
                        <span className="font-medium text-green-600">92% optimal</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-lg" data-testid="forecast-risks">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-slate-900">Risk Assessment</h4>
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Schedule Risk</span>
                        <span className="font-medium text-green-600">Low (12%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Budget Risk</span>
                        <span className="font-medium text-yellow-600">Medium (34%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Quality Risk</span>
                        <span className="font-medium text-green-600">Low (8%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Team Competency Radar Chart */}
            <Card className="shadow-lg border-slate-200" data-testid="card-team-competency">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Team Competency Analysis
                </CardTitle>
                <p className="text-sm text-slate-600">Skills assessment across different technology stacks</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-80">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Team Alpha" 
                      dataKey="teamA" 
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1))" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Radar 
                      name="Team Beta" 
                      dataKey="teamB" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </RadarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Interactive Time Range Selector */}
            <Card className="shadow-lg border-slate-200" data-testid="card-time-range">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      Interactive Time Analysis
                    </CardTitle>
                    <p className="text-sm text-slate-600">Customizable date range analytics</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">7D</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">30D</Badge>
                    <Badge variant="default" className="cursor-pointer">90D</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">1Y</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Input
                      type="date"
                      defaultValue="2024-01-01"
                      className="w-40"
                      data-testid="input-start-date"
                    />
                    <span className="text-slate-500">to</span>
                    <Input
                      type="date"
                      defaultValue="2024-12-31"
                      className="w-40"
                      data-testid="input-end-date"
                    />
                    <Button variant="outline" size="sm" data-testid="button-apply-filter">
                      <Filter className="h-4 w-4 mr-1" />
                      Apply
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-2">Period Performance</h4>
                      <p className="text-2xl font-bold text-blue-600">+23.5%</p>
                      <p className="text-sm text-slate-600">vs previous period</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <h4 className="font-semibold text-slate-900 mb-2">Goal Achievement</h4>
                      <p className="text-2xl font-bold text-green-600">87.4%</p>
                      <p className="text-sm text-slate-600">of targets met</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Data Table */}
          <Card className="shadow-lg border-slate-200 mb-8" data-testid="card-projects-table">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-slate-600" />
                    Project Management Dashboard
                  </CardTitle>
                  <p className="text-sm text-slate-600">Comprehensive project tracking with advanced filtering</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      className="pl-9 w-64"
                      data-testid="input-search-projects"
                    />
                  </div>
                  <Button variant="outline" size="sm" data-testid="button-export-csv">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer hover:bg-slate-50" data-testid="header-project">
                        Project <TrendingUp className="inline h-3 w-3 ml-1" />
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-slate-50" data-testid="header-status">
                        Status
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-slate-50" data-testid="header-progress">
                        Progress
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-slate-50" data-testid="header-team">
                        Team
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-slate-50" data-testid="header-priority">
                        Priority
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-slate-50" data-testid="header-deadline">
                        Deadline
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row) => (
                      <TableRow key={row.id} className="hover:bg-slate-50/50" data-testid={`row-project-${row.id}`}>
                        <TableCell className="font-medium">{row.project}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={row.status === 'Completed' ? 'default' : row.status === 'In Progress' ? 'secondary' : 'outline'}
                            className={
                              row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              row.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              row.status === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={row.progress} className="w-16 h-2" />
                            <span className="text-sm text-slate-600 min-w-[35px]">{row.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50">
                            {row.team}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              row.priority === 'High' ? 'border-red-200 bg-red-50 text-red-700' :
                              row.priority === 'Medium' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                              'border-green-200 bg-green-50 text-green-700'
                            }
                          >
                            {row.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{row.deadline}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-600">
                  Showing 5 of 156 projects
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary Cards */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Executive Performance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300" data-testid="card-quarterly-goals">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">Q4 Goals Achievement</h4>
                      <p className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">89.2%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Revenue Target</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Project Delivery</span>
                      <span className="font-medium text-blue-600">87%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Team Growth</span>
                      <span className="font-medium text-purple-600">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300" data-testid="card-market-position">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">Market Position</h4>
                      <p className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">#3</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Industry Rank</span>
                      <span className="font-medium text-green-600">3rd</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Market Share</span>
                      <span className="font-medium text-blue-600">12.4%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Growth Rate</span>
                      <span className="font-medium text-purple-600">+23%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-all duration-300" data-testid="card-innovation-index">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900">Innovation Index</h4>
                      <p className="text-3xl font-bold text-slate-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">8.7</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">R&D Investment</span>
                      <span className="font-medium text-green-600">18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Patent Applications</span>
                      <span className="font-medium text-blue-600">24</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tech Adoption</span>
                      <span className="font-medium text-purple-600">96%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Activity and Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Project Alpha completed</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">New document uploaded</p>
                    <p className="text-xs text-slate-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Team meeting scheduled</p>
                    <p className="text-xs text-slate-500">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Security alert resolved</p>
                    <p className="text-xs text-slate-500">2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Product Review Meeting</p>
                    <p className="text-xs text-slate-500">Today, 2:00 PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    High Priority
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Team Standup</p>
                    <p className="text-xs text-slate-500">Tomorrow, 9:00 AM</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Recurring
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Quarterly Review</p>
                    <p className="text-xs text-slate-500">Friday, 3:00 PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Important
                  </Badge>
                </div>
                <div className="pt-3">
                  <Button variant="outline" className="w-full">
                    View All Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
      <WeatherCard />
    </div>
  );
};