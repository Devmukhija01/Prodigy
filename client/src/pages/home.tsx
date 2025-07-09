import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchUsers } from '@/components/SearchUsers';
import { PendingRequests } from '@/components/PendingRequests';
import { ChatInterface } from '@/components/ChatInterface';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';

const CURRENT_USER_ID = 1; // This would come from authentication context

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<'search' | 'pending' | 'chat'>('search');
  const { friendRequests } = useWebSocket(CURRENT_USER_ID);

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['/api/friend-requests/pending', CURRENT_USER_ID],
  });

  const pendingCount = pendingRequests.length + friendRequests.length;

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'search':
        return <SearchUsers />;
      case 'pending':
        return <PendingRequests />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <SearchUsers />;
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
