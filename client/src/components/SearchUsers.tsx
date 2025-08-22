import { useState } from 'react';
import { Search, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
// import { User } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import user from 'server/routes/user';

const CURRENT_USER_ID = localStorage.getItem("userId");
 // gives "1"

 console.log("🚀 CURRENT_USER_ID =", CURRENT_USER_ID);

export const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/users/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return null;
    
      const res = await fetch(`http://https://prodigy-59mg.onrender.com/api/user/search?registerId=${encodeURIComponent(searchQuery)}`);

    
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
    
      return res.json();
    },
    enabled: !!searchQuery,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (toUserId: number) => {
      // if (!CURRENT_USER_ID) {
      //   toast({
      //     title: "Error",
      //     description: "You must be logged in to send a friend request.",
      //     variant: "destructive",
      //   });
      //   return;
      // }
      if (!CURRENT_USER_ID || CURRENT_USER_ID.length !== 24) {
        toast({
          title: "Invalid Session",
          description: "Please log in again — user ID is not valid.",
          variant: "destructive"
        });
        return;
      }
      
      const response = await apiRequest('POST', '/api/friend-requests', {
        fromUserId: CURRENT_USER_ID,
        toUserId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Friend request sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSearchQuery(searchTerm.trim());
    }
  };

  const handleSendRequest = (userId: number) => {
    sendRequestMutation.mutate(userId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 px-4 lg:px-8">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Find Users</h2>
        <p className="text-gray-600 dark:text-gray-400">Search for users by their unique ID</p>
      </div>

      {/* Search Form */}
      <Card className="glass-effect shadow-xl">
        <CardContent className="p-6">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Enter User ID (e.g., user123)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchTerm.trim() || isLoading}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {error && (
  <Card className="glass-effect shadow-xl">
    <CardContent className="p-6 text-center">
      <p className="text-red-600 dark:text-red-400">
        {error.message?.includes('User not found') 
          ? 'User not found' 
          : `Error searching for user: ${error.message}`}
      </p>
    </CardContent>
  </Card>
)}


      {user && (
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 bg-gradient-to-br from-primary to-secondary">
                <AvatarFallback className="text-white text-xl font-bold">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user.username}</h3>
                <p className="text-gray-600 dark:text-gray-400">{user.fullName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{user.email}</p>
              </div>
              
              <Button 
                onClick={() => handleSendRequest(user.id)}
                disabled={sendRequestMutation.isPending}
                className="bg-gradient-to-r from-accent to-green-500 hover:shadow-lg"
              >
                {sendRequestMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Sending...</span>
                  </div>
                ) : sendRequestMutation.isSuccess ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Request Sent</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus size={16} />
                    <span>Send Request</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
