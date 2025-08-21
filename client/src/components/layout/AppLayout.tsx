import { useState } from "react";
import { Sidebar } from "../Sidebar";
import { Header } from "./Header";

interface AppLayoutProps {
  children: React.ReactNode;
  activeScreen: string;
  onScreenChange: (screen: string) => void;
}

export function AppLayout({ children, activeScreen, onScreenChange }: AppLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pendingCount = 3; // Example: replace with real count

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onScreenChange={onScreenChange}
        pendingCount={pendingCount}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
