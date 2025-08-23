// import { useState, useEffect, useRef } from 'react';
// import { Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { User } from '@shared/schema';
// import { useAuth } from '@/hooks/useAuth';

// // MongoDB Message type
// interface Message {
//   _id: string;
//   fromUserId: string;
//   toUserId: string;
//   content: string;
//   timestamp: Date;
// }

// export const ChatInterface = () => {
//   const { user, isAuthenticated } = useAuth();
//   const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
//   const [messageInput, setMessageInput] = useState('');
//   const [chatMessages, setChatMessages] = useState<Message[]>([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const queryClient = useQueryClient();
  
//   if (!isAuthenticated || !user) {
//     return <div className="text-center p-8">Please log in to use chat.</div>;
//   }

//   const { messages, userStatuses, sendMessage: sendWebSocketMessage, isConnected } = useWebSocket(String(user.id));
    
//   console.log('ChatInterface - WebSocket connected:', isConnected);
//   console.log('ChatInterface - Current user ID:', String(user.id));
//   console.log('ChatInterface - Selected friend:', selectedFriend);
//   console.log('ChatInterface - Messages from WebSocket:', messages);
//   console.log('ChatInterface - Chat messages:', chatMessages);

//   const { data: friends = [] } = useQuery({
//     queryKey: ['/api/friend-requests/friends'],
//     queryFn: async () => {
//       const res = await apiRequest('GET', `/api/friend-requests/friends`);
//       return res.json();
//     },
//     enabled: !!user,
//   });

//   const { data: messagesData = [] } = useQuery({
//     queryKey: ['/api/messages', selectedFriend?._id],
//     queryFn: async () => {
//       if (!selectedFriend?._id) return [];
//       const res = await apiRequest('GET', `/api/messages/${selectedFriend._id}`);
//       return res.json();
//     },
//     enabled: !!selectedFriend && !!user,
//   });

//   useEffect(() => {
//     if (messagesData) {
//       setChatMessages(messagesData);
//     }
//   }, [messagesData]);

//   useEffect(() => {
//     // Add new WebSocket messages to chat
//     if (!selectedFriend) return;
    
//     const newMessages = messages.filter(
//       msg => 
//         ((msg.fromUserId === selectedFriend._id && msg.toUserId === String(user.id)) ||
//          (msg.fromUserId === String(user.id) && msg.toUserId === selectedFriend._id))
//     );
    
//     if (newMessages.length > 0) {
//       console.log('Adding new messages to chat:', newMessages);
//       setChatMessages(prev => {
//         const existingIds = new Set(prev.map(m => m._id));
//         const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m._id));
//         if (uniqueNewMessages.length > 0) {
//           console.log('Adding unique messages:', uniqueNewMessages);
//           return [...prev, ...uniqueNewMessages];
//         }
//         return prev;
//       });
//     }
//   }, [messages, selectedFriend?._id, String(user.id)]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatMessages]);

//   const sendMessageMutation = useMutation({
//     mutationFn: async (content: string) => {
//       console.log("Sending message via WebSocket:", {
//         fromUserId: String(user.id),
//         toUserId: selectedFriend!._id,
//         content,
//       });
      
//       // Send via WebSocket for real-time delivery
//       sendWebSocketMessage(selectedFriend!._id, content);
      
//       // Also save to database via API as backup
//       const response = await apiRequest('POST', '/api/messages', {
//         fromUserId: String(user.id),
//         toUserId: selectedFriend!._id,
//         content,
//       });
//       return response.json();
//     },
//     onSuccess: (message) => {
//       // Add the message to chat immediately for sender
//       console.log("Message sent successfully, adding to chat:", message);
//       setChatMessages(prev => [...prev, message]);
//     },
//     onError: (error) => {
//       console.error("Error sending message:", error);
//     },
//   });

//   const handleSendMessage = () => {
//     if (!messageInput.trim() || !selectedFriend) return;
    
//     console.log('Sending message:', messageInput, 'to friend:', selectedFriend._id);
//     sendMessageMutation.mutate(messageInput);
//     setMessageInput('');
//   };

//   const testWebSocket = () => {
//     if (selectedFriend) {
//       console.log('Testing WebSocket message to:', selectedFriend._id);
//       sendWebSocketMessage(selectedFriend._id, 'Test message from WebSocket');
//     }
//   };

//   const getInitials = (name: string) => {
//     return name.split(' ').map(n => n[0]).join('').toUpperCase();
//   };

//   const formatTime = (date: Date) => {
//     return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const isUserOnline = (userId: string) => {
//     return userStatuses.get(userId) || false;
//   };

//   const getLastMessage = (friendId: string) => {
//     const friendMessages = messages.filter(
//       msg => 
//         (msg.fromUserId === friendId && msg.toUserId === String(user.id)) ||
//         (msg.fromUserId === String(user.id) && msg.toUserId === friendId)
//     );
//     return friendMessages[friendMessages.length - 1];
//   };

//   return (
//     <div className="w-full h-screen flex flex-col px-4 lg:px-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 max-w-7xl mx-auto w-full">
        
//         {/* Chat List */}
//         <div className="lg:col-span-1">
//           <Card className="h-full glass-effect shadow-xl flex flex-col">
//             <CardContent className="p-0 flex flex-col h-full">
//               <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
//               </div>
//               <div className="flex-1 overflow-y-auto">
//                 {/* Friend list rendering here */}
//                 {friends.map((friend: User) => {
//                   const lastMessage = getLastMessage(friend._id);
//                   const isOnline = isUserOnline(friend._id);
                  
//                   return (
//                     <div
//                       key={friend._id}
//                       onClick={() => setSelectedFriend(friend)}
//                       className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
//                         selectedFriend?._id === friend._id ? 'bg-primary/10 border-l-4 border-primary' : ''
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <div className="relative">
//                           <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
//                             {friend.avatar && (
//                               <AvatarImage 
//                                 src={friend.avatar} 
//                                 alt={`${friend.firstName} ${friend.lastName}`}
//                               />
//                             )}
//                             <AvatarFallback className="text-white font-bold">
//                               {getInitials(friend.firstName + ' ' + friend.lastName || friend.registerId || '')}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
//                             isOnline ? 'bg-green-500' : 'bg-gray-400'
//                           }`} />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex justify-between items-start">
//                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
//                               {friend.firstName && friend.lastName 
//                                 ? `${friend.firstName} ${friend.lastName}`
//                                 : friend.registerId || 'Unknown User'
//                               }
//                             </h3>
//                             {lastMessage && (
//                               <span className="text-xs text-gray-500 dark:text-gray-400">
//                                 {formatTime(lastMessage.timestamp)}
//                               </span>
//                             )}
//                           </div>
//                           <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
//                             {lastMessage?.content || 'No messages yet'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
  
//         {/* Chat Window */}
//         <div className="lg:col-span-2 flex flex-col h-full min-h-0">
//           <Card className="flex flex-col h-full min-h-0 glass-effect shadow-xl">
//             {selectedFriend ? (
//               <>
//                 {/* Chat Header */}
//                 <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
//                   <div className="flex items-center space-x-3">
//                     <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500">
//                       {selectedFriend.avatar && (
//                         <AvatarImage 
//                           src={selectedFriend.avatar} 
//                           alt={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
//                         />
//                       )}
//                       <AvatarFallback className="text-white font-bold">
//                         {getInitials(selectedFriend.firstName + ' ' + selectedFriend.lastName || selectedFriend.registerId || '')}
//                       </AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                         {selectedFriend.firstName && selectedFriend.lastName 
//                           ? `${selectedFriend.firstName} ${selectedFriend.lastName}`
//                           : selectedFriend.registerId || 'Unknown User'
//                         }
//                       </h3>
//                       <Badge variant={isUserOnline(selectedFriend._id) ? 'default' : 'secondary'}>
//                         {isUserOnline(selectedFriend._id) ? 'Online' : 'Offline'}
//                       </Badge>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <Button variant="ghost" size="sm" onClick={testWebSocket}>
//                       Test WS
//                     </Button>
//                     <Button variant="ghost" size="sm">
//                       <Phone size={16} />
//                     </Button>
//                     <Button variant="ghost" size="sm">
//                       <Video size={16} />
//                     </Button>
//                     <Button variant="ghost" size="sm">
//                       <MoreVertical size={16} />
//                     </Button>
//                   </div>
//                 </div>
  
//                 {/* Messages */}
//                 <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
//                   {chatMessages.map((message) => (
//                     <div
//                       key={message._id}
//                       className={`flex ${
//                         message.fromUserId === String(user.id) ? 'justify-end' : 'items-start space-x-2'
//                       }`}
//                     >
//                       {message.fromUserId !== String(user.id) && (
//                         <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500">
//                           {selectedFriend.avatar && (
//                             <AvatarImage 
//                               src={selectedFriend.avatar} 
//                               alt={`${selectedFriend.firstName} ${selectedFriend.lastName}`}
//                             />
//                           )}
//                           <AvatarFallback className="text-white text-sm font-bold">
//                             {getInitials(selectedFriend.firstName + ' ' + selectedFriend.lastName || selectedFriend.registerId || '')}
//                           </AvatarFallback>
//                         </Avatar>
//                       )}
//                       <div className={`flex flex-col ${message.fromUserId === String(user.id) ? 'items-end' : ''}`}>
//                         <div
//                           className={`px-4 py-2 rounded-2xl max-w-xs ${
//                             message.fromUserId === String(user.id)
//                               ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-md'
//                               : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-md'
//                           }`}
//                         >
//                           <p>{message.content}</p>
//                         </div>
//                         <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 mx-2">
//                           {formatTime(message.timestamp)}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                 </div>
  
//                 {/* Message Input */}
//                 <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
//                   <div className="flex items-center space-x-4">
//                     <Button variant="ghost" size="sm">
//                       <Paperclip size={16} />
//                     </Button>
//                     <div className="flex-1 relative">
//                       <Input
//                         placeholder="Type a message..."
//                         value={messageInput}
//                         onChange={(e) => setMessageInput(e.target.value)}
//                         onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
//                         className="rounded-full pr-12"
//                       />
//                       <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
//                         <Smile size={16} />
//                       </Button>
//                     </div>
//                     <Button
//                       onClick={handleSendMessage}
//                       disabled={!messageInput.trim() || sendMessageMutation.isPending}
//                       className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full hover:shadow-lg"
//                     >
//                       <Send size={16} />
//                     </Button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center min-h-0">
//                 <div className="text-center">
//                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//                     Select a chat to start messaging
//                   </h3>
//                   <p className="text-gray-600 dark:text-gray-400">
//                     Choose a friend from the list to begin your conversation
//                   </p>
//                 </div>
//               </div>
//             )}
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
  
// };
// import { useState, useEffect, useRef } from 'react';
// import { Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent } from '@/components/ui/card';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Badge } from '@/components/ui/badge';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { User } from '@shared/schema';
// import { useAuth } from '@/hooks/useAuth';

// interface Message {
//   _id: string;
//   fromUserId: string;
//   toUserId: string;
//   content: string;
//   timestamp: string | Date; // fix: API sends string
// }

// export const ChatInterface = () => {
//   const { user, isAuthenticated } = useAuth();
//   const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
//   const [messageInput, setMessageInput] = useState('');
//   const [chatMessages, setChatMessages] = useState<Message[]>([]);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const queryClient = useQueryClient();

//   if (!isAuthenticated || !user) {
//     return <div className="text-center p-8">Please log in to use chat.</div>;
//   }

//   const { messages: wsMessages, userStatuses, sendMessage: sendWebSocketMessage, isConnected } = useWebSocket(String(user.id));

//   const { data: friends = [] } = useQuery({
//     queryKey: ['/api/friend-requests/friends'],
//     queryFn: async () => {
//       const res = await apiRequest('GET', `/api/friend-requests/friends`);
//       return res.json();
//     },
//     enabled: !!user,
//   });

//   const { data: messagesData = [] } = useQuery({
//     queryKey: ['/api/messages', selectedFriend?._id],
//     queryFn: async () => {
//       if (!selectedFriend?._id) return [];
//       const res = await apiRequest('GET', `/api/messages/${selectedFriend._id}`);
//       return res.json();
//     },
//     enabled: !!selectedFriend && !!user,
//   });

//   // load initial messages from API
//   useEffect(() => {
//     if (messagesData) setChatMessages(messagesData);
//   }, [messagesData]);

//   // handle new WebSocket messages
//   useEffect(() => {
//     if (!selectedFriend) return;

//     const newMessages = wsMessages.filter(
//       (msg) =>
//         (msg.fromUserId === selectedFriend._id && msg.toUserId === String(user.id)) ||
//         (msg.fromUserId === String(user.id) && msg.toUserId === selectedFriend._id)
//     );

//     if (newMessages.length > 0) {
//       setChatMessages((prev) => {
//         const existingIds = new Set(prev.map((m) => m._id));
//         const uniqueNew = newMessages.filter((m) => !existingIds.has(m._id));
//         return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
//       });
//     }
//   }, [wsMessages, selectedFriend?._id, user.id]);

//   // auto scroll
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [chatMessages]);

//   const sendMessageMutation = useMutation({
//     mutationFn: async (content: string) => {
//       sendWebSocketMessage(selectedFriend!._id, content);
//       const response = await apiRequest('POST', '/api/messages', {
//         fromUserId: String(user.id),
//         toUserId: selectedFriend!._id,
//         content,
//       });
//       return response.json();
//     },
//     onSuccess: (message) => {
//       setChatMessages((prev) => [...prev, message]);
//       queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedFriend?._id] });
//     },
//   });

//   const handleSendMessage = () => {
//     if (!messageInput.trim() || !selectedFriend) return;
//     sendMessageMutation.mutate(messageInput);
//     setMessageInput('');
//   };

//   const formatTime = (date: string | Date) => {
//     return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const getLastMessage = (friendId: string) => {
//     const msgs = [...wsMessages, ...chatMessages].filter(
//       (m) =>
//         (m.fromUserId === friendId && m.toUserId === String(user.id)) ||
//         (m.fromUserId === String(user.id) && m.toUserId === friendId)
//     );
//     return msgs[msgs.length - 1];
//   };

//   const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

//   return (
//     <div className="w-full h-screen flex flex-col px-4 lg:px-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 max-w-7xl mx-auto w-full">
//         {/* Friend List */}
//         <div className="lg:col-span-1">
//           <Card className="h-full shadow-xl flex flex-col">
//             <CardContent className="p-0 flex flex-col h-full">
//               <div className="p-6 border-b flex-shrink-0">
//                 <h2 className="text-xl font-bold">Chats</h2>
//               </div>
//               <div className="flex-1 overflow-y-auto">
//                 {friends.map((friend: User) => {
//                   const lastMessage = getLastMessage(friend._id);
//                   const isOnline = userStatuses.get(friend._id) || false;
//                   return (
//                     <div
//                       key={friend._id}
//                       onClick={() => setSelectedFriend(friend)}
//                       className={`p-4 cursor-pointer border-b hover:bg-gray-50 dark:hover:bg-gray-700 ${
//                         selectedFriend?._id === friend._id ? 'bg-primary/10 border-l-4 border-primary' : ''
//                       }`}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <Avatar className="w-12 h-12">
//                           {friend.avatar && <AvatarImage src={friend.avatar} alt="avatar" />}
//                           <AvatarFallback>{getInitials(friend.firstName + ' ' + friend.lastName)}</AvatarFallback>
//                         </Avatar>
//                         <div className="flex-1 min-w-0">
//                           <div className="flex justify-between">
//                             <h3 className="text-sm font-semibold truncate">
//                               {friend.firstName} {friend.lastName}
//                             </h3>
//                             {lastMessage && <span className="text-xs">{formatTime(lastMessage.timestamp)}</span>}
//                           </div>
//                           <p className="text-sm truncate">
//                             {lastMessage?.content || 'No messages yet'}
//                           </p>
//                         </div>
//                         <div
//                           className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
//                         />
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Chat Window */}
//         <div className="lg:col-span-2 flex flex-col h-full">
//           <Card className="flex flex-col h-full">
//             {selectedFriend ? (
//               <>
//                 <div className="p-6 border-b flex justify-between items-center">
//                   <div className="flex items-center space-x-3">
//                     <Avatar className="w-10 h-10">
//                       {selectedFriend.avatar && <AvatarImage src={selectedFriend.avatar} alt="avatar" />}
//                       <AvatarFallback>{getInitials(selectedFriend.firstName + ' ' + selectedFriend.lastName)}</AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <h3 className="font-semibold">{selectedFriend.firstName} {selectedFriend.lastName}</h3>
//                       <Badge>{userStatuses.get(selectedFriend._id) ? 'Online' : 'Offline'}</Badge>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto p-6 space-y-4">
//                   {chatMessages.map((m) => (
//                     <div key={m._id} className={`flex ${m.fromUserId === String(user.id) ? 'justify-end' : 'items-start space-x-2'}`}>
//                       {m.fromUserId !== String(user.id) && (
//                         <Avatar className="w-8 h-8">
//                           {selectedFriend.avatar && <AvatarImage src={selectedFriend.avatar} alt="avatar" />}
//                           <AvatarFallback>{getInitials(selectedFriend.firstName + ' ' + selectedFriend.lastName)}</AvatarFallback>
//                         </Avatar>
//                       )}
//                       <div className={`flex flex-col ${m.fromUserId === String(user.id) ? 'items-end' : ''}`}>
//                         <div className={`px-4 py-2 rounded-2xl max-w-xs ${m.fromUserId === String(user.id) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
//                           <p>{m.content}</p>
//                         </div>
//                         <span className="text-xs text-gray-500">{formatTime(m.timestamp)}</span>
//                       </div>
//                     </div>
//                   ))}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 <div className="p-4 border-t flex items-center space-x-2">
//                   <Input
//                     placeholder="Type a message..."
//                     value={messageInput}
//                     onChange={(e) => setMessageInput(e.target.value)}
//                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
//                   />
//                   <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sendMessageMutation.isPending}>
//                     <Send size={16} />
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center">Select a chat</div>
//             )}
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSocket } from "@/hooks/useSocket";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  _id?: string;
  fromUserId: string;
  toUserId?: string;   // for personal
  groupId?: string;    // for group
  content: string;
  timestamp: string | Date;
}

interface Group {
  _id: string;
  name: string;
  avatar?: string;
}

export const ChatInterface = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedChat, setSelectedChat] = useState<{
    type: "friend" | "group" | null;
    data: User | Group | null;
  }>({ type: null, data: null });
  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { messages: wsMessages, userStatuses, sendMessage: sendWebSocketMessage } =
    useSocket(user?._id || "");

  // ✅ Friends
  const { data: friends = [] } = useQuery({
    queryKey: ["/api/friend-requests/accepted", user?._id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/friend-requests/accepted/${user?._id}`);
      return res.json();
    },
    enabled: !!user?._id,
  });

  // ✅ Groups
  const { data: groups = [] } = useQuery({
    queryKey: ["/api/groups/accepted", user?._id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/groups/accepted/${user?._id}`);
      return res.json();
    },
    enabled: !!user?._id,
  });

  // ✅ Fetch messages depending on chat type
  const { data: messagesData = [] } = useQuery({
    queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
    queryFn: async () => {
      if (!selectedChat.data) return [];
      if (selectedChat.type === "friend") {
        const friend = selectedChat.data as User;
        const res = await apiRequest("GET", `/api/messages/${friend._id}`);
        return res.json();
      } else {
        const group = selectedChat.data as Group;
        const res = await apiRequest("GET", `/api/messages/group/${group._id}`);
        return res.json();
      }
    },
    enabled: !!selectedChat.data && !!user?._id,
  });

  // Load DB messages
  useEffect(() => {
    if (messagesData) setChatMessages(messagesData);
  }, [messagesData]);

  // Handle new WS messages
  useEffect(() => {
    if (!selectedChat.data || !user?._id) return;

    const newMessages = wsMessages.filter((msg) => {
      if (selectedChat.type === "friend") {
        const friend = selectedChat.data as User;
        return (
          (String(msg.fromUserId) === String(friend._id) &&
            String(msg.toUserId) === String(user._id)) ||
          (String(msg.fromUserId) === String(user._id) &&
            String(msg.toUserId) === String(friend._id))
        );
      } else {
        const group = selectedChat.data as Group;
        return msg.groupId === group._id;
      }
    });

    if (newMessages.length > 0) {
      setChatMessages((prev) => [...prev, ...newMessages]);
    }
  }, [wsMessages, selectedChat, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // ✅ Send Message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?._id || !selectedChat.data) return null;

      if (selectedChat.type === "friend") {
        const friend = selectedChat.data as User;
        sendWebSocketMessage(friend._id, content);
        const res = await apiRequest("POST", "/api/messages", {
          fromUserId: user._id,
          toUserId: friend._id,
          content,
        });
        return res.json();
      } else {
        const group = selectedChat.data as Group;
        sendWebSocketMessage(group._id, content, true); // pass isGroup flag
        const res = await apiRequest("POST", "/api/messages/group", {
          fromUserId: user._id,
          groupId: group._id,
          content,
        });
        return res.json();
      }
    },
    onSuccess: (message) => {
      if (message) {
        setChatMessages((prev) => [...prev, message]);
        queryClient.invalidateQueries({
          queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
        });
      }
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat.data) return;
    sendMessageMutation.mutate(messageInput);
    setMessageInput("");
  };

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase();

  if (isLoading) return <div className="text-center p-8">Loading chat...</div>;
  if (!isAuthenticated || !user?._id)
    return <div className="text-center p-8">Please log in to use chat.</div>;

    return (
      <div className="w-full h-screen flex flex-col px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 max-w-7xl mx-auto w-full">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-xl flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold">Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  
                  {/* Personal Chats */}
                  <div className="sticky top-0 bg-white z-10 p-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Personal
                  </div>
                  {friends.map((friend: User) => (
                    <div
                      key={friend._id}
                      onClick={() => setSelectedChat({ type: "friend", data: friend })}
                      className={`flex items-center gap-3 p-4 cursor-pointer border-b transition ${
                        selectedChat.type === "friend" &&
                        (selectedChat.data as User)?._id === friend._id
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar className="w-10 h-10">
                        {friend.avatar && <AvatarImage src={friend.avatar} alt="avatar" />}
                        <AvatarFallback>{getInitials(friend.firstName + " " + friend.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium truncate">{friend.firstName} {friend.lastName}</p>
                        <span className="text-xs text-gray-500">
                          {userStatuses.get(friend._id) ? "Online" : "Offline"}
                        </span>
                      </div>
                      <span
                        className={`w-3 h-3 rounded-full ${
                          userStatuses.get(friend._id) ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                  ))}
    
                  {/* Group Chats */}
                  <div className="sticky top-0 bg-white z-10 p-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Groups
                  </div>
                  {groups.map((group: Group) => (
                    <div
                      key={group._id}
                      onClick={() => setSelectedChat({ type: "group", data: group })}
                      className={`flex items-center gap-3 p-4 cursor-pointer border-b transition ${
                        selectedChat.type === "group" &&
                        (selectedChat.data as Group)?._id === group._id
                          ? "bg-primary/10 border-l-4 border-primary"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar className="w-10 h-10">
                        {group.avatar && <AvatarImage src={group.avatar} alt="group avatar" />}
                        <AvatarFallback>{getInitials(group.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium truncate">{group.name}</p>
                        <span className="text-xs text-gray-500">Group</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
    
          {/* Chat Window */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <Card className="flex flex-col h-full">
              {selectedChat.data ? (
                <>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((m, idx) => (
                      <div
                        key={m._id || idx}
                        className={`flex ${
                          String(m.fromUserId) === String(user._id)
                            ? "justify-end"
                            : "items-start space-x-2"
                        }`}
                      >
                        {String(m.fromUserId) !== String(user._id) && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>?</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`flex flex-col ${
                            String(m.fromUserId) === String(user._id) ? "items-end" : ""
                          }`}
                        >
                          <div
                            className={`px-4 py-2 rounded-2xl max-w-xs ${
                              String(m.fromUserId) === String(user._id)
                                ? "bg-primary text-white"
                                : "bg-gray-100"
                            }`}
                          >
                            <p>{m.content}</p>
                          </div>
                          <span className="text-xs text-gray-500">{formatTime(m.timestamp)}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
    
                  {/* Input */}
                  <div className="p-4 border-t flex items-center space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!messageInput.trim()}>
                      <Send size={16} />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">Select a chat</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
};



