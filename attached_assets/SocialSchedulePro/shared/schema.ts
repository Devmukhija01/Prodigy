import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  platforms: text("platforms").array().notNull(),
  status: text("status").notNull(), // 'draft', 'scheduled', 'published'
  scheduledDate: timestamp("scheduled_date"),
  tags: text("tags").array(),
  mediaUrls: text("media_urls").array(),
  templateId: integer("template_id"),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  platforms: text("platforms").array().notNull(),
  brandColors: text("brand_colors").array(),
  brandFonts: text("brand_fonts").array(),
  isActive: boolean("is_active").default(true),
});

export const brandAssets = pgTable("brand_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'logo', 'color', 'font'
  value: text("value").notNull(), // URL for assets, hex for colors, font name for fonts
  isActive: boolean("is_active").default(true),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  platform: text("platform").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull(), // 'pending', 'published', 'failed'
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // 'pending', 'completed'
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high'
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const insertBrandAssetSchema = createInsertSchema(brandAssets).omit({
  id: true,
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type BrandAsset = typeof brandAssets.$inferSelect;
export type InsertBrandAsset = z.infer<typeof insertBrandAssetSchema>;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
