import { 
  users, 
  friendRequests, 
  friendships, 
  messages,
  type User, 
  type InsertUser, 
  type FriendRequest, 
  type InsertFriendRequest, 
  type Friendship,
  type Message,
  type InsertMessage
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private friendRequests: Map<number, FriendRequest>;
  private friendships: Map<number, Friendship>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentFriendRequestId: number;
  private currentFriendshipId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.friendRequests = new Map();
    this.friendships = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentFriendRequestId = 1;
    this.currentFriendshipId = 1;
    this.currentMessageId = 1;

    // Initialize with some sample users
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
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async getLastMessageBetweenUsers(user1Id: number, user2Id: number): Promise<Message | undefined> {
    const messages = await this.getMessagesBetweenUsers(user1Id, user2Id);
    return messages[messages.length - 1];
  }

  async markMessagesAsRead(fromUserId: number, toUserId: number): Promise<void> {
    for (const [id, message] of this.messages.entries()) {
      if (message.fromUserId === fromUserId && message.toUserId === toUserId) {
        message.isRead = true;
        this.messages.set(id, message);
      }
    }
  }
}

export const storage = new MemStorage();
