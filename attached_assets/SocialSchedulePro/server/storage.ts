import { 
  posts, 
  templates, 
  brandAssets, 
  schedules,
  tasks,
  users,
  type Post, 
  type InsertPost, 
  type Template, 
  type InsertTemplate, 
  type BrandAsset, 
  type InsertBrandAsset, 
  type Schedule, 
  type InsertSchedule,
  type Task,
  type InsertTask,
  type User,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Post methods
  getAllPosts(): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  getPostsByStatus(status: string): Promise<Post[]>;
  
  // Template methods
  getAllTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template | undefined>;
  deleteTemplate(id: number): Promise<boolean>;
  getActiveTemplates(): Promise<Template[]>;
  
  // Brand Asset methods
  getAllBrandAssets(): Promise<BrandAsset[]>;
  getBrandAsset(id: number): Promise<BrandAsset | undefined>;
  createBrandAsset(asset: InsertBrandAsset): Promise<BrandAsset>;
  updateBrandAsset(id: number, asset: Partial<InsertBrandAsset>): Promise<BrandAsset | undefined>;
  deleteBrandAsset(id: number): Promise<boolean>;
  getBrandAssetsByType(type: string): Promise<BrandAsset[]>;
  
  // Schedule methods
  getAllSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  getSchedulesByDate(date: Date): Promise<Schedule[]>;
  
  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByStatus(status: string): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private templates: Map<number, Template>;
  private brandAssets: Map<number, BrandAsset>;
  private schedules: Map<number, Schedule>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentPostId: number;
  private currentTemplateId: number;
  private currentBrandAssetId: number;
  private currentScheduleId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.templates = new Map();
    this.brandAssets = new Map();
    this.schedules = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentTemplateId = 1;
    this.currentBrandAssetId = 1;
    this.currentScheduleId = 1;
    this.currentTaskId = 1;
    
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize with some default templates
    const defaultTemplates: InsertTemplate[] = [
      {
        name: "Product Launch",
        description: "Brand template for product announcements",
        content: "🚀 Exciting news! We're launching {product_name}. {description} #ProductLaunch #Innovation",
        platforms: ["twitter", "facebook", "linkedin"],
        brandColors: ["#4F46E5", "#06B6D4"],
        brandFonts: ["Inter", "Roboto"],
        isActive: true
      },
      {
        name: "Quote Post",
        description: "Inspirational template for motivational content",
        content: "💡 \"{quote}\" - {author} #Motivation #Inspiration",
        platforms: ["twitter", "instagram", "linkedin"],
        brandColors: ["#F59E0B", "#EF4444"],
        brandFonts: ["Inter", "Playfair Display"],
        isActive: true
      },
      {
        name: "Statistics",
        description: "Data visualization template",
        content: "📊 {stat_title}: {stat_value} {context} #Data #Analytics",
        platforms: ["twitter", "linkedin"],
        brandColors: ["#10B981", "#06B6D4"],
        brandFonts: ["Inter", "Roboto"],
        isActive: true
      }
    ];

    defaultTemplates.forEach(template => {
      this.createTemplate(template);
    });

    // Initialize with default brand assets
    const defaultBrandAssets: InsertBrandAsset[] = [
      {
        name: "Primary Logo",
        type: "logo",
        value: "https://via.placeholder.com/200x80/4F46E5/ffffff?text=LOGO",
        isActive: true
      },
      {
        name: "Primary Color",
        type: "color",
        value: "#4F46E5",
        isActive: true
      },
      {
        name: "Secondary Color",
        type: "color",
        value: "#06B6D4",
        isActive: true
      },
      {
        name: "Primary Font",
        type: "font",
        value: "Inter",
        isActive: true
      }
    ];

    defaultBrandAssets.forEach(asset => {
      this.createBrandAsset(asset);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Post methods
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = { 
      ...insertPost, 
      id,
      scheduledDate: insertPost.scheduledDate ?? null,
      tags: insertPost.tags ?? null,
      mediaUrls: insertPost.mediaUrls ?? null,
      templateId: insertPost.templateId ?? null
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: number, updateData: Partial<InsertPost>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost: Post = { ...post, ...updateData };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }

  async getPostsByStatus(status: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.status === status);
  }

  // Template methods
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = { 
      ...insertTemplate, 
      id,
      description: insertTemplate.description ?? null,
      brandColors: insertTemplate.brandColors ?? null,
      brandFonts: insertTemplate.brandFonts ?? null,
      isActive: insertTemplate.isActive ?? null
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: number, updateData: Partial<InsertTemplate>): Promise<Template | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate: Template = { ...template, ...updateData };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  async getActiveTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.isActive);
  }

  // Brand Asset methods
  async getAllBrandAssets(): Promise<BrandAsset[]> {
    return Array.from(this.brandAssets.values());
  }

  async getBrandAsset(id: number): Promise<BrandAsset | undefined> {
    return this.brandAssets.get(id);
  }

  async createBrandAsset(insertAsset: InsertBrandAsset): Promise<BrandAsset> {
    const id = this.currentBrandAssetId++;
    const asset: BrandAsset = { 
      ...insertAsset, 
      id,
      isActive: insertAsset.isActive ?? null
    };
    this.brandAssets.set(id, asset);
    return asset;
  }

  async updateBrandAsset(id: number, updateData: Partial<InsertBrandAsset>): Promise<BrandAsset | undefined> {
    const asset = this.brandAssets.get(id);
    if (!asset) return undefined;
    
    const updatedAsset: BrandAsset = { ...asset, ...updateData };
    this.brandAssets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteBrandAsset(id: number): Promise<boolean> {
    return this.brandAssets.delete(id);
  }

  async getBrandAssetsByType(type: string): Promise<BrandAsset[]> {
    return Array.from(this.brandAssets.values()).filter(asset => asset.type === type);
  }

  // Schedule methods
  async getAllSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }

  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.currentScheduleId++;
    const schedule: Schedule = { ...insertSchedule, id };
    this.schedules.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: number, updateData: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule: Schedule = { ...schedule, ...updateData };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }

  async getSchedulesByDate(date: Date): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate);
      return scheduleDate.toDateString() === date.toDateString();
    });
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = { 
      ...insertTask,
      id,
      status: insertTask.status ?? "pending",
      priority: insertTask.priority ?? "medium",
      description: insertTask.description ?? null,
      dueDate: insertTask.dueDate ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      ...updateData,
      updatedAt: new Date()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }
}

export const storage = new MemStorage();
