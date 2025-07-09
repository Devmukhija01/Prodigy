import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Message, User } from '@shared/schema';

const CURRENT_USER_ID = 1; // This would come from authentication context

export const ChatInterface = () => {
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  const { messages, userStatuses, sendMessage: sendWebSocketMessage } = useWebSocket(CURRENT_USER_ID);

  const { data: friends = [] } = useQuery({
    queryKey: ['/api/friends', CURRENT_USER_ID],
  });

  const { data: messagesData = [] } = useQuery({
    queryKey: ['/api/messages', CURRENT_USER_ID, selectedFriend?.id],
    enabled: !!selectedFriend,
  });

  useEffect(() => {
    if (messagesData) {
      setChatMessages(messagesData);
    }
  }, [messagesData]);

  useEffect(() => {
    // Add new WebSocket messages to chat
    const newMessages = messages.filter(
      msg => 
        selectedFriend && 
        ((msg.fromUserId === selectedFriend.id && msg.toUserId === CURRENT_USER_ID) ||
         (msg.fromUserId === CURRENT_USER_ID && msg.toUserId === selectedFriend.id))
    );
    
    if (newMessages.length > 0) {
      setChatMessages(prev => [...prev, ...newMessages]);
    }
  }, [messages, selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', {
        fromUserId: CURRENT_USER_ID,
        toUserId: selectedFriend!.id,
        content,
      });
      return response.json();
    },
    onSuccess: (message) => {
      setChatMessages(prev => [...prev, message]);
      sendWebSocketMessage(selectedFriend!.id, message.content);
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedFriend) return;
    
    sendMessageMutation.mutate(messageInput);
    setMessageInput('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUserOnline = (userId: number) => {
    return userStatuses.get(userId) || false;
  };

  const getLastMessage = (friendId: number) => {
    const friendMessages = messages.filter(
      msg => 
        (msg.fromUserId === friendId && msg.toUserId === CURRENT_USER_ID) ||
        (msg.fromUserId === CURRENT_USER_ID && msg.toUserId === friendId)
    );
    return friendMessages[friendMessages.length - 1];
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="h-full glass-effect shadow-xl">
            <CardContent className="p-0">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
                {friends.map((friend: User) => {
                  const lastMessage = getLastMessage(friend.id);
                  const isOnline = isUserOnline(friend.id);
                  
                  return (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                        selectedFriend?.id === friend.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500">
                            <AvatarFallback className="text-white font-bold">
                              {getInitials(friend.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {friend.fullName}
                            </h3>
                            {lastMessage && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          <Card className="h-full glass-effect shadow-xl flex flex-col">
            {selectedFriend ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500">
                      <AvatarFallback className="text-white font-bold">
                        {getInitials(selectedFriend.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedFriend.fullName}
                      </h3>
                      <Badge variant={isUserOnline(selectedFriend.id) ? 'default' : 'secondary'}>
                        {isUserOnline(selectedFriend.id) ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical size={16} />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.fromUserId === CURRENT_USER_ID ? 'justify-end' : 'items-start space-x-2'
                      }`}
                    >
                      {message.fromUserId !== CURRENT_USER_ID && (
                        <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500">
                          <AvatarFallback className="text-white text-sm font-bold">
                            {getInitials(selectedFriend.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex flex-col ${message.fromUserId === CURRENT_USER_ID ? 'items-end' : ''}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl max-w-xs ${
                            message.fromUserId === CURRENT_USER_ID
                              ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-md'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 mx-2">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Paperclip size={16} />
                    </Button>
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="rounded-full pr-12"
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Smile size={16} />
                      </Button>
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-primary to-secondary p-3 rounded-full hover:shadow-lg"
                    >
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a chat to start messaging
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a friend from the list to begin your conversation
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
