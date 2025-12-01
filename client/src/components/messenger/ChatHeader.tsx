  // ChatHeader.tsx (safe replacement)
  import { ArrowLeft, Phone, Video, MoreVertical, Search, Users } from "lucide-react";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

  interface User {
    _id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    isOnline?: boolean;
  }

  interface Group {
    _id?: string;
    name?: string;
    avatar?: string;
    memberCount?: number;
  }

  interface ChatHeaderProps {
    chat?: { type: "friend" | "group"; data: User | Group } | null;
    onBack?: () => void;
    showBackButton?: boolean;
  }

  export function ChatHeader({ chat, onBack, showBackButton = false }: ChatHeaderProps) {
    // Build displayName safely from chat.data
    const getDisplayName = (c: User | Group | null | undefined) => {
      if (!c) return "Unknown";
      const asAny = c as any;
      if (asAny.name && String(asAny.name).trim().length > 0) return String(asAny.name).trim();
      const first = String(asAny.firstName || "").trim();
      const last = String(asAny.lastName || "").trim();
      const full = `${first} ${last}`.trim();
      return full || "Unknown";
    };

    const displayName = getDisplayName(chat?.data as any);

    const getInitials = (text: string) => {
      const cleaned = String(text || "").trim();
      if (!cleaned) return "U";
      const parts = cleaned.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return "U";
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return (String(parts[0][0] || "") + String(parts[1][0] || "")).toUpperCase();
    };
    const initials = getInitials(displayName);
    const isGroup = chat?.type === "group";
    const avatarSrc = (chat?.data as any)?.avatar;
    const isOnline = (chat?.data as any)?.isOnline;

    const getStatusText = () => {
      if (isGroup) return `${(chat?.data as any)?.memberCount ?? 0} members`;
      if (isOnline) return "Online";
      return "Offline";
    };

    return (
      <div className="h-16 px-4 flex items-center justify-between gap-4 border-b bg-background">
        <div className="flex items-center gap-3 min-w-0">
          {showBackButton && (
            <Button size="icon" variant="ghost" onClick={onBack} className="lg:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayName} /> : <AvatarFallback
              className="bg-primary text-white font-semibold text-base"
              title={displayName}
              aria-label={`Avatar initials ${initials}`}
            >
              {initials}
            </AvatarFallback>
            }
            </Avatar>
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-foreground truncate">{displayName}</h2>
            <p className="text-xs text-muted-foreground">
              {getStatusText()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost"><Search className="h-4 w-4" /></Button>
          {/* <Button size="icon" variant="ghost"><Phone className="h-4 w-4" /></Button> */}
          {/* <Button size="icon" variant="ghost"><Video className="h-4 w-4" /></Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View {isGroup ? "group info" : "profile"}</DropdownMenuItem>
              <DropdownMenuItem>Mute notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">{isGroup ? "Leave group" : "Delete chat"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  export default ChatHeader;
