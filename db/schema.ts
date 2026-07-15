import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contentBlocks = sqliteTable("content_blocks", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workspaceItems = sqliteTable("workspace_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  itemDate: text("item_date").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  scope: text("scope").notNull(),
  title: text("title").notNull().default(""),
  caption: text("caption").notNull().default(""),
  url: text("url").notNull(),
  objectKey: text("object_key").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const loveEvents = sqliteTable("love_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  eventDate: text("event_date").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const loveWishes = sqliteTable("love_wishes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const quarterGoals = sqliteTable("quarter_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quarter: text("quarter").notNull(),
  title: text("title").notNull(),
  note: text("note").notNull().default(""),
  progress: integer("progress").notNull().default(0),
  status: text("status").notNull().default("进行中"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const travelPlans = sqliteTable("travel_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  destination: text("destination").notNull(),
  timeRange: text("time_range").notNull().default(""),
  note: text("note").notNull().default(""),
  status: text("status").notNull().default("计划中"),
  imageUrl: text("image_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
