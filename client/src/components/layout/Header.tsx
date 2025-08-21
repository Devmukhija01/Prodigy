import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Moon, Sun, ChevronDown, User, Settings, CreditCard, LogOut, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';
import { useAvatar } from '@/hooks/useAvatar';
import axios from 'axios';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

interface Notification {
  id: string;
  type: 'collaboration' | 'success' | 'info';
  message: string;
  time: string;
  icon: typeof UserPlus;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'collaboration',
    message: 'New collaboration request from Sarah Wilson',
    time: '2 minutes ago',
    icon: UserPlus
  },
  {
    id: '2',
    type: 'success',
    message: 'Post scheduled successfully',
    time: '5 minutes ago',
    icon: Check
  }
];

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const avatarUrl = useAvatar(user?.avatar);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch user data
  useEffect(() => {
    axios
      .get("http://localhost:5055/api/user/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={onMobileMenuToggle}
          >
            <Menu size={20} />
          </Button>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={16} />
            </div>
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-64 lg:w-80 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </Button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative"
            >
              <Bell size={20} />
              {mockNotifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium p-0 min-w-0">
                  {mockNotifications.length}
                </Badge>
              )}
            </Button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {mockNotifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            notification.type === 'collaboration' && "bg-blue-100 dark:bg-blue-900",
                            notification.type === 'success' && "bg-green-100 dark:bg-green-900"
                          )}>
                            <Icon 
                              size={16} 
                              className={cn(
                                notification.type === 'collaboration' && "text-blue-600 dark:text-blue-400",
                                notification.type === 'success' && "text-green-600 dark:text-green-400"
                              )} 
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationOpen(false);
              }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
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
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "Loading..."}
                </p>
              </div>
              <ChevronDown className="text-gray-400" size={16} />
            </Button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-600">
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
                          <User className="text-gray-600 dark:text-gray-300" size={20} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <User className="text-gray-600 dark:text-gray-300" size={20} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pro Plan</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User size={16} className="mr-3 text-gray-400" />
                    Your Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} className="mr-3 text-gray-400" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <CreditCard size={16} className="mr-3 text-gray-400" />
                    Billing
                  </Button>
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} className="mr-3 text-gray-400" />
                    Sign out
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
