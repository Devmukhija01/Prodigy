// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// export interface ChatListItemProps {
//   id: string;
//   name: string;
//   avatar?: string;
//   lastMessage?: string;
//   timestamp?: string;
//   unreadCount?: number;
//   isOnline?: boolean;
//   isGroup?: boolean;
//   isSelected?: boolean;
//   onClick?: () => void;
// }

// export function ChatListItem({
//   name,
//   avatar,
//   lastMessage,
//   timestamp,
//   unreadCount = 0,
//   isOnline = false,
//   isGroup = false,
//   isSelected = false,
//   onClick,
// }: ChatListItemProps) {
//   const getInitials = (name: string) =>
//     name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .toUpperCase()
//       .slice(0, 2);

//   return (
//     <div
//       onClick={onClick}
//       data-testid={`chat-item-${name.toLowerCase().replace(/\s+/g, "-")}`}
//       className={`
//         flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-md mx-2
//         hover-elevate
//         ${isSelected 
//           ? "bg-sidebar-accent" 
//           : ""
//         }
//       `}
//     >
//       <div className="relative flex-shrink-0">
//         <Avatar className="h-12 w-12">
//           {avatar && <AvatarImage src={avatar} alt={name} />}
//           <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
//             {getInitials(name)}
//           </AvatarFallback>
//         </Avatar>
//         {!isGroup && (
//           <span
//             className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-sidebar ${
//               isOnline ? "bg-status-online" : "bg-status-offline"
//             }`}
//             data-testid={`status-indicator-${isOnline ? "online" : "offline"}`}
//           />
//         )}
//         {isGroup && (
//           <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-sidebar bg-primary flex items-center justify-center">
//             <span className="text-[8px] text-primary-foreground font-bold">G</span>
//           </span>
//         )}
//       </div>

//       <div className="flex-1 min-w-0">
//         <div className="flex items-center justify-between gap-2">
//           <span className="font-medium text-sm truncate text-foreground">
//             {name}
//           </span>
//           {timestamp && (
//             <span className="text-xs text-muted-foreground flex-shrink-0">
//               {timestamp}
//             </span>
//           )}
//         </div>
//         <div className="flex items-center justify-between gap-2 mt-0.5">
//           <span className="text-sm text-muted-foreground truncate">
//             {lastMessage || (isGroup ? "Group chat" : "Start a conversation")}
//           </span>
//           {unreadCount > 0 && (
//             <span 
//               className="flex-shrink-0 min-w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold px-1.5"
//               data-testid="badge-unread-count"
//             >
//               {unreadCount > 99 ? "99+" : unreadCount}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ChatListItemProps {
  id: string;
  // Keep `name` for backward compatibility with mock data,
  // but allow firstName/lastName for real DB users.
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isGroup?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChatListItem({
  name,
  firstName,
  lastName,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  isGroup = false,
  isSelected = false,
  onClick,
}: ChatListItemProps) {
  // Build a safe display name from available fields
  const displayName =
    (name && String(name).trim()) ||
    (`${firstName || ""} ${lastName || ""}`.trim()) ||
    (isGroup ? "Group" : "Unknown");

  // Defensive initials generator
  const getInitials = (input: string) => {
    const cleaned = (input || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (cleaned.length === 0) return "U";
    if (cleaned.length === 1) return cleaned[0].slice(0, 2).toUpperCase();
    return (cleaned[0][0] + cleaned[1][0]).toUpperCase();
  };

  // safe test id (never call toLowerCase on undefined)
  const testId = `chat-item-${displayName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}`;

  return (
    <div
      onClick={onClick}
      data-testid={testId}
      className={`
        flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 rounded-md mx-2
        hover-elevate
        ${isSelected ? "bg-sidebar-accent" : ""}
      `}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-12 w-12">
          {avatar ? (
            <AvatarImage src={avatar} alt={displayName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          )}
        </Avatar>

        {!isGroup && (
          <span
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-sidebar ${
              isOnline ? "bg-status-online" : "bg-status-offline"
            }`}
            data-testid={`status-indicator-${isOnline ? "online" : "offline"}`}
          />
        )}

        {isGroup && (
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-2 ring-sidebar bg-primary flex items-center justify-center">
            <span className="text-[8px] text-primary-foreground font-bold">G</span>
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate text-foreground">
            {displayName}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-sm text-muted-foreground truncate">
            {lastMessage || (isGroup ? "Group chat" : "Start a conversation")}
          </span>

          {unreadCount > 0 && (
            <span
              className="flex-shrink-0 min-w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold px-1.5"
              data-testid="badge-unread-count"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
