// import { useState } from 'react';
// import { Header } from '@/components/Header';
// import { SearchUsers } from '@/components/SearchUsers';
// import { PendingRequests } from '@/components/PendingRequests';
// import { ChatInterface } from '@/components/ChatInterface';
// import { Dashboard } from '@/components/Dashboard';
// import { Posts } from '@/components/Posts';
// import { Templates } from '@/components/Templates';
// import Brand from '@/components/Brand';
// import { useQuery } from '@tanstack/react-query';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { Sidebar } from '@/components/Sidebar';
// import Profile from './Profile';
// import { ActiveScreenProvider } from "../ActiveScreenContext";
// const CURRENT_USER_ID = 1; // This would come from authentication context
// import { useActiveScreen } from '../ActiveScreenContext';



// export default function Home() {
//   // const [activeScreen, setActiveScreen] = useState<'search' | 'pending' | 'chat' | 'dashboard' | 'posts' | 'templates' | 'brand' | 'profile'>('dashboard');
//   const { activeScreen, setActiveScreen } = useActiveScreen();
//   const { friendRequests } = useWebSocket(CURRENT_USER_ID);

//   const { data: pendingRequests = [] } = useQuery({
//     queryKey: ['/api/friend-requests/pending', CURRENT_USER_ID],
//   });

//   const pendingCount = pendingRequests.length + friendRequests.length;

//   const renderActiveScreen = () => {
//     switch (activeScreen) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'posts':
//         return <Posts />;
//       case 'templates':
//         return <Templates />;
//       case 'brand':
//         return <Brand />;
//       case 'search':
//         return <SearchUsers />;
//       case 'pending':
//         return <PendingRequests />;
//       case 'chat':
//         return <ChatInterface />;
//       case 'profile':
//         return <Profile />
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-all duration-300">
//   {/* Sidebar (fixed on the left) */}
//   <Sidebar
//     activeScreen={activeScreen}
//     onScreenChange={setActiveScreen}
//     pendingCount={pendingCount}
//     isMobileOpen={false}
//     onMobileClose={() => {}}
//   />

//   {/* Main content area with header and screen */}
//   <div className="flex flex-col flex-1">
//     {/* Header (top bar inside main content) */}
//     <Header onMobileMenuToggle={() => {}} />

//     {/* Page content */}
//     <main className="flex-1 max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
//       {renderActiveScreen()}
//     </main>
//   </div>
// </div>
//   );
// }



import { useState } from 'react';
import { Header } from '@/components/Header';
import { SearchUsers } from '@/components/SearchUsers';
import { PendingRequests } from '@/components/PendingRequests';
import { ChatInterface } from '@/components/ChatInterface';
import { Dashboard } from '@/components/Dashboard';
import { Posts } from '@/components/Posts';
import { Templates } from '@/components/Templates';
import Brand from '@/components/Brand';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { Sidebar } from '@/components/Sidebar';
import Profile from './Profile';
import { useActiveScreen } from '../ActiveScreenContext';
import Sprint from './Sprint';
import { Footer } from '@/components/Footer';
import FriendsManagement from './FriendsManagement';
import FeedbackContact from './FeedbackContact';
import { MessengerApp } from '@/components/MessengerApp';
import TutorialSystem from '@/components/tutorial/TutorialSystem';
import type { TutorialStep } from '@/components/tutorial/TutorialSystem';
const CURRENT_USER_ID = 1;


const tutorialSteps: TutorialStep[] = [
  {
    id: 'header',
    targetSelector: '#tutorial-header',
    title: 'Header Section',
    position: 'bottom',
    spotlightPadding: 4,
    description: `
      <p>Your header contains three key elements:</p>
      <ul style="margin: 0; padding-left: 1.2rem;">
        <li>🌗 <strong>Theme Toggle</strong> — switch instantly between Light and Dark mode.</li>
        <li>🔔 <strong>Notifications</strong> — view real-time alerts and updates.</li>
        <li>👤 <strong>Profile Menu</strong> — access your account settings or sign out.</li>
      </ul>
    `,
  },

  {
    id: 'sidebar',
    targetSelector: '#tutorial-sidebar',
    title: 'Navigation Sidebar',
    position: 'right',
    spotlightPadding: 4,
    description: `
      <p>Your sidebar is the main navigation hub:</p>
      <ul style="margin: 0; padding-left: 1.2rem;">
        <li>📊 <strong>Dashboard</strong> — view your activity and overview.</li>
        <li>📝 <strong>Tasks</strong> — track work and manage to-dos.</li>
        <li>👥 <strong>Groups</strong> — collaborate with your teams.</li>
        <li>💬 <strong>Chats</strong> — communicate in real time.</li>
        <li>📅 <strong>Sprint Planning</strong> — organize workflow cycles.</li>
        <li>🤝 <strong>Friends</strong> — connect with other users.</li>
      </ul>
    `,
  },
];
export default function Home() {
  const { activeScreen, setActiveScreen } = useActiveScreen();
  const { friendRequests } = useSocket(CURRENT_USER_ID);
  const storedUserData = localStorage.getItem("userData"); 
  const parsedUser = storedUserData ? JSON.parse(storedUserData) : null;
  const firstName = parsedUser?.firstName ?? "User"; 
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['/api/friend-requests/pending', CURRENT_USER_ID],
  });

  const pendingCount = pendingRequests.length + friendRequests.length;

  // ✅ state for mobile sidebar toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'posts':
        return <Posts />;
      // case 'templates':
      //   return <Templates />;
      case 'brand':
        return <Brand />;
      // case 'search':
      //   return <SearchUsers />;
      // case 'pending':
      //   return <PendingRequests />;
      case 'chat':
        return <ChatInterface />;
      case 'profile':
        return <Profile />;
      case 'sprint':
        return <Sprint />; 
      case 'friends':
        return <FriendsManagement />;
      case 'NewMessage':
        return <MessengerApp />;
      case 'Feedback-Contact':
        return <FeedbackContact/>;
      default:
        return <Dashboard />;
    }
  };

  // return (
  //   <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-all duration-300">
  //     {/* Sidebar */}
  //     <Sidebar
  //       activeScreen={activeScreen}
  //       onScreenChange={setActiveScreen}
  //       pendingCount={pendingCount}
  //       isMobileOpen={isMobileSidebarOpen}
  //       onMobileClose={() => setIsMobileSidebarOpen(false)}
  //     />

  //     {/* Main content */}
  //     <div className="flex flex-col flex-1">
  //       <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

  //       <main className="flex-1 max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  //         {renderActiveScreen()}
  //       </main>
  //     </div>
  //   </div>
  // );

  return (
    <TutorialSystem 
    steps={tutorialSteps}
    userName={firstName}
    appName="Prodigy Dashboard">
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (fixed height, scroll independent) */}
      <Sidebar
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        pendingCount={pendingCount}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
  
      {/* Right side (Header + Main content) */}
      <div className="flex flex-col flex-1">
        {/* Header - sticky at top */}
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
  
        {/* Main content - only this scrolls */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8">
          {renderActiveScreen()}
        </main>
        {/* <Footer /> */}
      </div>
    </div>
    </TutorialSystem>
  );
  
}
