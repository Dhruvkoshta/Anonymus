import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Base tables (no prefix) – matches existing migration 0000_spooky_thundra.sql
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).unique(),
  email: varchar("email", { length: 256 }).unique(),
  password: text("password"),
  verified: boolean("verified").default(false),
  verifyCode: text("verifyCode"),
  verifyCodeExpiry: timestamp("verifyCodeExpiry"),
  isAcceptingMessages: boolean("isAcceptingMessages").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content"),
  createdAt: timestamp("createdAt").defaultNow(),
  userId: integer("userId").references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));
