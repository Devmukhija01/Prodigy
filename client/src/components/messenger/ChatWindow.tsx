import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble, Message } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { DateSeparator } from "./DateSeparator";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import { AnimatePresence } from "framer-motion";

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

interface ChatGroup {
  id: string;
  name: string;
  avatar?: string;
  memberCount?: number;
}

interface ChatWindowProps {
  chat: (ChatUser | ChatGroup) & { type: "friend" | "group" } | null;
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  typingUser?: { name: string; avatar?: string };
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatWindow({
  chat,
  messages,
  currentUserId,
  isTyping = false,
  typingUser,
  onSendMessage,
  onBack,
  showBackButton = false,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  if (!chat) {
    return (
      <div className="h-full flex flex-col bg-background">
        <EmptyState />
      </div>
    );
  }

  const isGroup = chat.type === "group";
  const isOnline = !isGroup && "isOnline" in chat ? chat.isOnline : false;
  const lastSeen = !isGroup && "lastSeen" in chat ? chat.lastSeen : undefined;
  const memberCount = isGroup && "memberCount" in chat ? chat.memberCount : undefined;

  const shouldShowDateSeparator = (index: number, currentMsg: Message, prevMsg?: Message) => {
    if (index === 0) return true;
    if (!prevMsg) return false;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const isGroupedWithPrevious = (index: number, currentMsg: Message, prevMsg?: Message) => {
    if (index === 0 || !prevMsg) return false;
    if (currentMsg.fromUserId !== prevMsg.fromUserId) return false;
    const currentTime = new Date(currentMsg.timestamp).getTime();
    const prevTime = new Date(prevMsg.timestamp).getTime();
    return currentTime - prevTime < 5 * 60 * 1000;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <ChatHeader
        name={chat.name}
        avatar={chat.avatar}
        isOnline={isOnline}
        isGroup={isGroup}
        lastSeen={lastSeen}
        memberCount={memberCount}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      <ScrollArea 
        className="flex-1 px-4"
        onScrollCapture={handleScroll}
      >
        <div className="py-4">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showDateSeparator = shouldShowDateSeparator(index, message, prevMessage);
            const isGrouped = isGroupedWithPrevious(index, message, prevMessage);

            return (
              <div key={message.id}>
                {showDateSeparator && <DateSeparator date={message.timestamp} />}
                <MessageBubble
                  message={message}
                  isOwn={message.fromUserId === currentUserId}
                  showAvatar={isGroup || !isGrouped}
                  isGrouped={isGrouped && !showDateSeparator}
                />
              </div>
            );
          })}

          <AnimatePresence>
            {isTyping && typingUser && (
              <TypingIndicator name={typingUser.name} avatar={typingUser.avatar} />
            )}
          </AnimatePresence>

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <MessageInput
        onSend={onSendMessage}
        placeholder={`Message ${chat.name}...`}
      />
    </div>
  );
}
