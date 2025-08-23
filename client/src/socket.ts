// server/socket.ts
import { Server } from "socket.io";
import Message from "./models/Message"; // adjust to your schema
import FriendRequest from "./models/FriendRequest";
import Friendship from "./models/Friendship"; // make sure you have this
import { Types } from "mongoose";

interface ServerToClientEvents {
  message: (msg: any) => void;
  friendRequest: (req: any) => void;
  userStatus: (status: { userId: string; online: boolean }) => void;
}

interface ClientToServerEvents {
  message: (msg: {
    fromUserId: string;
    toUserId: string;
    content: string;
  }) => void;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function setupSocketServer(httpServer: any) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("userStatus", { userId, online: true });
    }

    socket.on("message", async ({ fromUserId, toUserId, content }) => {
      if (!fromUserId || !toUserId || !content) return;

      // ✅ Ensure they are friends before messaging
      const friendship = await Friendship.findOne({
        $or: [
          { user1: new Types.ObjectId(fromUserId), user2: new Types.ObjectId(toUserId) },
          { user1: new Types.ObjectId(toUserId), user2: new Types.ObjectId(fromUserId) },
        ],
      });

      if (!friendship) return;

      const msg = await Message.create({
        fromUserId,
        toUserId,
        content,
        timestamp: new Date(),
      });

      // Emit to sender
      io.to(socket.id).emit("message", msg);

      // Emit to recipient if online
      const recipientSocketId = onlineUsers.get(toUserId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("message", msg);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("userStatus", { userId, online: false });
      }
    });
  });

  return io;
}
