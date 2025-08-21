import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', messageSchema); 