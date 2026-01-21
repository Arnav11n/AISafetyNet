import {
  users,
  gameScores,
  scamReports,
  detectionHistory,
  gameQuestions,
  safetyEffects,
  mentalEffects,
  realStories,
  type User,
  type GameScore,
  type InsertGameScore,
  type ScamReport,
  type InsertScamReport,
  type DetectionRecord,
  type InsertDetectionRecord,
  type GameQuestion,
  type InsertGameQuestion,
  type SafetyEffect,
  type InsertSafetyEffect,
  type MentalEffect,
  type InsertMentalEffect,
  type RealStory,
  type InsertRealStory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  getQuestionsByTheme(theme: string): Promise<GameQuestion[]>;
  createQuestion(question: InsertGameQuestion): Promise<GameQuestion>;
  getLeaderboard(limit?: number): Promise<GameScore[]>;
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  createScamReport(report: InsertScamReport): Promise<ScamReport>;
  getRecentScamReports(limit?: number): Promise<ScamReport[]>;
  getScamTypeStats(): Promise<{ type: string; count: number }[]>;
  createDetectionRecord(
    record: InsertDetectionRecord,
  ): Promise<DetectionRecord>;
  getUserDetectionHistory(userId: number): Promise<DetectionRecord[]>;
  getSafetyEffects(): Promise<SafetyEffect[]>;
  createSafetyEffect(effect: InsertSafetyEffect): Promise<SafetyEffect>;
  getMentalEffects(): Promise<MentalEffect[]>;
  createMentalEffect(effect: InsertMentalEffect): Promise<MentalEffect>;
  getRealStories(): Promise<RealStory[]>;
  createRealStory(story: InsertRealStory): Promise<RealStory>;
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: any): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getQuestionsByTheme(theme: string): Promise<GameQuestion[]> {
    return await db
      .select()
      .from(gameQuestions)
      .where(eq(gameQuestions.theme, theme));
  }

  async createQuestion(question: InsertGameQuestion): Promise<GameQuestion> {
    const [newQuestion] = await db
      .insert(gameQuestions)
      .values(question)
      .returning();
    return newQuestion;
  }

  async getLeaderboard(limit = 10): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .orderBy(desc(gameScores.score))
      .limit(limit);
  }

  async createGameScore(score: InsertGameScore): Promise<GameScore> {
    const [newScore] = await db.insert(gameScores).values(score).returning();
    return newScore;
  }

  async createScamReport(report: InsertScamReport): Promise<ScamReport> {
    const [newReport] = await db.insert(scamReports).values(report).returning();
    return newReport;
  }

  async getRecentScamReports(limit = 50): Promise<ScamReport[]> {
    return await db
      .select()
      .from(scamReports)
      .orderBy(desc(scamReports.dateReported))
      .limit(limit);
  }

  async getScamTypeStats(): Promise<{ type: string; count: number }[]> {
    return await db
      .select({
        type: scamReports.scamType,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(scamReports)
      .groupBy(scamReports.scamType);
  }

  async createDetectionRecord(
    record: InsertDetectionRecord,
  ): Promise<DetectionRecord> {
    const [newRecord] = await db
      .insert(detectionHistory)
      .values(record)
      .returning();
    return newRecord;
  }

  async getUserDetectionHistory(userId: number): Promise<DetectionRecord[]> {
    return await db
      .select()
      .from(detectionHistory)
      .where(eq(detectionHistory.userId, userId))
      .orderBy(desc(detectionHistory.createdAt));
  }

  async getSafetyEffects(): Promise<SafetyEffect[]> {
    return await db.select().from(safetyEffects);
  }

  async createSafetyEffect(effect: InsertSafetyEffect): Promise<SafetyEffect> {
    const [newEffect] = await db
      .insert(safetyEffects)
      .values(effect)
      .returning();
    return newEffect;
  }

  async getMentalEffects(): Promise<MentalEffect[]> {
    return await db.select().from(mentalEffects);
  }

  async createMentalEffect(effect: InsertMentalEffect): Promise<MentalEffect> {
    const [newEffect] = await db
      .insert(mentalEffects)
      .values(effect)
      .returning();
    return newEffect;
  }

  async getRealStories(): Promise<RealStory[]> {
    return await db.select().from(realStories);
  }

  async createRealStory(story: InsertRealStory): Promise<RealStory> {
    const [newStory] = await db.insert(realStories).values(story).returning();
    return newStory;
  }
}

export const storage = new DatabaseStorage();
