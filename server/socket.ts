import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

const connectedUsers = new Map<string, string>();

export function setupSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
    path: "/socket.io",
    transports: ["websocket", "polling"], // force both
  });

  console.log("🚀 Socket.IO server initialized");

  io.on("connection", (socket) => {
    console.log("✅ New socket connected:", socket.id);
    console.log("🔎 Handshake query:", socket.handshake.query);

    const userId = socket.handshake.query.userId as string | undefined;
    if (!userId) {
      console.log("❌ Missing userId in query, disconnecting...");
      socket.disconnect();
      return;
    }

    connectedUsers.set(socket.id, userId);
    console.log(`📌 User ${userId} registered with socket ${socket.id}`);

    socket.on("message", (msg) => {
      console.log("📩 message event received:", msg);
      io.emit("message", { ...msg, _id: Date.now().toString(), timestamp: new Date() });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket ${socket.id} (user ${userId}) disconnected`);
      connectedUsers.delete(socket.id);
    });
  });

  return io;
}
