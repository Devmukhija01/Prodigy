import { Request, Response } from "express";
import { Message } from "../models/Message";
import { AuthenticatedRequest } from "../Middleware/auth";

// Send a message
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { toUserId, content } = req.body;
  const fromUserId = req.user?.id;
  if (!fromUserId) return res.status(401).json({ message: "Unauthorized" });
  if (!toUserId || !content) return res.status(400).json({ message: "Missing toUserId or content" });
  try {
    const newMessage = new Message({
      fromUserId,
      toUserId,
      content,
      timestamp: new Date(),
    });
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get messages between two users
export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  const { friendId } = req.params;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  if (!friendId) return res.status(400).json({ message: "Missing friendId" });
  try {
    const messages = await Message.find({
      $or: [
        { fromUserId: userId, toUserId: friendId },
        { fromUserId: friendId, toUserId: userId }
      ]
    }).sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
}; 