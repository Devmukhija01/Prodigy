import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";

export default function Analytics() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  if (isLoading) {
    return (
      <>
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">Track your social media performance</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  const getPostsByPlatform = () => {
    const platformCounts: Record<string, number> = {};
    posts?.forEach(post => {
      post.platforms.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
    });
    return platformCounts;
  };

  const getPostsByStatus = () => {
    const statusCounts: Record<string, number> = {};
    posts?.forEach(post => {
      statusCounts[post.status] = (statusCounts[post.status] || 0) + 1;
    });
    return statusCounts;
  };

  const platformStats = getPostsByPlatform();
  const statusStats = getPostsByStatus();

  const analyticsData = [
    {
      title: "Total Posts",
      value: posts?.length || 0,
      change: "+12%",
      changeType: "positive",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Scheduled Posts",
      value: stats?.scheduledPosts || 0,
      change: "+5%",
      changeType: "positive",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Published Today",
      value: stats?.publishedToday || 0,
      change: "0%",
      changeType: "neutral",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Engagement Rate",
      value: "4.2%",
      change: "-2%",
      changeType: "negative",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-600">Track your social media performance</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{item.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span className={`text-sm flex items-center ${
                      item.changeType === 'positive' ? 'text-green-600' : 
                      item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {item.changeType === 'positive' && <TrendingUp className="w-4 h-4 mr-1" />}
                      {item.changeType === 'negative' && <TrendingDown className="w-4 h-4 mr-1" />}
                      {item.changeType === 'neutral' && <Minus className="w-4 h-4 mr-1" />}
                      {item.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">from last week</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Platform Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Posts by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(platformStats).map(([platform, count]) => (
                  <div key={platform} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        platform === 'twitter' ? 'bg-blue-500' :
                        platform === 'facebook' ? 'bg-blue-600' :
                        platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                        platform === 'linkedin' ? 'bg-blue-700' : 'bg-gray-500'
                      }`}>
                        <i className={`fab fa-${platform} text-white text-sm`}></i>
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{platform}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count} posts</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${(count / (posts?.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Post Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Post Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statusStats).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'published' ? 'bg-success' :
                        status === 'scheduled' ? 'bg-warning' :
                        status === 'draft' ? 'bg-gray-400' : 'bg-destructive'
                      }`}></div>
                      <span className="font-medium text-gray-900 capitalize">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count} posts</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            status === 'published' ? 'bg-success' :
                            status === 'scheduled' ? 'bg-warning' :
                            status === 'draft' ? 'bg-gray-400' : 'bg-destructive'
                          }`}
                          style={{ width: `${(count / (posts?.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts?.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        post.status === 'published' ? 'bg-success' :
                        post.status === 'scheduled' ? 'bg-warning' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-600">
                          {post.platforms.join(', ')} • {post.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {post.scheduledDate 
                        ? new Date(post.scheduledDate).toLocaleDateString()
                        : 'No date'
                      }
                    </span>
                  </div>
                ))}
                {posts?.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No posts to display</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
