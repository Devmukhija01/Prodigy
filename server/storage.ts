import { 
  users, 
  friendRequests, 
  friendships, 
  messages,
  posts,
  templates,
  brandAssets,
  schedules,
  tasks,
  type User, 
  type InsertUser, 
  type FriendRequest, 
  type InsertFriendRequest, 
  type Friendship,
  type Message,
  type InsertMessage,
  type Post,
  type InsertPost,
  type Template,
  type InsertTemplate,
  type BrandAsset,
  type InsertBrandAsset,
  type Schedule,
  type InsertSchedule,
  type Task,
  type InsertTask
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  searchUserById(userId: string): Promise<User | undefined>;

  // Friend request methods
  createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest>;
  getFriendRequestById(id: number): Promise<FriendRequest | undefined>;
  getPendingRequestsForUser(userId: number): Promise<(FriendRequest & { fromUser: User })[]>;
  updateFriendRequestStatus(id: number, status: string): Promise<void>;
  getFriendRequestBetweenUsers(fromUserId: number, toUserId: number): Promise<FriendRequest | undefined>;

  // Friendship methods
  createFriendship(user1Id: number, user2Id: number): Promise<Friendship>;
  getFriendsForUser(userId: number): Promise<User[]>;
  areFriends(user1Id: number, user2Id: number): Promise<boolean>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  getLastMessageBetweenUsers(user1Id: number, user2Id: number): Promise<Message | undefined>;
  markMessagesAsRead(fromUserId: number, toUserId: number): Promise<void>;

  // Social Media Post methods
  createPost(post: InsertPost): Promise<Post>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  updatePost(id: number, updates: Partial<Post>): Promise<void>;
  deletePost(id: number): Promise<void>;
  getPostsByStatus(status: string): Promise<Post[]>;

  // Template methods
  createTemplate(template: InsertTemplate): Promise<Template>;
  getTemplateById(id: number): Promise<Template | undefined>;
  getTemplatesByUserId(userId: number): Promise<Template[]>;
  updateTemplate(id: number, updates: Partial<Template>): Promise<void>;
  deleteTemplate(id: number): Promise<void>;

  // Brand Asset methods
  createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset>;
  getBrandAssetById(id: number): Promise<BrandAsset | undefined>;
  getBrandAssetsByUserId(userId: number): Promise<BrandAsset[]>;
  getBrandAssetsByType(userId: number, type: string): Promise<BrandAsset[]>;
  updateBrandAsset(id: number, updates: Partial<BrandAsset>): Promise<void>;
  deleteBrandAsset(id: number): Promise<void>;

  // Schedule methods
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  getScheduleById(id: number): Promise<Schedule | undefined>;
  getSchedulesByPostId(postId: number): Promise<Schedule[]>;
  updateSchedule(id: number, updates: Partial<Schedule>): Promise<void>;
  deleteSchedule(id: number): Promise<void>;

  // Task methods
  createTask(task: InsertTask): Promise<Task>;
  getTaskById(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  updateTask(id: number, updates: Partial<Task>): Promise<void>;
  deleteTask(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private friendRequests: Map<number, FriendRequest>;
  private friendships: Map<number, Friendship>;
  private messages: Map<number, Message>;
  private posts: Map<number, Post>;
  private templates: Map<number, Template>;
  private brandAssets: Map<number, BrandAsset>;
  private schedules: Map<number, Schedule>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentFriendRequestId: number;
  private currentFriendshipId: number;
  private currentMessageId: number;
  private currentPostId: number;
  private currentTemplateId: number;
  private currentBrandAssetId: number;
  private currentScheduleId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.friendRequests = new Map();
    this.friendships = new Map();
    this.messages = new Map();
    this.posts = new Map();
    this.templates = new Map();
    this.brandAssets = new Map();
    this.schedules = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentFriendRequestId = 1;
    this.currentFriendshipId = 1;
    this.currentMessageId = 1;
    this.currentPostId = 1;
    this.currentTemplateId = 1;
    this.currentBrandAssetId = 1;
    this.currentScheduleId = 1;
    this.currentTaskId = 1;

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleUsers = [
      { username: "john_doe_123", email: "john.doe@example.com", fullName: "John Doe", avatar: null },
      { username: "alice_smith", email: "alice.smith@example.com", fullName: "Alice Smith", avatar: null },
      { username: "mike_jones", email: "mike.jones@example.com", fullName: "Mike Jones", avatar: null },
      { username: "emma_wilson", email: "emma.wilson@example.com", fullName: "Emma Wilson", avatar: null },
    ];

    for (const userData of sampleUsers) {
      await this.createUser(userData);
    }

    // Initialize sample templates
    await this.createTemplate({
      userId: 1,
      name: "Social Media Announcement",
      description: "Template for important announcements",
      content: "🎉 Big news! {announcement}",
      platforms: ["twitter", "facebook", "instagram"],
      brandColors: ["#007bff", "#28a745"],
      brandFonts: ["Arial", "Helvetica"],
      isActive: true
    });

    // Initialize sample brand assets
    await this.createBrandAsset({
      userId: 1,
      name: "Primary Brand Color",
      type: "color",
      value: "#007bff",
      isActive: true
    });

    await this.createBrandAsset({
      userId: 1,
      name: "Company Logo",
      type: "logo",
      value: "/assets/logo.png",
      isActive: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      avatar: insertUser.avatar || null,
      isOnline: false,
      lastSeen: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      this.users.set(id, user);
    }
  }

  async searchUserById(userId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === userId);
  }

  async createFriendRequest(request: InsertFriendRequest): Promise<FriendRequest> {
    const id = this.currentFriendRequestId++;
    const friendRequest: FriendRequest = {
      ...request,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.friendRequests.set(id, friendRequest);
    return friendRequest;
  }

  async getFriendRequestById(id: number): Promise<FriendRequest | undefined> {
    return this.friendRequests.get(id);
  }

  async getPendingRequestsForUser(userId: number): Promise<(FriendRequest & { fromUser: User })[]> {
    const requests = Array.from(this.friendRequests.values()).filter(
      request => request.toUserId === userId && request.status === "pending"
    );

    const requestsWithUsers = [];
    for (const request of requests) {
      const fromUser = this.users.get(request.fromUserId);
      if (fromUser) {
        requestsWithUsers.push({ ...request, fromUser });
      }
    }

    return requestsWithUsers;
  }

  async updateFriendRequestStatus(id: number, status: string): Promise<void> {
    const request = this.friendRequests.get(id);
    if (request) {
      request.status = status;
      this.friendRequests.set(id, request);
    }
  }

  async getFriendRequestBetweenUsers(fromUserId: number, toUserId: number): Promise<FriendRequest | undefined> {
    return Array.from(this.friendRequests.values()).find(
      request => request.fromUserId === fromUserId && request.toUserId === toUserId
    );
  }

  async createFriendship(user1Id: number, user2Id: number): Promise<Friendship> {
    const id = this.currentFriendshipId++;
    const friendship: Friendship = {
      id,
      user1Id,
      user2Id,
      createdAt: new Date(),
    };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async getFriendsForUser(userId: number): Promise<User[]> {
    const friendships = Array.from(this.friendships.values()).filter(
      friendship => friendship.user1Id === userId || friendship.user2Id === userId
    );

    const friends = [];
    for (const friendship of friendships) {
      const friendId = friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id;
      const friend = this.users.get(friendId);
      if (friend) {
        friends.push(friend);
      }
    }

    return friends;
  }

  async areFriends(user1Id: number, user2Id: number): Promise<boolean> {
    return Array.from(this.friendships.values()).some(
      friendship => 
        (friendship.user1Id === user1Id && friendship.user2Id === user2Id) ||
        (friendship.user1Id === user2Id && friendship.user2Id === user1Id)
    );
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
      isRead: false,
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.fromUserId === user1Id && message.toUserId === user2Id) ||
        (message.fromUserId === user2Id && message.toUserId === user1Id)
      )
      .sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });
  }

  async getLastMessageBetweenUsers(user1Id: number, user2Id: number): Promise<Message | undefined> {
    const messages = await this.getMessagesBetweenUsers(user1Id, user2Id);
    return messages[messages.length - 1];
  }

  async markMessagesAsRead(fromUserId: number, toUserId: number): Promise<void> {
    for (const [id, message] of Array.from(this.messages.entries())) {
      if (message.fromUserId === fromUserId && message.toUserId === toUserId) {
        message.isRead = true;
        this.messages.set(id, message);
      }
    }
  }

  // Social Media Post methods
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      ...insertPost,
      id,
      scheduledDate: insertPost.scheduledDate || null,
      tags: insertPost.tags || null,
      mediaUrls: insertPost.mediaUrls || null,
      templateId: insertPost.templateId || null,
      createdAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.userId === userId);
  }

  async updatePost(id: number, updates: Partial<Post>): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      const updatedPost = { ...post, ...updates };
      this.posts.set(id, updatedPost);
    }
  }

  async deletePost(id: number): Promise<void> {
    this.posts.delete(id);
  }

  async getPostsByStatus(status: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.status === status);
  }

  // Template methods
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = {
      ...insertTemplate,
      id,
      description: insertTemplate.description || null,
      brandColors: insertTemplate.brandColors || null,
      brandFonts: insertTemplate.brandFonts || null,
      isActive: insertTemplate.isActive !== undefined ? insertTemplate.isActive : true,
      createdAt: new Date(),
    };
    this.templates.set(id, template);
    return template;
  }

  async getTemplateById(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getTemplatesByUserId(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.userId === userId);
  }

  async updateTemplate(id: number, updates: Partial<Template>): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      const updatedTemplate = { ...template, ...updates };
      this.templates.set(id, updatedTemplate);
    }
  }

  async deleteTemplate(id: number): Promise<void> {
    this.templates.delete(id);
  }

  // Brand Asset methods
  async createBrandAsset(insertAsset: InsertBrandAsset): Promise<BrandAsset> {
    const id = this.currentBrandAssetId++;
    const asset: BrandAsset = {
      ...insertAsset,
      id,
      isActive: insertAsset.isActive !== undefined ? insertAsset.isActive : true,
      createdAt: new Date(),
    };
    this.brandAssets.set(id, asset);
    return asset;
  }

  async getBrandAssetById(id: number): Promise<BrandAsset | undefined> {
    return this.brandAssets.get(id);
  }

  async getBrandAssetsByUserId(userId: number): Promise<BrandAsset[]> {
    return Array.from(this.brandAssets.values()).filter(asset => asset.userId === userId);
  }

  async getBrandAssetsByType(userId: number, type: string): Promise<BrandAsset[]> {
    return Array.from(this.brandAssets.values()).filter(asset => asset.userId === userId && asset.type === type);
  }

  async updateBrandAsset(id: number, updates: Partial<BrandAsset>): Promise<void> {
    const asset = this.brandAssets.get(id);
    if (asset) {
      const updatedAsset = { ...asset, ...updates };
      this.brandAssets.set(id, updatedAsset);
    }
  }

  async deleteBrandAsset(id: number): Promise<void> {
    this.brandAssets.delete(id);
  }

  // Schedule methods
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentScheduleId++;
    const schedule: Schedule = {
      ...insertSchedule,
      id,
      createdAt: new Date(),
    };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async getScheduleById(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async getSchedulesByPostId(postId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(schedule => schedule.postId === postId);
  }

  async updateSchedule(id: number, updates: Partial<Schedule>): Promise<void> {
    const schedule = this.schedules.get(id);
    if (schedule) {
      const updatedSchedule = { ...schedule, ...updates };
      this.schedules.set(id, updatedSchedule);
    }
  }

  async deleteSchedule(id: number): Promise<void> {
    this.schedules.delete(id);
  }

  // Task methods
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = {
      ...insertTask,
      id,
      status: insertTask.status || "pending",
      description: insertTask.description || null,
      priority: insertTask.priority || "medium",
      dueDate: insertTask.dueDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTaskById(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      const updatedTask = { ...task, ...updates, updatedAt: new Date() };
      this.tasks.set(id, updatedTask);
    }
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
