import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchUsers } from '@/components/SearchUsers';
import { PendingRequests } from '@/components/PendingRequests';
import { ChatInterface } from '@/components/ChatInterface';
import { Dashboard } from '@/components/Dashboard';
import { Posts } from '@/components/Posts';
import { Templates } from '@/components/Templates';
import { Brand } from '@/components/Brand';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';

const CURRENT_USER_ID = 1; // This would come from authentication context

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand'>('dashboard');
  const { friendRequests } = useWebSocket(CURRENT_USER_ID);

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['/api/friend-requests/pending', CURRENT_USER_ID],
  });

  const pendingCount = pendingRequests.length + friendRequests.length;

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'posts':
        return <Posts />;
      case 'templates':
        return <Templates />;
      case 'brand':
        return <Brand />;
      case 'search':
        return <SearchUsers />;
      case 'pending':
        return <PendingRequests />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      <Header 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen}
        pendingCount={pendingCount}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveScreen()}
      </main>
    </div>
  );
}
