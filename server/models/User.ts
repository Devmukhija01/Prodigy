import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  registerId: { type: String, unique: true },
  avatar: String, // URL to the uploaded avatar image
  phone: String,
  bio: String,
  socialAccounts: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

const friendRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Group = mongoose.model('Group', groupSchema);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  status: { type: String, enum: ['pending', 'completed', 'in_progress'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Task = mongoose.model('Task', taskSchema);

const joinRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now }
});

export const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);