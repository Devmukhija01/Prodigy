import { useState , useEffect} from 'react';
import { 
  BarChart3, 
  Send, 
  FileText, 
  Palette, 
  Users, 
  Clock, 
  MessageCircle,
  Settings,
  X,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useAvatar } from '@/hooks/useAvatar';

type Screen = 'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand' | 'profile';

interface SidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  pendingCount: number;
  // pendingCount?: number;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}
interface User {
  firstName: string;
  lastName: string;
  email: string;
  registerId: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  socialAccounts?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, isPrimary: true },
  { id: 'posts', label: 'Tasks', icon: Send, isPrimary: true },
  { id: 'templates', label: 'Templates', icon: FileText, isPrimary: true },
  { id: 'brand', label: 'Groups', icon: Palette, isPrimary: true },
  { id: 'search', label: 'Find Users', icon: Users, isPrimary: false },
  { id: 'pending', label: 'Requests', icon: Clock, isPrimary: false },
  { id: 'chat', label: 'Chats', icon: MessageCircle, isPrimary: false },
];

export function Sidebar({ activeScreen, onScreenChange, pendingCount = 0, isMobileOpen, onMobileClose }: SidebarProps) {
  const primaryItems = navigationItems.filter(item => item.isPrimary);
  const secondaryItems = navigationItems.filter(item => !item.isPrimary);
  const [user, setUser] = useState<User | null>(null);
  const avatarUrl = useAvatar(user?.avatar);

  useEffect(() => {
    // First try to get user data from localStorage
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUser(parsedUserData);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }

    // Then fetch fresh data from server
    axios
      .get("http://localhost:5055/api/user/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        // Update localStorage with fresh data
        localStorage.setItem("userData", JSON.stringify(res.data));
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header - Fixed */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-white" size={16} />
              </div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Prodigy</h1>
            </div>
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={onMobileClose}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Navigation - Scrollable if needed */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Primary Navigation Items */}
            {primaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 relative",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500" 
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => {
                    onScreenChange(item.id);
                    if (window.innerWidth < 1024) onMobileClose();
                  }}
                >
                  <Icon 
                    size={16} 
                    className={cn(
                      "mr-3",
                      isActive 
                        ? "text-blue-500" 
                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )} 
                  />
                  {item.label}
                  {item.id === 'requests' && pendingCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

            {/* Secondary Navigation Items */}
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 relative",
                    isActive 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500" 
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => {
                    onScreenChange(item.id);
                    if (window.innerWidth < 1024) onMobileClose();
                  }}
                >
                  <Icon 
                    size={16} 
                    className={cn(
                      "mr-3",
                      isActive 
                        ? "text-blue-500" 
                        : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    )} 
                  />
                  {item.label}
                  {item.id === 'requests' && pendingCount > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </nav>

          {/* Sidebar Footer - Fixed */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              {avatarUrl ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-600">
                  <img 
                    src={avatarUrl} 
                    alt={`${user?.firstName} ${user?.lastName}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to default avatar if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center hidden">
                    <User className="text-gray-600 dark:text-gray-300" size={16} />
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="text-gray-600 dark:text-gray-300" size={16} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user ? `${user.firstName} ${user.lastName}` : "Loading..."}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user? `${user?.registerId}`:"Loading..."}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <Settings size={16} />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
