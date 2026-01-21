import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// User storage table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions for the Fraud Awareness Game
export const gameQuestions = pgTable("game_questions", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull(),
  type: text("type").notNull(),
  content: text("content").notNull(),
  sender: text("sender"),
  isScam: boolean("is_scam").notNull(),
  explanation: text("explanation").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
});

// High scores for the Fraud Awareness Game
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  playerName: text("player_name").notNull(),
  role: text("role").notNull(),
  score: integer("score").notNull(),
  scenariosCompleted: integer("scenarios_completed").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reports submitted to the Scam Radar
export const scamReports = pgTable("scam_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  scamType: text("scam_type").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  dateReported: timestamp("date_reported").defaultNow(),
  status: text("status").default("verified"),
});

// Deepfake detection history
export const detectionHistory = pgTable("detection_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  mediaType: text("media_type").notNull(),
  fileName: text("file_name").notNull(),
  isDeepfake: boolean("is_deepfake").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Safety Effects
export const safetyEffects = pgTable("safety_effects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  imageUrl: text("image_url"),
});

// Mental Effects
export const mentalEffects = pgTable("mental_effects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(),
  imageUrl: text("image_url"),
});

// Real Stories
export const realStories = pgTable("real_stories", {
  id: serial("id").primaryKey(),
  story: text("story").notNull(),
  author: text("author").notNull(),
  imageUrl: text("image_url"),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  gameScores: many(gameScores),
  scamReports: many(scamReports),
  detectionHistory: many(detectionHistory),
}));

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    messages: many(messages),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  user: one(users, {
    fields: [gameScores.userId],
    references: [users.id],
  }),
}));

export const scamReportsRelations = relations(scamReports, ({ one }) => ({
  user: one(users, {
    fields: [scamReports.userId],
    references: [users.id],
  }),
}));

export const detectionHistoryRelations = relations(
  detectionHistory,
  ({ one }) => ({
    user: one(users, {
      fields: [detectionHistory.userId],
      references: [users.id],
    }),
  }),
);

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertGameQuestionSchema = createInsertSchema(gameQuestions).omit({
  id: true,
});
export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
  createdAt: true,
});
export const insertScamReportSchema = createInsertSchema(scamReports).omit({
  id: true,
  dateReported: true,
  status: true,
});
export const insertDetectionHistorySchema = createInsertSchema(
  detectionHistory,
).omit({ id: true, createdAt: true });
export const insertSafetyEffectSchema = createInsertSchema(safetyEffects).omit({
  id: true,
});
export const insertMentalEffectSchema = createInsertSchema(mentalEffects).omit({
  id: true,
});
export const insertRealStorySchema = createInsertSchema(realStories).omit({
  id: true,
});

// Types (EXPORTS)
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type GameQuestion = typeof gameQuestions.$inferSelect;
export type InsertGameQuestion = z.infer<typeof insertGameQuestionSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type ScamReport = typeof scamReports.$inferSelect;
export type InsertScamReport = z.infer<typeof insertScamReportSchema>;
export type DetectionRecord = typeof detectionHistory.$inferSelect;
export type InsertDetectionRecord = z.infer<
  typeof insertDetectionHistorySchema
>;
export type SafetyEffect = typeof safetyEffects.$inferSelect;
export type InsertSafetyEffect = z.infer<typeof insertSafetyEffectSchema>;
export type MentalEffect = typeof mentalEffects.$inferSelect;
export type InsertMentalEffect = z.infer<typeof insertMentalEffectSchema>;
export type RealStory = typeof realStories.$inferSelect;
export type InsertRealStory = z.infer<typeof insertRealStorySchema>;
