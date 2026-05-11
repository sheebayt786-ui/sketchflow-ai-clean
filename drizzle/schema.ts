import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  longtext,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with subscription and credit tracking.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Subscription and credits
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "creator", "growth"])
    .default("free")
    .notNull(),
  creditsBalance: int("creditsBalance").default(0).notNull(),
  creditsUsedThisMonth: int("creditsUsedThisMonth").default(0).notNull(),
  
  // Subscription metadata
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "cancelled", "expired"])
    .default("active"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Video projects created by users.
 * Stores metadata about each video creation.
 */
export const videoProjects = mysqlTable("videoProjects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  
  // Whiteboard style: sketch, canvas, chalkboard
  whiteboardStyle: mysqlEnum("whiteboardStyle", ["sketch", "canvas", "chalkboard"])
    .default("sketch")
    .notNull(),
  
  // Voice settings
  voiceStyle: mysqlEnum("voiceStyle", ["male", "female"]).default("male").notNull(),
  
  // Status
  status: mysqlEnum("status", ["draft", "generating", "ready", "exported", "failed"])
    .default("draft")
    .notNull(),
  
  // Storage references
  videoUrl: varchar("videoUrl", { length: 512 }),
  videoStorageKey: varchar("videoStorageKey", { length: 512 }),
  
  // Metadata
  duration: int("duration"), // in seconds
  creditsUsed: int("creditsUsed").default(0),
  includeWatermark: boolean("includeWatermark").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoProject = typeof videoProjects.$inferSelect;
export type InsertVideoProject = typeof videoProjects.$inferInsert;

/**
 * Scenes within a video project.
 * Each scene has narration, illustration keywords, and animation settings.
 */
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  
  // Scene content
  sceneNumber: int("sceneNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  narrationText: longtext("narrationText").notNull(),
  illustrationKeywords: json("illustrationKeywords").$type<string[]>().default([]),
  
  // Animation settings
  duration: int("duration").default(5), // in seconds
  animationStyle: mysqlEnum("animationStyle", ["stroke-reveal", "fade-in", "slide-in"])
    .default("stroke-reveal"),
  
  // SVG and illustration
  svgUrl: varchar("svgUrl", { length: 512 }),
  svgStorageKey: varchar("svgStorageKey", { length: 512 }),
  
  // Narration audio
  narrationAudioUrl: varchar("narrationAudioUrl", { length: 512 }),
  narrationAudioStorageKey: varchar("narrationAudioStorageKey", { length: 512 }),
  narrationDuration: int("narrationDuration"), // in milliseconds
  
  // Status
  status: mysqlEnum("status", ["draft", "generating", "ready", "failed"])
    .default("draft"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

/**
 * Subscription plans with tier definitions.
 * Defines credits, features, and limits per tier.
 */
export const subscriptionPlans = mysqlTable("subscriptionPlans", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["free", "starter", "creator", "growth"])
    .unique()
    .notNull(),
  
  // Pricing
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0"),
  yearlyPrice: decimal("yearlyPrice", { precision: 10, scale: 2 }).default("0"),
  
  // Limits and features
  videosPerMonth: int("videosPerMonth").default(0),
  creditsPerMonth: int("creditsPerMonth").default(0),
  allowWatermarkRemoval: boolean("allowWatermarkRemoval").default(false),
  allowAllStyles: boolean("allowAllStyles").default(false),
  maxVideoLength: int("maxVideoLength").default(300), // in seconds
  
  // Features
  features: json("features").$type<string[]>().default([]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * Credit transactions for audit trail.
 * Tracks all credit usage and additions.
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  
  // Transaction details
  amount: int("amount").notNull(), // positive for addition, negative for usage
  type: mysqlEnum("type", ["purchase", "usage", "refund", "monthly_grant"])
    .notNull(),
  description: text("description"),
  
  balanceBefore: int("balanceBefore").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Uploaded documents for script generation.
 * Stores references to user-uploaded PDFs, DOCX, TXT files.
 */
export const uploadedDocuments = mysqlTable("uploadedDocuments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  
  // File metadata
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  
  // Storage reference
  storageUrl: varchar("storageUrl", { length: 512 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  
  // Extracted content
  extractedText: longtext("extractedText"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UploadedDocument = typeof uploadedDocuments.$inferSelect;
export type InsertUploadedDocument = typeof uploadedDocuments.$inferInsert;

/**
 * SVG asset library for whiteboard illustrations.
 * Pre-built or generated SVGs categorized and tagged for quick matching.
 */
export const svgAssets = mysqlTable("svgAssets", {
  id: int("id").autoincrement().primaryKey(),
  
  // Asset metadata
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  keywords: json("keywords").$type<string[]>().default([]),
  
  // SVG content
  svgContent: longtext("svgContent").notNull(),
  svgUrl: varchar("svgUrl", { length: 512 }),
  storageKey: varchar("storageKey", { length: 512 }),
  
  // Animation presets
  animationPresets: json("animationPresets").$type<string[]>().default([]),
  
  // Metadata
  isCustom: boolean("isCustom").default(false),
  createdBy: int("createdBy"), // userId if custom
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SvgAsset = typeof svgAssets.$inferSelect;
export type InsertSvgAsset = typeof svgAssets.$inferInsert;

/**
 * Audit log for tracking important actions.
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }),
  resourceId: int("resourceId"),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
