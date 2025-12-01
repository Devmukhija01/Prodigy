import { useState } from 'react';
import { UserPlus, CheckCircle, Loader2, Mail, AtSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserAvatar from './UserAvatar';

interface UserSearchResultProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    email?: string;
  };
  onSendRequest: (userId: string) => Promise<void>;
  requestSent?: boolean;
}

export default function UserSearchResult({ user, onSendRequest, requestSent = false }: UserSearchResultProps) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(requestSent);

  const handleSendRequest = async () => {
    if (sent || isSending) return;
    setIsSending(true);
    try {
      await onSendRequest(user.id);
      setSent(true);
    } catch {
      setIsSending(false);
    }
  };

  return (
    <Card 
      className="hover-elevate transition-all duration-300 group"
      data-testid={`card-user-${user.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <UserAvatar name={user.fullName || user.username} size="xl" showRing />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-chart-2 rounded-full border-2 border-card flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 
                className="text-xl font-bold text-foreground"
                data-testid="text-username"
              >
                {user.fullName}
              </h3>
              <Badge variant="secondary" className="font-normal">
                <AtSign className="w-3 h-3 mr-1" />
                {user.username}
              </Badge>
            </div>
            
            {user.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span 
                  className="text-sm truncate"
                  data-testid="text-email"
                >
                  {user.email}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handleSendRequest}
            disabled={sent || isSending}
            size="lg"
            className={`
              transition-all duration-300
              ${sent 
                ? 'gradient-success text-white border-0' 
                : 'gradient-primary text-white border-0'
              }
            `}
            data-testid="button-send-request"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Sending</span>
              </>
            ) : sent ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Request Sent</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                <span>Connect</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
