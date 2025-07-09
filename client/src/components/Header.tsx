import { Moon, Sun, Search, Clock, MessageCircle, Calendar, FileText, Palette, BarChart3, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  activeScreen: 'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand';
  onScreenChange: (screen: 'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand') => void;
  pendingCount: number;
}

export const Header = ({ activeScreen, onScreenChange, pendingCount }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">SocialConnect Pro</h1>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-2">
            <Button
              variant={activeScreen === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('dashboard')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <BarChart3 size={16} />
              <span className="hidden lg:inline">Dashboard</span>
            </Button>

            <Button
              variant={activeScreen === 'posts' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('posts')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <Send size={16} />
              <span className="hidden lg:inline">Posts</span>
            </Button>

            <Button
              variant={activeScreen === 'templates' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('templates')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <FileText size={16} />
              <span className="hidden lg:inline">Templates</span>
            </Button>

            <Button
              variant={activeScreen === 'brand' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('brand')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <Palette size={16} />
              <span className="hidden lg:inline">Brand</span>
            </Button>
            
            <Button
              variant={activeScreen === 'search' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('search')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <Users size={16} />
              <span className="hidden lg:inline">Find Users</span>
            </Button>
            
            <Button
              variant={activeScreen === 'pending' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('pending')}
              className="flex items-center space-x-2 relative"
              size="sm"
            >
              <Clock size={16} />
              <span className="hidden lg:inline">Requests</span>
              {pendingCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground animate-pulse">
                  {pendingCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeScreen === 'chat' ? 'default' : 'ghost'}
              onClick={() => onScreenChange('chat')}
              className="flex items-center space-x-2"
              size="sm"
            >
              <MessageCircle size={16} />
              <span className="hidden lg:inline">Chats</span>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-full"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
