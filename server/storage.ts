import { users, questionAttempts, type User, type UpsertUser, type QuestionAttempt, type InsertQuestionAttempt } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getQuestionAttempts(userId: string): Promise<QuestionAttempt[]>;
  saveQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getQuestionAttempts(userId: string): Promise<QuestionAttempt[]> {
    return await db
      .select()
      .from(questionAttempts)
      .where(eq(questionAttempts.userId, userId))
      .orderBy(desc(questionAttempts.createdAt));
  }

  async saveQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt> {
    const [saved] = await db
      .insert(questionAttempts)
      .values(attempt)
      .returning();
    return saved;
  }

  async getAttemptCounts(userId: string): Promise<Record<string, number>> {
    const attempts = await db
      .select()
      .from(questionAttempts)
      .where(eq(questionAttempts.userId, userId));
    
    const counts: Record<string, number> = {};
    for (const attempt of attempts) {
      counts[attempt.questionId] = (counts[attempt.questionId] || 0) + 1;
    }
    return counts;
  }
}

export const storage = new DatabaseStorage();
