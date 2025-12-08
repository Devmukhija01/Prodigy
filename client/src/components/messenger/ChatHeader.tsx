  // // ChatHeader.tsx (safe replacement)
  // import { ArrowLeft, Phone, Video, MoreVertical, Search, Users } from "lucide-react";
  // import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  // import { Button } from "@/components/ui/button";
  // import {
  //   DropdownMenu,
  //   DropdownMenuContent,
  //   DropdownMenuItem,
  //   DropdownMenuSeparator,
  //   DropdownMenuTrigger,
  // } from "@/components/ui/dropdown-menu";

  // interface User {
  //   _id?: string;
  //   firstName?: string;
  //   lastName?: string;
  //   avatar?: string;
  //   isOnline?: boolean;
  // }

  // interface Group {
  //   _id?: string;
  //   name?: string;
  //   avatar?: string;
  //   memberCount?: number;
  // }

  // interface ChatHeaderProps {
  //   chat?: { type: "friend" | "group"; data: User | Group } | null;
  //   onBack?: () => void;
  //   showBackButton?: boolean;
  // }

  // export function ChatHeader({ chat, onBack, showBackButton = false }: ChatHeaderProps) {
  //   // Build displayName safely from chat.data
  //   const getDisplayName = (c: User | Group | null | undefined) => {
  //     if (!c) return "Unknown";
  //     const asAny = c as any;
  //     if (asAny.name && String(asAny.name).trim().length > 0) return String(asAny.name).trim();
  //     const first = String(asAny.firstName || "").trim();
  //     const last = String(asAny.lastName || "").trim();
  //     const full = `${first} ${last}`.trim();
  //     return full || "Unknown";
  //   };

  //   const displayName = getDisplayName(chat?.data as any);

  //   const getInitials = (text: string) => {
  //     const cleaned = String(text || "").trim();
  //     if (!cleaned) return "U";
  //     const parts = cleaned.split(/\s+/).filter(Boolean);
  //     if (parts.length === 0) return "U";
  //     if (parts.length === 1) {
  //       return parts[0].slice(0, 2).toUpperCase();
  //     }
  //     return (String(parts[0][0] || "") + String(parts[1][0] || "")).toUpperCase();
  //   };
  //   const initials = getInitials(displayName);
  //   const isGroup = chat?.type === "group";
  //   const avatarSrc = (chat?.data as any)?.avatar;
  //   const isOnline = (chat?.data as any)?.isOnline;

  //   const getStatusText = () => {
  //     if (isGroup) return `${(chat?.data as any)?.memberCount ?? 0} members`;
  //     if (isOnline) return "Online";
  //     return "Offline";
  //   };

  //   return (
  //     <div className="h-16 px-4 flex items-center justify-between gap-4 border-b bg-background">
  //       <div className="flex items-center gap-3 min-w-0">
  //         {showBackButton && (
  //           <Button size="icon" variant="ghost" onClick={onBack} className="lg:hidden">
  //             <ArrowLeft className="h-5 w-5" />
  //           </Button>
  //         )}

  //         <div className="relative flex-shrink-0">
  //           <Avatar className="h-10 w-10">
  //             {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : <AvatarFallback
  //             className="bg-primary text-white font-semibold text-base"
  //             title={displayName}
  //             aria-label={`Avatar initials ${initials}`}
  //           >
  //             {initials}
  //           </AvatarFallback>
  //           }
  //           </Avatar>
  //         </div>

  //         <div className="min-w-0">
  //           <h2 className="font-semibold text-foreground truncate">{displayName}</h2>
  //           <p className="text-xs text-muted-foreground">
  //             {getStatusText()}
  //           </p>
  //         </div>
  //       </div>

  //       <div className="flex items-center gap-1">
  //         <Button size="icon" variant="ghost"><Search className="h-4 w-4" /></Button>
  //         {/* <Button size="icon" variant="ghost"><Phone className="h-4 w-4" /></Button> */}
  //         {/* <Button size="icon" variant="ghost"><Video className="h-4 w-4" /></Button> */}
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuItem>View {isGroup ? "group info" : "profile"}</DropdownMenuItem>
  //             <DropdownMenuItem>Mute notifications</DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem className="text-destructive">{isGroup ? "Leave group" : "Delete chat"}</DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       </div>
  //     </div>
  //   );
  // }

  // export default ChatHeader;
// src/components/messenger/ChatHeader.tsx
import React from "react";
import { ArrowLeft, MoreVertical, Phone, Search, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Friend = {
  _id?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  isOnline?: boolean;
};

type Group = {
  _id?: string | null;
  name?: string | null;
  avatar?: string | null;
  memberCount?: number;
};

export type ResolvedChat = { type: "friend" | "group"; data: Friend | Group } | null;

export interface ChatHeaderProps {
  // preferred: full resolved chat object
  chat?: ResolvedChat;
  onCallPress?: (type: "audio" | "video") => void;
  // alternative simpler props (ChatWindow might send these)
  name?: string | null;
  avatar?: string | null;
  isOnline?: boolean;
  isGroup?: boolean;
  memberCount?: number | undefined;
  lastSeen?: string | undefined;

  // fallback resolution (not usually needed)
  selectedChatId?: string | null;
  friends?: Friend[];
  groups?: Group[];

  onBack?: () => void;
  showBackButton?: boolean;

  className?: string;
  "data-testid"?: string;
}

/**
 * Robust ChatHeader:
 * - Accepts either `chat` (preferred) OR simple props (name/avatar/isOnline/isGroup).
 * - Shows initials fallback when image fails.
 * - Exports both named and default export.
 */
export function ChatHeader(props: ChatHeaderProps) {
  const {
    chat,
    name,
    avatar,
    isOnline,
    isGroup,
    memberCount,
    lastSeen,
    selectedChatId,
    friends = [],
    groups = [],
    onBack,
    showBackButton = false,
    className = "",
    "data-testid": dataTestId,
    onCallPress,
  } = props;

  // Debug: show what we got (remove or lower-level log in prod)
  React.useEffect(() => {
    console.debug("ChatHeader props:", { chat, name, avatar, isOnline, isGroup, memberCount, selectedChatId });
  }, [chat, name, avatar, isOnline, isGroup, memberCount, selectedChatId]);

  // Simple-prop presence
  const hasSimpleName = typeof name === "string" && name.trim().length > 0;
  const simpleName = hasSimpleName ? name!.trim() : null;
  const simpleAvatar = typeof avatar === "string" && avatar.trim().length > 0 ? avatar!.trim() : undefined;

  // Resolve chat if `chat` provided or if selectedChatId + lists given
  const resolvedChat = React.useMemo<ResolvedChat>(() => {
    if (chat) return chat;
    if (simpleName || simpleAvatar) return null;
    if (!selectedChatId) return null;
    const f = friends.find((x) => String(x._id) === String(selectedChatId));
    if (f) return { type: "friend", data: f };
    const g = groups.find((x) => String(x._id) === String(selectedChatId));
    if (g) return { type: "group", data: g };
    return null;
  }, [chat, selectedChatId, friends, groups, simpleName, simpleAvatar]);

  // Compute display name
  const displayName = React.useMemo(() => {
    if (simpleName) return simpleName;
    if (resolvedChat) {
      if (resolvedChat.type === "group") {
        const n = String((resolvedChat.data as Group).name ?? "").trim();
        return n || "Unknown group";
      }
      const d = resolvedChat.data as Friend;
      const first = String(d?.firstName ?? "").trim();
      const last = String(d?.lastName ?? "").trim();
      const full = `${first} ${last}`.trim();
      return full || "Unknown";
    }
    return "Unknown";
  }, [simpleName, resolvedChat]);

  // initials
  const initials = React.useMemo(() => {
    const txt = (displayName || "").trim();
    if (!txt) return "U";
    const parts = txt.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (String(parts[0][0] || "") + String(parts[1][0] || "")).toUpperCase();
  }, [displayName]);

  // avatar src - priority: simpleAvatar -> resolvedChat.data.avatar -> undefined
  const avatarSrc = React.useMemo(() => {
    if (simpleAvatar) return simpleAvatar;
    if (resolvedChat) {
      const dataAny = resolvedChat.data as any;
      return dataAny?.avatar ? String(dataAny.avatar) : undefined;
    }
    // last attempt
    if (chat && chat.data) {
      const dataAny = (chat.data as any);
      return dataAny?.avatar ? String(dataAny.avatar) : undefined;
    }
    return undefined;
  }, [simpleAvatar, resolvedChat, chat]);

  const resolvedIsGroup = (typeof isGroup === "boolean" ? isGroup : resolvedChat?.type === "group") ?? false;
  const resolvedIsOnline =
    typeof isOnline === "boolean" ? isOnline : !!(resolvedChat && (resolvedChat.data as any)?.isOnline);

  const resolvedMemberCount =
    typeof memberCount === "number"
      ? memberCount
      : resolvedIsGroup && resolvedChat && resolvedChat.type === "group"
      ? (resolvedChat.data as Group).memberCount
      : undefined;

  const statusText = React.useMemo(() => {
    if (resolvedIsGroup) return `${resolvedMemberCount ?? 0} members`;
    if (resolvedIsOnline) return "Online";
    return lastSeen ?? "Offline";
  }, [resolvedIsGroup, resolvedIsOnline, resolvedMemberCount, lastSeen]);

  // handle image error fallback
  const [imgError, setImgError] = React.useState(false);
  React.useEffect(() => setImgError(false), [avatarSrc]);

  
  return (
    <div
      className={`h-16 px-4 flex items-center justify-between gap-4 border-b bg-background ${className}`}
      data-testid={dataTestId ?? "chat-header"}
      role="region"
      aria-label={`Chat header for ${displayName}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton && (
          <Button size="icon" variant="ghost" onClick={onBack} className="lg:hidden" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div className="relative flex-shrink-0">
          <Avatar className="h-10 w-10">
            {avatarSrc && !imgError ? (
              <AvatarImage src={avatarSrc} alt={`${displayName} avatar`} onError={() => setImgError(true)} loading="lazy" />
            ) : (
              <AvatarFallback className="bg-primary text-white font-semibold text-sm flex items-center justify-center" title={displayName}>
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-foreground truncate" title={displayName} aria-live="polite">
            {displayName}
          </h2>
          <p className="text-xs text-muted-foreground truncate" title={statusText}>
            {statusText}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" aria-label="Search messages">
          <Search className="h-4 w-4" />
        </Button>
        <Button
        size="icon"
        variant="ghost"
        aria-label="Audio Call"
        onClick={() => onCallPress?.("audio")}
      >
        <Phone className="h-4 w-4" />
      </Button>

      {/* <Button
        size="icon"
        variant="ghost"
        aria-label="Video Call"
        onClick={() => onCallPress?.("video")}
      >
        <Video className="h-4 w-4" />
      </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem>View {resolvedIsGroup ? "group info" : "profile"}</DropdownMenuItem>
            <DropdownMenuItem>Mute notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">{resolvedIsGroup ? "Leave group" : "Delete chat"}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// named and default export
export default ChatHeader;
