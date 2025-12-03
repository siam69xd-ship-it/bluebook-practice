import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, uuid, integer, varchar, jsonb, index } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailVerificationCodes = pgTable("email_verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const questionAttempts = pgTable("question_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  questionId: text("question_id").notNull(),
  selectedAnswer: text("selected_answer"),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type QuestionAttempt = typeof questionAttempts.$inferSelect;
export type InsertQuestionAttempt = typeof questionAttempts.$inferInsert;

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donors = pgTable("donors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  bloodGroup: text("blood_group").notNull(),
  division: text("division").notNull(),
  district: text("district").notNull(),
  upazila: text("upazila").notNull(),
  area: text("area"),
  lastDonationDate: timestamp("last_donation_date"),
  availableNow: boolean("available_now").default(true),
  willingForCalls: boolean("willing_for_calls").default(true),
  isVerified: boolean("is_verified").default(false),
  status: text("status").default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locations = pgTable("locations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  division: text("division").notNull(),
  district: text("district").notNull(),
  upazila: text("upazila").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  donorId: uuid("donor_id").references(() => donors.id),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  mobileNumber: text("mobile_number").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
