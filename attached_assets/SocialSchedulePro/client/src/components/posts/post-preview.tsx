import { MessageCircle, Repeat, Heart, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PostPreviewProps {
  content: string;
  platforms: string[];
  title: string;
}

export default function PostPreview({ content, platforms, title }: PostPreviewProps) {
  const activePlatform = platforms[0] || 'twitter';
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Preview ({platforms.length} platform{platforms.length !== 1 ? 's' : ''})
      </label>
      <Card className="border border-gray-300 bg-gray-50">
        <CardContent className="p-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Your Brand</p>
                <p className="text-gray-500 text-xs">@yourbrand</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {title && (
                <h3 className="font-semibold text-gray-900">{title}</h3>
              )}
              <p className="text-gray-900 text-sm">
                {content || "Your post content will appear here..."}
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-500 mt-4 pt-3 border-t border-gray-100">
              <button className="text-xs hover:text-primary flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button className="text-xs hover:text-primary flex items-center space-x-1">
                <Repeat className="w-4 h-4" />
                <span>Retweet</span>
              </button>
              <button className="text-xs hover:text-primary flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>Like</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {platforms.length > 1 && (
        <p className="text-xs text-gray-500 mt-2">
          This post will be formatted appropriately for each selected platform
        </p>
      )}
    </div>
  );
}
