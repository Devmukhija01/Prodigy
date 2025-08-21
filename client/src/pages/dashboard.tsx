import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, isPositive, icon, color }: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
            {change}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Posts',
      value: '1,284',
      change: '+12%',
      isPositive: true,
      icon: <i className="fas fa-paper-plane text-blue-600 dark:text-blue-400"></i>,
      color: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Engagement',
      value: '94.7%',
      change: '+5.4%',
      isPositive: true,
      icon: <i className="fas fa-heart text-green-600 dark:text-green-400"></i>,
      color: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Followers',
      value: '45.2K',
      change: '+8.1%',
      isPositive: true,
      icon: <i className="fas fa-users text-purple-600 dark:text-purple-400"></i>,
      color: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      title: 'Reach',
      value: '126.4K',
      change: '-2.3%',
      isPositive: false,
      icon: <i className="fas fa-chart-line text-orange-600 dark:text-orange-400"></i>,
      color: 'bg-orange-100 dark:bg-orange-900'
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your social media accounts.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400">
              Your recent posts and engagement metrics will appear here...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
