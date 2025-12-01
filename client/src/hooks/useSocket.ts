// // client/src/hooks/useWebSocket.ts
// import { useEffect, useState, useRef } from "react";
// import { io, Socket } from "socket.io-client";

// interface Message {
//   groupId: string;
//   fromUserId: string;
//   toUserId: string;
//   content: string;
//   timestamp: string;
// }

// export function useSocket(userId: string) {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [friendRequests, setFriendRequests] = useState<any[]>([]);
//   const [userStatuses, setUserStatuses] = useState<Map<string, boolean>>(new Map());
//   const socketRef = useRef<Socket | null>(null);
  
  
//   useEffect(() => {
//     if (!userId) return;

//     const socket = io("http://localhost:5055", {
//       withCredentials: true,
//       path: "/socket.io",
//       query: { userId },
//       transports: ["websocket"],
//     });

//     socketRef.current = socket;

//     socket.on("connect", () => {
//       console.log("✅ Connected to socket.io server");
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected from socket.io server");
//     });

//     socket.on("message", (message: Message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     socket.on("friendRequest", (request) => {
//       setFriendRequests((prev) => [...prev, request]);
//     });

//     socket.on("userStatus", ({ userId, online }) => {
//       setUserStatuses((prev) => {
//         const newStatuses = new Map(prev);
//         newStatuses.set(userId, online);
//         return newStatuses;
//       });
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [userId]);

//   const sendMessage = (toUserId: string, content: string, p0: boolean) => {
//     if (!socketRef.current) return;
//     socketRef.current.emit("message", { fromUserId: userId, toUserId, content });
//   };

//   return {
//     messages,
//     friendRequests,
//     setFriendRequests,
//     userStatuses,
//     sendMessage,
//   };
// }
// client/src/hooks/useSocket.ts
import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface WsMessage {
  _id?: string;
  groupId?: string;
  fromUserId?: string;
  toUserId?: string;
  content?: string;
  timestamp?: string;
  event?: string;
  friend?: any;
}

export function useSocket(userId: string) {
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [userStatuses, setUserStatuses] = useState<Map<string, boolean>>(new Map());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:5055", {
      withCredentials: true,
      path: "/socket.io",
      query: { userId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to socket.io server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket.io server");
    });

    socket.on("message", (message: WsMessage) => {
      if (!message) return;
      setMessages((prev) => [...prev, message]);
    });

    socket.on("friendRequest", (request) => {
      if (!request) return;
      setFriendRequests((prev) => [...prev, request]);
    });

    socket.on("userStatus", ({ userId: uId, online }) => {
      setUserStatuses((prev) => {
        const newStatuses = new Map(prev);
        newStatuses.set(uId, !!online);
        return newStatuses;
      });
    });

    // optional - handle "friendAccepted" event if server emits it
    socket.on("friendAccepted", (payload) => {
      if (!payload) return;
      setMessages((prev) => [...prev, { event: "friend-accepted", friend: payload }]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const sendMessage = (toId: string, content: string, isGroup?: boolean) => {
    if (!socketRef.current) return;
    // emit message with group flag if needed
    socketRef.current.emit("message", { fromUserId: userId, toUserId: isGroup ? undefined : toId, groupId: isGroup ? toId : undefined, content });
  };

  return {
    messages,
    friendRequests,
    setFriendRequests,
    userStatuses,
    sendMessage,
  };
}
