import { useEffect, useRef, useState } from 'react';
import { Message, FriendRequest, User } from '@shared/schema';

interface WebSocketMessage {
  type: 'message' | 'friendRequest' | 'friendRequestResponse' | 'userStatus';
  message?: Message;
  request?: FriendRequest & { fromUser: User };
  requestId?: number;
  status?: string;
  userId?: number;
  isOnline?: boolean;
}

export const useWebSocket = (userId: number | null) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<(FriendRequest & { fromUser: User })[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<number, boolean>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
        setSocket(ws);
        
        // Authenticate with user ID
        ws.send(JSON.stringify({
          type: 'auth',
          userId: userId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          switch (data.type) {
            case 'message':
              if (data.message) {
                setMessages(prev => [...prev, data.message!]);
              }
              break;
            case 'friendRequest':
              if (data.request) {
                setFriendRequests(prev => [...prev, data.request!]);
              }
              break;
            case 'friendRequestResponse':
              // Handle friend request response
              console.log('Friend request response:', data);
              break;
            case 'userStatus':
              if (data.userId && data.isOnline !== undefined) {
                setUserStatuses(prev => new Map(prev.set(data.userId!, data.isOnline!)));
              }
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [userId]);

  const sendMessage = (toUserId: number, content: string) => {
    if (socket && socket.readyState === WebSocket.OPEN && userId) {
      socket.send(JSON.stringify({
        type: 'message',
        fromUserId: userId,
        toUserId,
        content,
      }));
    }
  };

  return {
    socket,
    isConnected,
    messages,
    friendRequests,
    userStatuses,
    sendMessage,
    setMessages,
    setFriendRequests,
  };
};
