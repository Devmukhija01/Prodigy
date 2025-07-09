import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertFriendRequestSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<number, WebSocketClient>();

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          ws.userId = message.userId;
          clients.set(message.userId, ws);
          await storage.updateUserOnlineStatus(message.userId, true);
          
          // Broadcast user online status
          broadcastUserStatus(message.userId, true);
        } else if (message.type === 'message') {
          const newMessage = await storage.createMessage({
            fromUserId: message.fromUserId,
            toUserId: message.toUserId,
            content: message.content,
          });
          
          // Send to recipient if online
          const recipientWs = clients.get(message.toUserId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'message',
              message: newMessage,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        storage.updateUserOnlineStatus(ws.userId, false);
        broadcastUserStatus(ws.userId, false);
      }
    });
  });

  function broadcastUserStatus(userId: number, isOnline: boolean) {
    const statusMessage = JSON.stringify({
      type: 'userStatus',
      userId,
      isOnline,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(statusMessage);
      }
    });
  }

  // Search user by ID
  app.get("/api/users/search/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.searchUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send friend request
  app.post("/api/friend-requests", async (req, res) => {
    try {
      const body = insertFriendRequestSchema.parse(req.body);
      
      // Check if users exist
      const fromUser = await storage.getUser(body.fromUserId);
      const toUser = await storage.getUser(body.toUserId);
      
      if (!fromUser || !toUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if they're already friends
      const areFriends = await storage.areFriends(body.fromUserId, body.toUserId);
      if (areFriends) {
        return res.status(400).json({ message: "Users are already friends" });
      }

      // Check if request already exists
      const existingRequest = await storage.getFriendRequestBetweenUsers(body.fromUserId, body.toUserId);
      if (existingRequest) {
        return res.status(400).json({ message: "Friend request already sent" });
      }

      const friendRequest = await storage.createFriendRequest(body);
      
      // Notify recipient via WebSocket
      const recipientWs = clients.get(body.toUserId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'friendRequest',
          request: { ...friendRequest, fromUser },
        }));
      }
      
      res.json(friendRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get pending friend requests
  app.get("/api/friend-requests/pending/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const pendingRequests = await storage.getPendingRequestsForUser(userId);
      res.json(pendingRequests);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Accept/reject friend request
  app.patch("/api/friend-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const friendRequest = await storage.getFriendRequestById(id);
      if (!friendRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }

      await storage.updateFriendRequestStatus(id, status);
      
      // If accepted, create friendship
      if (status === "accepted") {
        await storage.createFriendship(friendRequest.fromUserId, friendRequest.toUserId);
      }

      // Notify sender via WebSocket
      const senderWs = clients.get(friendRequest.fromUserId);
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        senderWs.send(JSON.stringify({
          type: 'friendRequestResponse',
          requestId: id,
          status,
        }));
      }
      
      res.json({ message: `Friend request ${status}` });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get friends for user
  app.get("/api/friends/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const friends = await storage.getFriendsForUser(userId);
      res.json(friends);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get messages between users
  app.get("/api/messages/:userId/:friendId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const friendId = parseInt(req.params.friendId);
      const messages = await storage.getMessagesBetweenUsers(userId, friendId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send message
  app.post("/api/messages", async (req, res) => {
    try {
      const body = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(body);
      
      // Send to recipient via WebSocket
      const recipientWs = clients.get(body.toUserId);
      if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
        recipientWs.send(JSON.stringify({
          type: 'message',
          message,
        }));
      }
      
      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
