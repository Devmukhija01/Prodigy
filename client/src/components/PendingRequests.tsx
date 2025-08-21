// import { Check, X } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';
// import { useToast } from '@/hooks/use-toast';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { useEffect } from 'react';

// // Get user ID from localStorage
// const getCurrentUserId = () => {
//   const userData = localStorage.getItem("userData");
//   if (userData) {
//     try {
//       const parsed = JSON.parse(userData);
//       return parsed._id || localStorage.getItem("userId");
//     } catch (error) {
//       console.error("Error parsing userData:", error);
//       return localStorage.getItem("userId");
//     }
//   }
//   return localStorage.getItem("userId");
// };

// const CURRENT_USER_ID = getCurrentUserId();

// export const PendingRequests = () => {
//   if (!CURRENT_USER_ID) {
//     return (
//       <div className="w-full max-w-4xl mx-auto px-4 lg:px-8">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Requests</h2>
//           <p className="text-gray-600 dark:text-gray-400">Manage your incoming friend requests</p>
//         </div>
//         <div className="text-center py-8">
//           <p className="text-gray-600 dark:text-gray-400">Please log in to view pending requests.</p>
//         </div>
//       </div>
//     );
//   }

//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const { friendRequests, setFriendRequests } = useWebSocket(CURRENT_USER_ID);

//   const { data: pendingRequests = [], isLoading } = useQuery({
//     queryKey: ['/api/friend-requests/pending'],
//     queryFn: async () => {
//       console.log('Fetching pending requests for user ID:');
//       const res = await apiRequest('GET', `/api/friend-requests/pending/`);
//       const data = await res.json();
//       console.log('Pending requests response:', data);
//       return data;
//     },
//   });
  
//   // Merge WebSocket requests with fetched requests
//   useEffect(() => {
//     setFriendRequests(prev => {
//       const existingIds = new Set(prev.map(req => req._id));
//       const newOnes = (Array.isArray(friendRequests) ? friendRequests : []).filter(
//         req => !existingIds.has(req._id)
//       );
//       return [...prev, ...newOnes];
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // Only run once

//   console.log("Pending requests:", pendingRequests);

//   const handleRequestMutation = useMutation({
//     mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
//       console.log("Sending request with ID:", requestId, "Status:", status);
//       const response = await apiRequest('PATCH', `/api/friend-requests/${requestId}`, { status });
//       return response.json();
//     },
//     onSuccess: (_, { status }) => {
//       toast({
//         title: "Success!",
//         description: `Friend request ${status}`,
//       });
//       queryClient.invalidateQueries({ queryKey: ['/api/friend-requests'] });
//       queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/friends'] });
//       queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to handle request",
//         variant: "destructive",
//       });
//     },
//   });

//   const handleAccept = (requestId: string) => {
//     console.log("Accepting request with ID:", requestId);
//     handleRequestMutation.mutate({ requestId, status: 'accepted' });
//   };

//   const handleReject = (requestId: string) => {
//     console.log("Rejecting request with ID:", requestId);
//     handleRequestMutation.mutate({ requestId, status: 'rejected' });
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date();
//     const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours < 24) return `${diffInHours} hours ago`;
//     return `${Math.floor(diffInHours / 24)} days ago`;
//   };

//   // Ensure both pendingRequests and friendRequests are arrays before spreading
//   const allRequests = [
//     ...(Array.isArray(pendingRequests) ? pendingRequests : []),
//     ...(Array.isArray(friendRequests) ? friendRequests : [])
//   ];

//   if (isLoading) {
//     return (
//       <div className="w-full max-w-4xl mx-auto px-4 lg:px-8">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Requests</h2>
//           <p className="text-gray-600 dark:text-gray-400">Manage your incoming friend requests</p>
//         </div>
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
//           <p className="text-gray-600 dark:text-gray-400 mt-4">Loading requests...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto space-y-8 px-4 lg:px-8">
//       {/* Header */}
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Requests</h2>
//         <p className="text-gray-600 dark:text-gray-400">Manage your incoming friend requests</p>
        
//         {/* Debug Info */}
        
//       </div>

//       {/* Requests List */}
//       <div className="space-y-4">
//         {allRequests.length === 0 ? (
//           <Card className="glass-effect shadow-xl">
//             <CardContent className="p-8 text-center">
//               <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
//             </CardContent>
//           </Card>
//         ) : (
//           allRequests.map((request) => {
//             console.log("Request fromUser data:", request.fromUser);
//             console.log("Full request object:", request);
//             console.log("Request ID:", request.id, "Type:", typeof request.id);
//             console.log("Request _id:", request._id, "Type:", typeof request._id);
//             console.log("All request keys:", Object.keys(request));
//             console.log("Request ID to be used:", request._id || request.id);
//             return (
//               <Card key={request._id} className="glass-effect shadow-xl request-card">
//                 <CardContent className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
//                         <AvatarFallback className="text-white font-bold">
//                         {getInitials(request.fromUser?.firstName + ' ' + request.fromUser?.lastName || '')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                           {request.fromUser.registerId}
//                         </h3>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           {request.fromUser.firstName && request.fromUser.lastName 
//                             ? `${request.fromUser.firstName} ${request.fromUser.lastName}`
//                             : request.fromUser.registerId
//                           }
//                         </p>
//                         <p className="text-xs text-gray-400 dark:text-gray-500">
//                           {request.fromUser.email}
//                         </p>
//                         <p className="text-xs text-gray-400 dark:text-gray-500">
//                           {new Date(request.createdAt).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex space-x-3">
//                       <Button
//                         onClick={() => handleAccept(request._id)}
//                         disabled={handleRequestMutation.isPending}
//                         className="bg-gradient-to-r from-accent to-green-500 hover:shadow-lg"
//                       >
//                         <Check size={16} className="mr-1" />
//                         Accept
//                       </Button>
//                       <Button
//                         onClick={() => handleReject(request._id)}
//                         disabled={handleRequestMutation.isPending}
//                         variant="destructive"
//                         className="bg-gradient-to-r from-destructive to-red-500 hover:shadow-lg"
//                       >
//                         <X size={16} className="mr-1" />
//                         Reject
//                       </Button>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';

// Get user ID from localStorage
const getCurrentUserId = () => {
  const userData = localStorage.getItem("userData");
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      return parsed._id || localStorage.getItem("userId");
    } catch (error) {
      console.error("Error parsing userData:", error);
      return localStorage.getItem("userId");
    }
  }
  return localStorage.getItem("userId");
};

const CURRENT_USER_ID = getCurrentUserId();

export const PendingRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { friendRequests, setFriendRequests } = useSocket(CURRENT_USER_ID);

  // Local state to remove requests immediately
  const [localRequests, setLocalRequests] = useState<any[]>([]);

  const { data: pendingRequests = [], isLoading } = useQuery({
    queryKey: ['/api/friend-requests/pending'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/friend-requests/pending/`);
      return res.json();
    },
    onSuccess: (data) => {
      setLocalRequests(data); // initialize local state
    },
  });

  // Merge WebSocket requests with fetched requests
  useEffect(() => {
    console.log("🔔 Friend requests updated:", friendRequests);
  }, [friendRequests]);
  

  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
      const response = await apiRequest('PATCH', `/api/friend-requests/${requestId}`, { status });
      return response.json();
    },
    onSuccess: (_, { requestId, status }) => {
      // ✅ Remove request immediately from local state
      setLocalRequests(prev => prev.filter(req => req._id !== requestId));

      toast({
        title: "Success!",
        description: `Friend request ${status}`,
      });

      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/friends'] });
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

  const handleAccept = (requestId: string) => {
    handleRequestMutation.mutate({ requestId, status: 'accepted' });
  };

  const handleReject = (requestId: string) => {
    handleRequestMutation.mutate({ requestId, status: 'rejected' });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 lg:px-8">
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
    <div className="w-full max-w-4xl mx-auto space-y-8 px-4 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Pending Requests</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your incoming friend requests</p>
      </div>

      <div className="space-y-4">
        {localRequests.length === 0 ? (
          <Card className="glass-effect shadow-xl">
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          localRequests.map((request) => (
            <Card key={request._id} className="glass-effect shadow-xl request-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
                      <AvatarFallback className="text-white font-bold">
                        {getInitials(request.fromUser?.firstName + ' ' + request.fromUser?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {request.fromUser.registerId}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {request.fromUser.firstName && request.fromUser.lastName
                          ? `${request.fromUser.firstName} ${request.fromUser.lastName}`
                          : request.fromUser.registerId}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {request.fromUser.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAccept(request._id)}
                      disabled={handleRequestMutation.isPending}
                      className="bg-gradient-to-r from-accent to-green-500 hover:shadow-lg"
                    >
                      <Check size={16} className="mr-1" />
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleReject(request._id)}
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
