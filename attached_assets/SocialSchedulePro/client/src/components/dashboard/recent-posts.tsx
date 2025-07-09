import { Edit, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";

export default function RecentPosts() {
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Recent Posts</h4>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const recentPosts = posts?.slice(0, 3) || [];

  const getPlatformIcon = (platforms: string[]) => {
    const platform = platforms[0];
    switch (platform) {
      case 'twitter':
        return <i className="fab fa-twitter text-blue-500" />;
      case 'facebook':
        return <i className="fab fa-facebook text-blue-600" />;
      case 'instagram':
        return <i className="fab fa-instagram text-pink-500" />;
      case 'linkedin':
        return <i className="fab fa-linkedin text-blue-700" />;
      default:
        return <i className="fas fa-share text-gray-600" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "No date set";
    const d = new Date(date);
    return d.toLocaleDateString() + " at " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h4 className="text-md font-medium text-gray-900 mb-4">Recent Posts</h4>
      <div className="space-y-4">
        {recentPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No posts yet. Create your first post to get started!</p>
          </div>
        ) : (
          recentPosts.map((post) => (
            <div key={post.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                {getPlatformIcon(post.platforms)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{post.title}</p>
                <p className="text-sm text-gray-600">
                  {post.status === 'scheduled' && `Scheduled for ${formatDate(post.scheduledDate)}`}
                  {post.status === 'published' && `Published ${formatDate(post.scheduledDate)}`}
                  {post.status === 'draft' && 'Draft - not scheduled'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`status-badge status-${post.status}`}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  {post.status === 'published' ? <BarChart3 size={16} /> : <Edit size={16} />}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
