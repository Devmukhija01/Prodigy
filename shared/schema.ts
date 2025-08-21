import { z } from "zod";

// MongoDB-compatible schemas using Zod
export const insertUserSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(1),
  avatar: z.string().optional(),
});

export const insertFriendRequestSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
});


export const insertMessageSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  content: z.string().min(1),
});

export const insertPostSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  platforms: z.array(z.string()),
  status: z.enum(['draft', 'scheduled', 'published']),
  scheduledDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
  templateId: z.string().optional(),
});

export const insertTemplateSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.string().min(1),
  platforms: z.array(z.string()),
  brandColors: z.array(z.string()).optional(),
  brandFonts: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const insertBrandAssetSchema = z.object({
  userId: z.string(),
  name: z.string().min(1),
  type: z.enum(['logo', 'color', 'font']),
  value: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const insertScheduleSchema = z.object({
  postId: z.string(),
  platform: z.string().min(1),
  scheduledDate: z.date(),
  status: z.enum(['pending', 'published', 'failed']),
});

export const insertTaskSchema = z.object({
  userId: z.string(),
  groupId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed', 'in_progress']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.union([z.date(), z.string()]).optional().transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export const insertGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ownerId: z.string(),
  isPrivate: z.boolean().default(false),
  members: z.array(z.string()).optional(),
});

export const insertGroupMemberSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(['owner', 'admin', 'member']).default('member'),
});

export const insertJoinRequestSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  registerId: string;
  phone?: string;
  bio?: string;
  socialAccounts?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  friends?: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type FriendRequest = {
  _id: string;
  fromUser: string;
  toUser: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
};

export type Friendship = {
  _id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
};

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = {
  _id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
};

export type Post = {
  _id: string;
  userId: string;
  title: string;
  content: string;
  platforms: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledDate?: Date;
  tags?: string[];
  mediaUrls?: string[];
  templateId?: string;
  createdAt: Date;
};

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Template = {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  content: string;
  platforms: string[];
  brandColors?: string[];
  brandFonts?: string[];
  isActive: boolean;
  createdAt: Date;
};

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type BrandAsset = {
  _id: string;
  userId: string;
  name: string;
  type: 'logo' | 'color' | 'font';
  value: string;
  isActive: boolean;
  createdAt: Date;
};

export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;
export type Schedule = {
  _id: string;
  postId: string;
  platform: string;
  scheduledDate: Date;
  status: 'pending' | 'published' | 'failed';
  createdAt: Date;
};

export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Task = {
  _id: string;
  userId: string;
  groupId?: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Group = {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: string[];
  isPrivate: boolean;
  createdAt: Date;
};

export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMember = {
  _id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
};

export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type JoinRequest = {
  _id: string;
  groupId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
};

export type InsertJoinRequest = z.infer<typeof insertJoinRequestSchema>;
