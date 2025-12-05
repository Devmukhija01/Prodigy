// import { useRef, useEffect, useState } from "react";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { ChatHeader } from "./ChatHeader";
// import { MessageBubble, Message } from "./MessageBubble";
// import { MessageInput } from "./MessageInput";
// import { DateSeparator } from "./DateSeparator";
// import { TypingIndicator } from "./TypingIndicator";
// import { EmptyState } from "./EmptyState";
// import { AnimatePresence } from "framer-motion";

// interface ChatUser {
//   id: string;
//   name: string;
//   avatar?: string;
//   isOnline?: boolean;
//   lastSeen?: string;
// }

// interface ChatGroup {
//   id: string;
//   name: string;
//   avatar?: string;
//   memberCount?: number;
// }

// interface ChatWindowProps {
//   chat: (ChatUser | ChatGroup) & { type: "friend" | "group" } | null;
//   messages: Message[];
//   currentUserId: string;
//   isTyping?: boolean;
//   typingUser?: { name: string; avatar?: string };
//   onSendMessage: (content: string) => void;
//   onBack?: () => void;
//   showBackButton?: boolean;
// }

// export function ChatWindow({
//   chat,
//   messages,
//   currentUserId,
//   isTyping = false,
//   typingUser,
//   onSendMessage,
//   onBack,
//   showBackButton = false,
// }: ChatWindowProps) {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [autoScroll, setAutoScroll] = useState(true);

//   useEffect(() => {
//     if (autoScroll && scrollRef.current) {
//       scrollRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, isTyping, autoScroll]);

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
//     const target = e.currentTarget;
//     const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
//     setAutoScroll(isAtBottom);
//   };

//   if (!chat) {
//     return (
//       <div className="h-full flex flex-col bg-background">
//         <EmptyState />
//       </div>
//     );
//   }

//   const isGroup = chat.type === "group";
//   const isOnline = !isGroup && "isOnline" in chat ? chat.isOnline : false;
//   const lastSeen = !isGroup && "lastSeen" in chat ? chat.lastSeen : undefined;
//   const memberCount = isGroup && "memberCount" in chat ? chat.memberCount : undefined;

//   const shouldShowDateSeparator = (index: number, currentMsg: Message, prevMsg?: Message) => {
//     if (index === 0) return true;
//     if (!prevMsg) return false;
//     const currentDate = new Date(currentMsg.timestamp).toDateString();
//     const prevDate = new Date(prevMsg.timestamp).toDateString();
//     return currentDate !== prevDate;
//   };

//   const isGroupedWithPrevious = (index: number, currentMsg: Message, prevMsg?: Message) => {
//     if (index === 0 || !prevMsg) return false;
//     if (currentMsg.fromUserId !== prevMsg.fromUserId) return false;
//     const currentTime = new Date(currentMsg.timestamp).getTime();
//     const prevTime = new Date(prevMsg.timestamp).getTime();
//     return currentTime - prevTime < 5 * 60 * 1000;
//   };

//   return (
//     <div className="h-full flex flex-col bg-background">
//       <ChatHeader
//         name={chat.name}
//         avatar={chat.avatar}
//         isOnline={isOnline}
//         isGroup={isGroup}
//         lastSeen={lastSeen}
//         memberCount={memberCount}
//         onBack={onBack}
//         showBackButton={showBackButton}
//       />

//       <ScrollArea 
//         className="flex-1 px-4"
//         onScrollCapture={handleScroll}
//       >
//         <div className="py-4">
//           {messages.map((message, index) => {
//             const prevMessage = messages[index - 1];
//             const showDateSeparator = shouldShowDateSeparator(index, message, prevMessage);
//             const isGrouped = isGroupedWithPrevious(index, message, prevMessage);

//             return (
//               <div key={message.id}>
//                 {showDateSeparator && <DateSeparator date={message.timestamp} />}
//                 <MessageBubble
//                   message={message}
//                   isOwn={message.fromUserId === currentUserId}
//                   showAvatar={isGroup || !isGrouped}
//                   isGrouped={isGrouped && !showDateSeparator}
//                 />
//               </div>
//             );
//           })}

//           <AnimatePresence>
//             {isTyping && typingUser && (
//               <TypingIndicator name={typingUser.name} avatar={typingUser.avatar} />
//             )}
//           </AnimatePresence>

//           <div ref={scrollRef} />
//         </div>
//       </ScrollArea>

//       <MessageInput
//         onSend={onSendMessage}
//         placeholder={`Message ${chat.name}...`}
//       />
//     </div>
//   );
// }
// // at the bottom of ChatWindow.tsx
// export default ChatWindow;
// src/components/messenger/ChatWindow.tsx
import React, { useMemo, useState, useEffect } from "react";
import ChatHeader, { ResolvedChat } from "./ChatHeader"; // adjust path if your structure differs
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Friend = {
  _id?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
};

type Group = {
  _id?: string;
  name?: string | null;
  avatar?: string | null;
};

export type Message = {
  _id?: string;
  fromUserId?: string;
  toUserId?: string;
  groupId?: string;
  content?: string;
  timestamp?: string | Date;
};

export interface ChatWindowProps {
  chat?: ResolvedChat | null;
  messages: Message[];
  currentUserId?: string;
  onSendMessage: (content?: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

const getInitials = (name = "") => {
  const cleaned = String(name || "").trim();
  if (!cleaned) return "U";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (String(parts[0][0] || "") + String(parts[1][0] || "")).toUpperCase();
};

function AvatarWithFallback({ src, alt, fallbackText, className = "" }: { src?: string | null; alt?: string; fallbackText?: string; className?: string; }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const showImage = !!src && !imgError;

  return (
    <Avatar className={className}>
      {showImage ? (
        <AvatarImage src={String(src)} alt={alt ?? fallbackText} onError={() => setImgError(true)} loading="lazy" />
      ) : (
        <AvatarFallback className="bg-primary text-white font-semibold">
          {getInitials(String(fallbackText || "U"))}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export function ChatWindow({
  chat,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  showBackButton = false,
  messagesEndRef,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");

  // debug
  useEffect(() => {
    console.debug("ChatWindow chat prop:", chat);
  }, [chat]);

  const displayName = useMemo(() => {
    if (!chat || !chat.data) return "Unknown";
    if (chat.type === "group") {
      return String((chat.data as Group).name ?? "").trim() || "Unknown group";
    }
    const d = chat.data as Friend;
    const first = String(d.firstName ?? "").trim();
    const last = String(d.lastName ?? "").trim();
    const full = `${first} ${last}`.trim();
    if (full) return full;
    // try other possible fields
    if ((d as any).name) return String((d as any).name);
    return "Unknown";
  }, [chat]);

  const avatarSrc = useMemo(() => {
    return (chat?.data as any)?.avatar ?? undefined;
  }, [chat]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSendMessage(text);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader
        // pass `chat` so header resolves robustly; ChatHeader also accepts simple props if you prefer:
        chat={chat ?? null}
        showBackButton={showBackButton}
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.map((m, idx) => {
          const isMe = String(m.fromUserId) === String(currentUserId);
          return (
            <div key={m._id ?? idx} className={`flex ${isMe ? "justify-end" : "items-start space-x-2"}`}>
              {!isMe && (
                <div className="flex-shrink-0">
                  <AvatarWithFallback src={avatarSrc} alt={displayName} fallbackText={displayName} className="w-8 h-8" />
                </div>
              )}

              <div className={`flex flex-col ${isMe ? "items-end" : ""}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[72%] break-words ${isMe ? "bg-primary text-white" : "bg-gray-100 text-gray-900"}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex items-center gap-3 flex-shrink-0">
        <div className="flex-1">
          <Input
            placeholder={`Message ${displayName}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="rounded-full"
            aria-label={`Type a message to ${displayName}`}
          />
        </div>

        <Button onClick={handleSend} disabled={!draft.trim()} aria-label="Send message" className="rounded-full p-3">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// named export and default
export default ChatWindow;
