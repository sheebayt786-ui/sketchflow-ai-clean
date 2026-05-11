import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  videoProjects,
  scenes,
  subscriptionPlans,
  creditTransactions,
  uploadedDocuments,
  svgAssets,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Video Projects
export async function getVideoProjectsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(videoProjects)
    .where(eq(videoProjects.userId, userId))
    .orderBy(videoProjects.createdAt);
}

export async function getVideoProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(videoProjects)
    .where(eq(videoProjects.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVideoProject(data: {
  userId: number;
  title: string;
  description?: string;
  whiteboardStyle: "sketch" | "canvas" | "chalkboard";
  voiceStyle: "male" | "female";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(videoProjects).values({
    userId: data.userId,
    title: data.title,
    description: data.description,
    whiteboardStyle: data.whiteboardStyle,
    voiceStyle: data.voiceStyle,
    status: "draft",
  });

  return result;
}

// Scenes
export async function getScenesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(scenes)
    .where(eq(scenes.projectId, projectId))
    .orderBy(scenes.sceneNumber);
}

export async function createScene(data: {
  projectId: number;
  sceneNumber: number;
  title: string;
  narrationText: string;
  illustrationKeywords?: string[];
  duration?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scenes).values({
    projectId: data.projectId,
    sceneNumber: data.sceneNumber,
    title: data.title,
    narrationText: data.narrationText,
    illustrationKeywords: data.illustrationKeywords || [],
    duration: data.duration || 5,
    status: "draft",
  });
}

// Subscription Plans
export async function getSubscriptionPlan(tier: "free" | "starter" | "creator" | "growth") {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.tier, tier))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSubscriptionPlans() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptionPlans);
}

// Credit Transactions
export async function createCreditTransaction(data: {
  userId: number;
  projectId?: number;
  amount: number;
  type: "purchase" | "usage" | "refund" | "monthly_grant";
  description?: string;
  balanceBefore: number;
  balanceAfter: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(creditTransactions).values({
    userId: data.userId,
    projectId: data.projectId,
    amount: data.amount,
    type: data.type,
    description: data.description,
    balanceBefore: data.balanceBefore,
    balanceAfter: data.balanceAfter,
  });
}

export async function getCreditTransactionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(creditTransactions.createdAt);
}

// Uploaded Documents
export async function createUploadedDocument(data: {
  userId: number;
  projectId?: number;
  filename: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  storageKey: string;
  extractedText?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(uploadedDocuments).values({
    userId: data.userId,
    projectId: data.projectId,
    filename: data.filename,
    mimeType: data.mimeType,
    fileSize: data.fileSize,
    storageUrl: data.storageUrl,
    storageKey: data.storageKey,
    extractedText: data.extractedText,
  });
}

export async function getUploadedDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.userId, userId))
    .orderBy(uploadedDocuments.createdAt);
}

// SVG Assets
export async function getSvgAssetsByKeywords(keywords: string[]) {
  const db = await getDb();
  if (!db) return [];

  // Simple implementation - in production, use full-text search
  return await db.select().from(svgAssets).limit(100);
}

export async function getSvgAssetsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(svgAssets)
    .where(eq(svgAssets.category, category));
}

export async function createSvgAsset(data: {
  name: string;
  category: string;
  keywords: string[];
  svgContent: string;
  svgUrl?: string;
  storageKey?: string;
  animationPresets?: string[];
  isCustom?: boolean;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(svgAssets).values({
    name: data.name,
    category: data.category,
    keywords: data.keywords,
    svgContent: data.svgContent,
    svgUrl: data.svgUrl,
    storageKey: data.storageKey,
    animationPresets: data.animationPresets || [],
    isCustom: data.isCustom || false,
    createdBy: data.createdBy,
  });
}

// Utility: Update user credits
export async function updateUserCredits(
  userId: number,
  newBalance: number,
  transactionType: "purchase" | "usage" | "refund" | "monthly_grant",
  description?: string,
  projectId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const oldBalance = user.creditsBalance;

  // Update user balance
  await db
    .update(users)
    .set({ creditsBalance: newBalance })
    .where(eq(users.id, userId));

  // Record transaction
  await createCreditTransaction({
    userId,
    projectId,
    amount: newBalance - oldBalance,
    type: transactionType,
    description,
    balanceBefore: oldBalance,
    balanceAfter: newBalance,
  });
}
