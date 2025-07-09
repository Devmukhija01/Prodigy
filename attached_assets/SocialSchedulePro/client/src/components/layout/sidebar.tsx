import { Link, useLocation } from "wouter";
import { 
  Home, 
  Calendar, 
  Edit, 
  Layers, 
  BarChart3, 
  Palette, 
  Share2,
  User,
  Settings,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/calendar", label: "Content Calendar", icon: Calendar },
    { path: "/create-post", label: "Create Post", icon: Edit },
    { path: "/templates", label: "Templates", icon: Layers },
    { path: "/tasks", label: "Tasks", icon: CheckSquare },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/brand-assets", label: "Brand Assets", icon: Palette },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Share2 className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SocialFlow</h1>
            <p className="text-sm text-gray-500">Social Media Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600" size={16} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Sarah Johnson</p>
            <p className="text-sm text-gray-500">sarah@company.com</p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
