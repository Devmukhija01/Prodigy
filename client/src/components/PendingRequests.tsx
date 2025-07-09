import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useEffect } from 'react';

const CURRENT_USER_ID = 1; // This would come from authentication context

export const PendingRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { friendRequests, setFriendRequests } = useWebSocket(CURRENT_USER_ID);

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['/api/friend-requests/pending', CURRENT_USER_ID],
  });

  // Merge WebSocket requests with fetched requests
  useEffect(() => {
    if (friendRequests.length > 0) {
      setFriendRequests(prev => [...prev, ...friendRequests]);
    }
  }, [friendRequests, setFriendRequests]);

  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: 'accepted' | 'rejected' }) => {
      const response = await apiRequest('PATCH', `/api/friend-requests/${requestId}`, { status });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Success!",
        description: `Friend request ${status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to handle request",
        variant: "destructive",
      });
    },
  });

  const handleAccept = (requestId: number) => {
    handleRequestMutation.mutate({ requestId, status: 'accepted' });
  };

  const handleReject = (requestId: number) => {
    handleRequestMutation.mutate({ requestId, status: 'rejected' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const allRequests = [...pendingRequests, ...friendRequests];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Requests</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your incoming friend requests</p>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Requests</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your incoming friend requests</p>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {allRequests.length === 0 ? (
          <Card className="glass-effect shadow-xl">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          allRequests.map((request) => (
            <Card key={request.id} className="glass-effect shadow-xl request-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
                      <AvatarFallback className="text-white font-bold">
                        {getInitials(request.fromUser.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.fromUser.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {request.fromUser.fullName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTimeAgo(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      disabled={handleRequestMutation.isPending}
                      className="bg-gradient-to-r from-accent to-green-500 hover:shadow-lg"
                    >
                      <Check size={16} className="mr-1" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={handleRequestMutation.isPending}
                      variant="destructive"
                      className="bg-gradient-to-r from-destructive to-red-500 hover:shadow-lg"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
