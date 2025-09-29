import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "./header";
import { ThemeProvider } from "./ThemeProvider";
import type { Profile } from "@shared/schema";

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  const [activeScreen, setActiveScreen] = useState<'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand'>('dashboard');
  const [pendingCount] = useState(3); // Mock pending count
  const [location] = useLocation();
  
  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  // Auto-generate page title based on route if not provided
  const getPageTitle = () => {
    if (pageTitle) return pageTitle;
    
    switch (location) {
      case "/":
      case "/dashboard":
        return "Dashboard";
      case "/profile":
        return "Profile Settings";
      default:
        return "Dashboard";
    }
  };

  const handleScreenChange = (screen: 'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand') => {
    setActiveScreen(screen);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header 
          activeScreen={activeScreen} 
          onScreenChange={handleScreenChange} 
          pendingCount={pendingCount} 
        />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}