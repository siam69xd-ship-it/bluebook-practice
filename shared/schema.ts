import { pgTable, text, timestamp, boolean, uuid, integer } from "drizzle-orm/pg-core";

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
