import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const adUsers = pgTable("ad_users", {
  id: serial("id").primaryKey(),
  samAccountName: text("sam_account_name").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adGroups = pgTable("ad_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adDevices = pgTable("ad_devices", {
  id: serial("id").primaryKey(),
  hostname: text("hostname").notNull().unique(),
  description: text("description"),
  ou: text("ou").notNull(),
  lastSeen: timestamp("last_seen"),
});

export const adUserGroups = pgTable("ad_user_groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertADUserSchema = createInsertSchema(adUsers).pick({
  samAccountName: true,
  displayName: true,
  email: true,
  department: true,
  enabled: true,
});

export const insertADGroupSchema = createInsertSchema(adGroups).pick({
  name: true,
  description: true,
});

export const insertADDeviceSchema = createInsertSchema(adDevices).pick({
  hostname: true,
  description: true,
  ou: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ADUser = typeof adUsers.$inferSelect;
export type ADGroup = typeof adGroups.$inferSelect;
export type ADDevice = typeof adDevices.$inferSelect;
export type ADUserGroup = typeof adUserGroups.$inferSelect;
