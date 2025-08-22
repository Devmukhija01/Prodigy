import { useEffect, useState, useRef } from "react";
import { sendFriendRequest } from "server/controllers/friendRequestController";
import { io, Socket } from "socket.io-client";

interface Message {
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: string;
}

export function useSocket(userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, boolean>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://https://prodigy-59mg.onrender.com", {
      withCredentials: true,
      path: "/socket.io",
      query: { userId },
      transports: ["websocket", "polling"], // force same transports
    });
    
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message, err);
    });
    

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket.io server");
    });

    socket.on("message", (message: Message) => {
      console.log("📩 New message:", message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on("friendRequest", (request) => {
      console.log("👥 Friend request:", request);
      setFriendRequests((prev) => [...prev, request]);
    });

    // ✅ Track online/offline status
    socket.on("userStatus", ({ userId, online }) => {
      setUserStatuses((prev) => {
        const newStatuses = new Map(prev);
        newStatuses.set(userId, online);
        return newStatuses;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const sendMessage = (toUserId: string, content: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("message", { fromUserId: userId, toUserId, content });
  };

  return {
    messages,
    friendRequests,
    setFriendRequests,
    userStatuses, // ✅ return user statuses
    sendMessage,
  };
}
