import express, { type Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";

import authRoutes from "./routes";
import userRoutes from "./routes/user"; 
import friendRequestsRoutes from "./routes/friendRequests";
import messagesRoutes from "./routes/messages";
import weatherRoutes from "./routes/weather";
import tasksRoutes from "./routes/tasks";
import groupsRoutes from "./routes/groups";
import joinRequestsRoutes from "./routes/join-requests";

// ✅ import the new Socket.IO setup function
import { setupSocketServer } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ Setup Socket.IO server (this replaces the old ws)
const io = setupSocketServer(httpServer);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true, // allow cookies
  })
);

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);

// Proxy /api/me to /api/user/me
app.get("/api/me", (req, res, next) => {
  req.url = "/me";
  userRoutes(req, res, next);
});

app.use("/api/friend-requests", friendRequestsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/join-requests", joinRequestsRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL as string,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 5055;
    httpServer.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
