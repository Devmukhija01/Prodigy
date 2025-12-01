import { useState } from 'react';
import { Check, X, Loader2, Clock, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserAvatar from './UserAvatar';

interface FriendRequestCardProps {
  request: {
    id: string;
    fromUser: {
      id: string;
      username: string;
      fullName: string;
    };
    createdAt: string;
  };
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function FriendRequestCard({ request, onAccept, onReject }: FriendRequestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [handled, setHandled] = useState<'accepted' | 'rejected' | null>(null);

  const handleAccept = async () => {
    if (handled || isAccepting || isRejecting) return;
    setIsAccepting(true);
    try {
      await onAccept(request.id);
      setHandled('accepted');
    } catch {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (handled || isAccepting || isRejecting) return;
    setIsRejecting(true);
    try {
      await onReject(request.id);
      setHandled('rejected');
    } catch {
      setIsRejecting(false);
    }
  };

  if (handled) {
    return (
      <Card 
        className="opacity-75 transition-all duration-500"
        data-testid={`card-request-${request.id}`}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <UserAvatar name={request.fromUser.fullName || request.fromUser.username} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{request.fromUser.fullName}</p>
              <p className="text-sm text-muted-foreground">
                {handled === 'accepted' ? 'You are now connected' : 'Request declined'}
              </p>
            </div>
            <Badge 
              variant={handled === 'accepted' ? 'default' : 'secondary'}
              className={handled === 'accepted' ? 'gradient-success border-0 text-white' : ''}
            >
              {handled === 'accepted' ? (
                <>
                  <UserCheck className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : 'Declined'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover-elevate transition-all duration-300 group"
      data-testid={`card-request-${request.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <UserAvatar name={request.fromUser.fullName || request.fromUser.username} size="lg" />
          
          <div className="flex-1 min-w-0 space-y-1">
            <h4 
              className="font-semibold text-foreground text-lg"
              data-testid="text-request-username"
            >
              {request.fromUser.fullName}
            </h4>
            <p 
              className="text-sm text-muted-foreground"
              data-testid="text-request-fullname"
            >
              @{request.fromUser.username}
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(request.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleReject}
              disabled={isAccepting || isRejecting}
              className="w-11 h-11 rounded-full border-destructive/30 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
              aria-label="Decline request"
              data-testid="button-reject-request"
            >
              {isRejecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </Button>
            <Button
              size="icon"
              onClick={handleAccept}
              disabled={isAccepting || isRejecting}
              className="w-11 h-11 rounded-full gradient-success border-0 text-white"
              aria-label="Accept request"
              data-testid="button-accept-request"
            >
              {isAccepting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
