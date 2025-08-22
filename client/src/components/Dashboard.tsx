import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, TrendingUp, MessageCircle, Send, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Post, Template, Task } from '@shared/schema';
import { WeatherCard } from '@/components/ui/weather-card';
import axios from "axios";

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
      .get("http://https://prodigy-59mg.onrender.com/api/user/me", { withCredentials: true })
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
      <WeatherCard />
    </div>
  );
};