import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scrapedContent = pgTable("scraped_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  platform: text("platform").notNull().default('blog'),
  title: text("title").notNull(),
  description: text("description"),
  author: text("author"),
  publishDate: text("publish_date"),
  image: text("image"),
  content: text("content"),
  tags: json("tags").$type<string[]>(),
  metadata: json("metadata"),
  scrapedAt: timestamp("scraped_at").defaultNow().notNull(),
});

export const coins = pgTable("coins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  address: text("address"),
  creator_wallet: text("creator_wallet").notNull(),
  status: text("status").notNull().default('pending'),
  scrapedContentId: varchar("scraped_content_id").references(() => scrapedContent.id),
  ipfsUri: text("ipfs_uri"),
  chainId: text("chain_id"),
  registryTxHash: text("registry_tx_hash"),
  metadataHash: text("metadata_hash"),
  registeredAt: timestamp("registered_at"),
  activityTrackerTxHash: text("activity_tracker_tx_hash"), // Activity tracker transaction hash
  activityTrackerRecordedAt: timestamp("activity_tracker_recorded_at"), // When recorded on activity tracker
  createdAt: timestamp("created_at").defaultNow().notNull(),
  image: text("image"), // Image URL for display
  description: text("description"), // Coin description
});

export const insertScrapedContentSchema = createInsertSchema(scrapedContent).omit({
  id: true,
  scrapedAt: true,
});

export const coinStatusSchema = z.enum(['pending', 'active', 'failed']);
export type CoinStatus = z.infer<typeof coinStatusSchema>;

export const insertCoinSchema = createInsertSchema(coins).omit({
  id: true,
  createdAt: true,
}).extend({
  status: coinStatusSchema.optional(),
  address: z.string().optional(),
});

export const updateCoinSchema = z.object({
  address: z.string().optional(),
  status: coinStatusSchema.optional(),
  chainId: z.string().optional(),
  registryTxHash: z.string().optional(),
  metadataHash: z.string().optional(),
  registeredAt: z.date().optional(),
  activityTrackerTxHash: z.string().optional(),
  activityTrackerRecordedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

export type InsertScrapedContent = z.infer<typeof insertScrapedContentSchema>;
export type ScrapedContent = typeof scrapedContent.$inferSelect;

export type InsertCoin = z.infer<typeof insertCoinSchema>;
export type UpdateCoin = z.infer<typeof updateCoinSchema>;
export type Coin = typeof coins.$inferSelect;
export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'platform' or 'trade'
  coinAddress: text("coin_address").notNull(),
  coinSymbol: text("coin_symbol").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  rewardAmount: text("reward_amount").notNull(), // In wei as string
  rewardCurrency: text("reward_currency").notNull().default('ZORA'),
  recipientAddress: text("recipient_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

// Notifications
export interface Notification {
  id: string;
  creator_id: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 
  | 'points_earned'
  | 'streak_milestone'
  | 'coin_created'
  | 'trade_completed'
  | 'referral_bonus'
  | 'zora_rewards';

export interface NotificationMetadata {
  points?: number;
  reason?: string;
  totalPoints?: number;
  shareText?: string;
  streakDays?: number;
  coinId?: string;
  tradeId?: string;
  referralCode?: string;
  zoraAmount?: number;
}

export const notificationSchema = z.object({
  id: z.string(),
  creator_id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
  read: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const insertNotificationSchema = notificationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  read: true
});

export const creators = pgTable("creators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  address: text("address").notNull().unique(),
  name: text("name"),
  bio: text("bio"),
  avatar: text("avatar"),
  verified: text("verified").notNull().default('false'),
  totalCoins: text("total_coins").notNull().default('0'),
  totalVolume: text("total_volume").notNull().default('0'),
  followers: text("followers").notNull().default('0'),
  points: text("points").notNull().default('0'),
  referralCode: text("referral_code").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCreatorSchema = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  verified: z.string().optional(),
  totalCoins: z.string().optional(),
  totalVolume: z.string().optional(),
  followers: z.string().optional(),
  points: z.string().optional(),
  referralCode: z.string().optional(),
});

export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type UpdateCreator = z.infer<typeof updateCreatorSchema>;
export type Creator = typeof creators.$inferSelect;

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coinAddress: text("coin_address").notNull(),
  userAddress: text("user_address").notNull(),
  comment: text("comment").notNull(),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerAddress: text("follower_address").notNull(),
  followingAddress: text("following_address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerAddress: text("referrer_address").notNull(),
  referredAddress: text("referred_address").notNull(),
  referralCode: text("referral_code").notNull(),
  pointsEarned: text("points_earned").notNull().default('100'),
  claimed: boolean("claimed").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  claimed: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

export const loginStreaks = pgTable("login_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userAddress: text("user_address").notNull().unique(),
  currentStreak: text("current_streak").notNull().default('0'),
  longestStreak: text("longest_streak").notNull().default('0'),
  lastLoginDate: text("last_login_date"),
  totalPoints: text("total_points").notNull().default('0'),
  loginDates: json("login_dates").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLoginStreakSchema = createInsertSchema(loginStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLoginStreakSchema = z.object({
  currentStreak: z.string().optional(),
  longestStreak: z.string().optional(),
  lastLoginDate: z.string().optional(),
  totalPoints: z.string().optional(),
  loginDates: z.array(z.string()).optional(),
});

export type InsertLoginStreak = z.infer<typeof insertLoginStreakSchema>;
export type UpdateLoginStreak = z.infer<typeof updateLoginStreakSchema>;
export type LoginStreak = typeof loginStreaks.$inferSelect;