// import { useState } from "react";
// import { Search, Plus, MessageCircle, Users, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { ChatListItem, ChatListItemProps } from "./ChatListItem";

// interface ChatSidebarProps {
//   friends: ChatListItemProps[];
//   groups: ChatListItemProps[];
//   selectedChatId?: string;
//   onSelectChat: (id: string, type: "friend" | "group") => void;
// }

// type TabType = "personal" | "groups";

// export function ChatSidebar({
//   friends,
//   groups,
//   selectedChatId,
//   onSelectChat,
// }: ChatSidebarProps) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showSearch, setShowSearch] = useState(false);
//   const [activeTab, setActiveTab] = useState<TabType>("personal");

//   const filteredFriends = friends.filter((f) => {
//     const fullName = `${f.firstName || ""} ${f.lastName || ""}`.trim().toLowerCase();
//     return fullName.includes(searchQuery.toLowerCase());
//   });
  
//   const filteredGroups = groups.filter((g) =>
//     g.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const tabs: { id: TabType; label: string; icon: typeof MessageCircle }[] = [
//     // { id: "all", label: "All", icon: MessageCircle },
//     { id: "personal", label: "Personal", icon: MessageCircle },
//     { id: "groups", label: "Groups", icon: Users },
//   ];

//   return (
//     <div className="h-full flex flex-col bg-sidebar">
//       <div className="p-4 border-b border-sidebar-border">
//         <div className="flex items-center justify-between gap-2 mb-4">
//           <h1 className="text-xl font-semibold text-sidebar-foreground">Messages</h1>
//           <div className="flex items-center gap-1">
//             <Button
//               size="icon"
//               variant="ghost"
//               onClick={() => setShowSearch(!showSearch)}
//               data-testid="button-toggle-search"
//             >
//               {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
//             </Button>
//             <Button
//               size="icon"
//               variant="ghost"
//               data-testid="button-new-chat"
//             >
//               <Plus className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         {showSearch && (
//           <div className="relative mb-3">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               type="search"
//               placeholder="Search conversations..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-9"
//               data-testid="input-search-chats"
//             />
//           </div>
//         )}

//         <div className="flex gap-1 p-1 bg-muted rounded-md">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
//                 activeTab === tab.id
//                   ? "bg-background text-foreground shadow-sm"
//                   : "text-muted-foreground hover:text-foreground"
//               }`}
//               data-testid={`tab-${tab.id}`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <ScrollArea className="flex-1">
//         <div className="py-2">
//           {(activeTab === "all" || activeTab === "personal") && filteredFriends.length > 0 && (
//             <div>
//               {activeTab === "all" && (
//                 <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
//                   Personal
//                 </div>
//               )}
//               {filteredFriends.map((friend) => (
//                 <ChatListItem
//                   key={friend.id}
//                   {...friend}
//                   isSelected={selectedChatId === friend.id}
//                   onClick={() => onSelectChat(friend.id, "friend")}
//                 />
//               ))}
//             </div>
//           )}

//           {(activeTab === "all" || activeTab === "groups") && filteredGroups.length > 0 && (
//             <div>
//               {activeTab === "all" && (
//                 <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
//                   Groups
//                 </div>
//               )}
//               {filteredGroups.map((group) => (
//                 <ChatListItem
//                   key={group.id}
//                   {...group}
//                   isGroup
//                   isSelected={selectedChatId === group.id}
//                   onClick={() => onSelectChat(group.id, "group")}
//                 />
//               ))}
//             </div>
//           )}

//           {filteredFriends.length === 0 && filteredGroups.length === 0 && (
//             <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
//               <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
//               <p className="text-sm text-muted-foreground">
//                 {searchQuery ? "No conversations found" : "No conversations yet"}
//               </p>
//             </div>
//           )}
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }
import React, { useState } from "react";
import { Search, Plus, MessageCircle, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatListItem } from "./ChatListItem";

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface Group {
  _id: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

interface ChatSidebarProps {
  friends: User[];
  groups: Group[];
  selectedChatId?: string | null; // server _id
  onSelectChat: (id: string, type: "friend" | "group") => void;
}

type TabType = "personal" | "groups";

export function ChatSidebar({
  friends,
  groups,
  selectedChatId,
  onSelectChat,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  const q = searchQuery.trim().toLowerCase();

  const filteredFriends = friends.filter((f) => {
    const fullName = `${f.firstName || ""} ${f.lastName || ""}`.trim().toLowerCase();
    if (!q) return true;
    return fullName.includes(q);
  });

  const filteredGroups = groups.filter((g) => {
    const groupName = (g.name || "").toString().toLowerCase();
    if (!q) return true;
    return groupName.includes(q);
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: "personal", label: "Personal" },
    { id: "groups", label: "Groups" },
  ];

  return (
    <div className="h-full flex flex-col bg-sidebar">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h1 className="text-xl font-semibold text-sidebar-foreground">Messages</h1>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowSearch(!showSearch)}
              data-testid="button-toggle-search"
            >
              {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-new-chat">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showSearch && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-chats"
            />
          </div>
        )}

        <div className="flex gap-1 p-1 bg-muted rounded-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {activeTab === "personal" && (
            <>
              {filteredFriends.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">No personal chats</div>
              ) : (
                filteredFriends.map((friend) => (
                  <ChatListItem
                    key={friend._id}
                    id={friend._id}
                    firstName={friend.firstName}
                    lastName={friend.lastName}
                    avatar={friend.avatar}
                    lastMessage={friend.lastMessage}
                    timestamp={friend.timestamp}
                    unreadCount={friend.unreadCount}
                    isOnline={friend.isOnline}
                    isSelected={String(selectedChatId) === String(friend._id)}
                    onClick={() => onSelectChat(friend._id, "friend")}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "groups" && (
            <>
              {filteredGroups.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">No groups</div>
              ) : (
                filteredGroups.map((group) => (
                  <ChatListItem
                    key={group._id}
                    id={group._id}
                    name={group.name}
                    avatar={group.avatar}
                    lastMessage={group.lastMessage}
                    timestamp={group.timestamp}
                    unreadCount={group.unreadCount}
                    isGroup
                    isSelected={String(selectedChatId) === String(group._id)}
                    onClick={() => onSelectChat(group._id, "group")}
                  />
                ))
              )}
            </>
          )}

          {/* empty / fallback */}
          {filteredFriends.length === 0 && filteredGroups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
