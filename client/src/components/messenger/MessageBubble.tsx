import { Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export interface Message {
  id: string;
  content: string;
  timestamp: Date | string;
  fromUserId: string;
  senderName?: string;
  senderAvatar?: string;
  status?: "sending" | "sent" | "delivered" | "read";
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isGrouped?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  isGrouped = false,
}: MessageBubbleProps) {
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <div className="h-3 w-3 rounded-full border border-current border-t-transparent animate-spin" />;
      case "sent":
        return <Check className="h-3 w-3" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"} ${
        isGrouped ? "mt-0.5" : "mt-3"
      }`}
      data-testid={`message-${message.id}`}
    >
      {!isOwn && showAvatar && !isGrouped && (
        <Avatar className="h-8 w-8 flex-shrink-0 mt-auto">
          {message.senderAvatar && (
            <AvatarImage src={message.senderAvatar} alt={message.senderName || ""} />
          )}
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            {getInitials(message.senderName || "?")}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!isOwn && !showAvatar && !isGrouped && <div className="w-8 flex-shrink-0" />}
      {!isOwn && isGrouped && <div className="w-8 flex-shrink-0" />}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[75%]`}>
        {!isOwn && !isGrouped && message.senderName && (
          <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
            {message.senderName}
          </span>
        )}
        
        <div
          className={`
            px-4 py-2.5 max-w-full break-words
            ${isOwn
              ? `bg-primary text-primary-foreground ${isGrouped ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tr-sm"}`
              : `bg-muted text-foreground ${isGrouped ? "rounded-2xl rounded-tl-md" : "rounded-2xl rounded-tl-sm"}`
            }
          `}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className="text-muted-foreground">
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
