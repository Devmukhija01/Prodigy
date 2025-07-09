import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentPosts from "@/components/dashboard/recent-posts";
import MiniCalendar from "@/components/dashboard/mini-calendar";
import TemplateLibrary from "@/components/dashboard/template-library";
import PlatformStatus from "@/components/dashboard/platform-status";
import PostCreatorModal from "@/components/posts/post-creator-modal";
import { useState } from "react";

export default function Dashboard() {
  const [showPostCreator, setShowPostCreator] = useState(false);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Manage your social media content across all platforms</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowPostCreator(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
            <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-8">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <Button variant="link" className="text-sm text-primary hover:text-primary/80">
                  View all
                </Button>
              </div>
              
              {/* Quick Post Creator */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setShowPostCreator(true)}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Plus className="text-primary" size={20} />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Create New Post</h4>
                  <p className="text-gray-600 mb-4">Start creating your next social media post</p>
                  <Button className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </div>
              </div>

              <RecentPosts />
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <MiniCalendar />
            <TemplateLibrary />
            <PlatformStatus />
          </div>
        </div>
      </div>

      <PostCreatorModal 
        open={showPostCreator} 
        onOpenChange={setShowPostCreator}
      />
    </>
  );
}
