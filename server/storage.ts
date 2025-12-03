import { users, questionAttempts, emailVerificationCodes, type User, type UpsertUser, type QuestionAttempt, type InsertQuestionAttempt } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, gt, lt } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(email: string, password: string): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPassword(userId: string, password: string): Promise<void>;
  verifyUserEmail(email: string): Promise<void>;
  getQuestionAttempts(userId: string): Promise<QuestionAttempt[]>;
  saveQuestionAttempt(attempt: InsertQuestionAttempt): Promise<QuestionAttempt>;
  createVerificationCode(email: string): Promise<string>;
  verifyCode(email: string, code: string): Promise<boolean>;
  deleteExpiredCodes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const [user] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        isEmailVerified: true,
      })
      .returning();
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

  async updateUserPassword(userId: string, password: string): Promise<void> {
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    await db.update(users).set({ password: hashedPassword, updatedAt: new Date() }).where(eq(users.id, userId));
  }

  async verifyUserEmail(email: string): Promise<void> {
    await db.update(users).set({ isEmailVerified: true, updatedAt: new Date() }).where(eq(users.email, email.toLowerCase()));
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

  async createVerificationCode(email: string): Promise<string> {
    await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.email, email.toLowerCase()));
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await db.insert(emailVerificationCodes).values({
      email: email.toLowerCase(),
      code,
      expiresAt,
    });
    
    return code;
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const [record] = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email.toLowerCase()),
          eq(emailVerificationCodes.code, code),
          gt(emailVerificationCodes.expiresAt, new Date())
        )
      );
    
    if (record) {
      await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.id, record.id));
      return true;
    }
    return false;
  }

  async deleteExpiredCodes(): Promise<void> {
    await db.delete(emailVerificationCodes).where(lt(emailVerificationCodes.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();
