import { type ScrapedContent, type InsertScrapedContent, type Coin, type InsertCoin, type UpdateCoin, type Reward, type InsertReward, type Creator, type InsertCreator, type UpdateCreator, type Comment, type InsertComment, type Notification, type InsertNotification, type Follow, type InsertFollow, type Referral, type InsertReferral, type LoginStreak, type InsertLoginStreak, type UpdateLoginStreak } from "@shared/schema";
import { randomUUID } from "crypto";
import { SupabaseStorage } from "./supabase-storage";

export interface IStorage {
  // Scraped Content
  getScrapedContent(id: string): Promise<ScrapedContent | undefined>;
  createScrapedContent(content: InsertScrapedContent): Promise<ScrapedContent>;
  getAllScrapedContent(): Promise<ScrapedContent[]>;
  
  // Coins
  getCoin(id: string): Promise<Coin | undefined>;
  getCoinByAddress(address: string): Promise<Coin | undefined>;
  createCoin(coin: InsertCoin): Promise<Coin>;
  updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined>;
  getAllCoins(): Promise<Coin[]>;
  getCoinsByCreator(creator: string): Promise<Coin[]>;
  
  // Rewards
  getReward(id: string): Promise<Reward | undefined>;
  createReward(reward: InsertReward): Promise<Reward>;
  getAllRewards(): Promise<Reward[]>;
  getRewardsByCoin(coinAddress: string): Promise<Reward[]>;
  getRewardsByRecipient(recipientAddress: string): Promise<Reward[]>;
  
  // Creators
  getCreator(id: string): Promise<Creator | undefined>;
  getCreatorByAddress(address: string): Promise<Creator | undefined>;
  getCreatorByReferralCode(referralCode: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: string, update: UpdateCreator): Promise<Creator | undefined>;
  getAllCreators(): Promise<Creator[]>;
  getTopCreators(): Promise<Creator[]>;
  
  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByCoin(coinAddress: string): Promise<Comment[]>;
  getAllComments(): Promise<Comment[]>;
  
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getUnreadNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: string): Promise<boolean>;
  
  // Follows
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerAddress: string, followingAddress: string): Promise<boolean>;
  getFollowers(userAddress: string): Promise<Follow[]>;
  getFollowing(userAddress: string): Promise<Follow[]>;
  isFollowing(followerAddress: string, followingAddress: string): Promise<boolean>;
  
  // Referrals
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(referrerAddress: string): Promise<Referral[]>;
  getReferralsByCode(referralCode: string): Promise<Referral[]>;
  getReferralByAddresses(referrerAddress: string, referredAddress: string): Promise<Referral | undefined>;
  
  // Login Streaks
  getLoginStreak(userAddress: string): Promise<LoginStreak | undefined>;
  createLoginStreak(loginStreak: InsertLoginStreak): Promise<LoginStreak>;
  updateLoginStreak(userAddress: string, update: UpdateLoginStreak): Promise<LoginStreak | undefined>;
}

export class MemStorage implements IStorage {
  private scrapedContent: Map<string, ScrapedContent>;
  private coins: Map<string, Coin>;
  private rewards: Map<string, Reward>;
  private creators: Map<string, Creator>;
  private comments: Map<string, Comment>;
  private notifications: Map<string, Notification>;
  private follows: Map<string, Follow>;
  private referrals: Map<string, Referral>;
  private loginStreaks: Map<string, LoginStreak>;

  constructor() {
    this.scrapedContent = new Map();
    this.coins = new Map();
    this.rewards = new Map();
    this.creators = new Map();
    this.comments = new Map();
    this.notifications = new Map();
    this.follows = new Map();
    this.referrals = new Map();
    this.loginStreaks = new Map();
  }

  async getScrapedContent(id: string): Promise<ScrapedContent | undefined> {
    return this.scrapedContent.get(id);
  }

  async createScrapedContent(insertContent: InsertScrapedContent): Promise<ScrapedContent> {
    const id = randomUUID();
    const content: ScrapedContent = { 
      ...insertContent,
      platform: insertContent.platform ?? 'blog',
      image: insertContent.image ?? null,
      content: insertContent.content ?? null,
      description: insertContent.description ?? null,
      author: insertContent.author ?? null,
      publishDate: insertContent.publishDate ?? null,
      tags: insertContent.tags ? [...insertContent.tags] : null,
      metadata: insertContent.metadata ?? null,
      id,
      scrapedAt: new Date()
    };
    this.scrapedContent.set(id, content);
    return content;
  }

  async getAllScrapedContent(): Promise<ScrapedContent[]> {
    return Array.from(this.scrapedContent.values());
  }

  async getCoin(id: string): Promise<Coin | undefined> {
    return this.coins.get(id);
  }

  async getCoinByAddress(address: string): Promise<Coin | undefined> {
    const coin = Array.from(this.coins.values()).find(
      (coin) => coin.address?.toLowerCase() === address.toLowerCase()
    );
    
    if (!coin) return undefined;
    
    if (coin.scrapedContentId) {
      const content = this.scrapedContent.get(coin.scrapedContentId);
      if (content) {
        return {
          ...coin,
          metadata: {
            title: content.title,
            description: content.description,
            image: content.image,
            animation_url: (content.metadata as any)?.animation_url,
            originalUrl: content.url,
            author: content.author
          }
        } as any;
      }
    }
    
    return coin;
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const id = randomUUID();
    const coin: Coin = {
      id,
      symbol: insertCoin.symbol ?? '',
      name: insertCoin.name ?? '',
      address: insertCoin.address ?? null,
      creator_wallet: insertCoin.creator_wallet ?? '',
      status: insertCoin.status ?? 'pending',
      scrapedContentId: insertCoin.scrapedContentId ?? null,
      ipfsUri: insertCoin.ipfsUri ?? null,
      chainId: insertCoin.chainId ?? null,
      registryTxHash: insertCoin.registryTxHash ?? null,
      metadataHash: insertCoin.metadataHash ?? null,
      registeredAt: insertCoin.registeredAt ?? null,
      image: insertCoin.image ?? null,
      description: insertCoin.description ?? null,
      createdAt: new Date()
    };
    this.coins.set(id, coin);
    return coin;
  }

  async updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined> {
    const coin = this.coins.get(id);
    if (!coin) return undefined;
    
    const updatedCoin: Coin = {
      ...coin,
      ...(update.address !== undefined && { address: update.address }),
      ...(update.status !== undefined && { status: update.status }),
    };
    
    this.coins.set(id, updatedCoin);
    return updatedCoin;
  }

  async getAllCoins(): Promise<Coin[]> {
    const coins = Array.from(this.coins.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    return coins.map(coin => {
      if (coin.scrapedContentId) {
        const content = this.scrapedContent.get(coin.scrapedContentId);
        if (content) {
          return {
            ...coin,
            metadata: {
              title: content.title,
              description: content.description,
              image: content.image,
              originalUrl: content.url,
              author: content.author
            }
          };
        }
      }
      return coin;
    }) as any;
  }

  async getCoinsByCreator(creator: string): Promise<Coin[]> {
    const coins = Array.from(this.coins.values()).filter(
      (coin) => coin.creator_wallet.toLowerCase() === creator.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return coins.map(coin => {
      if (coin.scrapedContentId) {
        const content = this.scrapedContent.get(coin.scrapedContentId);
        if (content) {
          return {
            ...coin,
            metadata: {
              title: content.title,
              description: content.description,
              image: content.image,
              originalUrl: content.url,
              author: content.author
            }
          };
        }
      }
      return coin;
    }) as any;
  }

  async getReward(id: string): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = randomUUID();
    const reward: Reward = {
      ...insertReward,
      rewardCurrency: insertReward.rewardCurrency ?? 'ZORA',
      id,
      createdAt: new Date()
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRewardsByCoin(coinAddress: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.coinAddress.toLowerCase() === coinAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getRewardsByRecipient(recipientAddress: string): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.recipientAddress.toLowerCase() === recipientAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCreator(id: string): Promise<Creator | undefined> {
    return this.creators.get(id);
  }

  async getCreatorByAddress(address: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(
      (creator) => creator.address.toLowerCase() === address.toLowerCase()
    );
  }

  async getCreatorByReferralCode(referralCode: string): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(
      (creator) => creator.referralCode === referralCode
    );
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = randomUUID();
    const creator: Creator = {
      ...insertCreator,
      verified: insertCreator.verified ?? 'false',
      totalCoins: insertCreator.totalCoins ?? '0',
      totalVolume: insertCreator.totalVolume ?? '0',
      followers: insertCreator.followers ?? '0',
      points: insertCreator.points ?? '0',
      referralCode: insertCreator.referralCode ?? null,
      name: insertCreator.name ?? null,
      bio: insertCreator.bio ?? null,
      avatar: insertCreator.avatar ?? null,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreator(id: string, update: UpdateCreator): Promise<Creator | undefined> {
    const creator = this.creators.get(id);
    if (!creator) return undefined;
    
    const updatedCreator: Creator = {
      ...creator,
      ...(update.name !== undefined && { name: update.name }),
      ...(update.bio !== undefined && { bio: update.bio }),
      ...(update.avatar !== undefined && { avatar: update.avatar }),
      ...(update.verified !== undefined && { verified: update.verified }),
      ...(update.totalCoins !== undefined && { totalCoins: update.totalCoins }),
      ...(update.totalVolume !== undefined && { totalVolume: update.totalVolume }),
      ...(update.followers !== undefined && { followers: update.followers }),
      ...(update.points !== undefined && { points: update.points }),
      ...(update.referralCode !== undefined && { referralCode: update.referralCode }),
      updatedAt: new Date()
    };
    
    this.creators.set(id, updatedCreator);
    return updatedCreator;
  }

  async getAllCreators(): Promise<Creator[]> {
    return Array.from(this.creators.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getTopCreators(): Promise<Creator[]> {
    return Array.from(this.creators.values()).sort(
      (a, b) => parseInt(b.totalCoins) - parseInt(a.totalCoins)
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      transactionHash: insertComment.transactionHash ?? null,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByCoin(coinAddress: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.coinAddress.toLowerCase() === coinAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllComments(): Promise<Comment[]> {
    return Array.from(this.comments.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      coinAddress: insertNotification.coinAddress ?? null,
      coinSymbol: insertNotification.coinSymbol ?? null,
      amount: insertNotification.amount ?? null,
      transactionHash: insertNotification.transactionHash ?? null,
      read: false,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId.toLowerCase() === userId.toLowerCase())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => 
        notif.userId.toLowerCase() === userId.toLowerCase() && !notif.read
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updated: Notification = { ...notification, read: true };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    Array.from(this.notifications.values())
      .filter(notif => notif.userId.toLowerCase() === userId.toLowerCase())
      .forEach(notif => {
        this.notifications.set(notif.id, { ...notif, read: true });
      });
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }
  
  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = randomUUID();
    const follow: Follow = {
      ...insertFollow,
      id,
      createdAt: new Date()
    };
    this.follows.set(id, follow);
    return follow;
  }

  async deleteFollow(followerAddress: string, followingAddress: string): Promise<boolean> {
    const follow = Array.from(this.follows.values()).find(
      (f) => f.followerAddress.toLowerCase() === followerAddress.toLowerCase() && 
             f.followingAddress.toLowerCase() === followingAddress.toLowerCase()
    );
    if (!follow) return false;
    return this.follows.delete(follow.id);
  }

  async getFollowers(userAddress: string): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(
      (follow) => follow.followingAddress.toLowerCase() === userAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getFollowing(userAddress: string): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(
      (follow) => follow.followerAddress.toLowerCase() === userAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async isFollowing(followerAddress: string, followingAddress: string): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      (follow) => follow.followerAddress.toLowerCase() === followerAddress.toLowerCase() && 
                  follow.followingAddress.toLowerCase() === followingAddress.toLowerCase()
    );
  }
  
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = randomUUID();
    const referral: Referral = {
      ...insertReferral,
      pointsEarned: insertReferral.pointsEarned ?? '100',
      claimed: true,
      id,
      createdAt: new Date()
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getReferralsByReferrer(referrerAddress: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referrerAddress.toLowerCase() === referrerAddress.toLowerCase()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReferralsByCode(referralCode: string): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      (referral) => referral.referralCode === referralCode
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReferralByAddresses(referrerAddress: string, referredAddress: string): Promise<Referral | undefined> {
    return Array.from(this.referrals.values()).find(
      (referral) => referral.referrerAddress.toLowerCase() === referrerAddress.toLowerCase() && 
                    referral.referredAddress.toLowerCase() === referredAddress.toLowerCase()
    );
  }

  async getLoginStreak(userAddress: string): Promise<LoginStreak | undefined> {
    return Array.from(this.loginStreaks.values()).find(
      (streak) => streak.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }

  async createLoginStreak(insertLoginStreak: InsertLoginStreak): Promise<LoginStreak> {
    const id = randomUUID();
    const loginStreak: LoginStreak = {
      ...insertLoginStreak,
      currentStreak: insertLoginStreak.currentStreak ?? '0',
      longestStreak: insertLoginStreak.longestStreak ?? '0',
      lastLoginDate: insertLoginStreak.lastLoginDate ?? null,
      totalPoints: insertLoginStreak.totalPoints ?? '0',
      loginDates: insertLoginStreak.loginDates ?? [],
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.loginStreaks.set(id, loginStreak);
    return loginStreak;
  }

  async updateLoginStreak(userAddress: string, update: UpdateLoginStreak): Promise<LoginStreak | undefined> {
    const loginStreak = await this.getLoginStreak(userAddress);
    if (!loginStreak) return undefined;
    
    const updatedLoginStreak: LoginStreak = {
      ...loginStreak,
      ...(update.currentStreak !== undefined && { currentStreak: update.currentStreak }),
      ...(update.longestStreak !== undefined && { longestStreak: update.longestStreak }),
      ...(update.lastLoginDate !== undefined && { lastLoginDate: update.lastLoginDate }),
      ...(update.totalPoints !== undefined && { totalPoints: update.totalPoints }),
      ...(update.loginDates !== undefined && { loginDates: update.loginDates }),
      updatedAt: new Date()
    };
    
    this.loginStreaks.set(loginStreak.id, updatedLoginStreak);
    return updatedLoginStreak;
  }
}

// Use SupabaseStorage for ALL data - no more in-memory storage
const supabaseStorage = new SupabaseStorage();

export const storage: IStorage = {
  // Scraped Content (Supabase)
  getScrapedContent: (id) => supabaseStorage.getScrapedContent(id),
  createScrapedContent: (content) => supabaseStorage.createScrapedContent(content),
  getAllScrapedContent: () => supabaseStorage.getAllScrapedContent(),

  // Coins (Supabase)
  getCoin: (id) => supabaseStorage.getCoin(id),
  getCoinByAddress: (address) => supabaseStorage.getCoinByAddress(address),
  createCoin: (coin) => supabaseStorage.createCoin(coin),
  updateCoin: (id, update) => supabaseStorage.updateCoin(id, update),
  getAllCoins: () => supabaseStorage.getAllCoins(),
  getCoinsByCreator: (creator) => supabaseStorage.getCoinsByCreator(creator),

  // Rewards (Supabase)
  getReward: (id) => supabaseStorage.getReward(id),
  createReward: (reward) => supabaseStorage.createReward(reward),
  getAllRewards: () => supabaseStorage.getAllRewards(),
  getRewardsByCoin: (coinAddress) => supabaseStorage.getRewardsByCoin(coinAddress),
  getRewardsByRecipient: (recipientAddress) => supabaseStorage.getRewardsByRecipient(recipientAddress),

  // Creators (Supabase)
  getCreator: (id) => supabaseStorage.getCreator(id),
  getCreatorByAddress: (address) => supabaseStorage.getCreatorByAddress(address),
  getCreatorByReferralCode: (referralCode) => supabaseStorage.getCreatorByReferralCode(referralCode),
  createCreator: (creator) => supabaseStorage.createCreator(creator),
  updateCreator: (id, update) => supabaseStorage.updateCreator(id, update),
  getAllCreators: () => supabaseStorage.getAllCreators(),
  getTopCreators: () => supabaseStorage.getTopCreators(),

  // Comments (Supabase)
  createComment: (comment) => supabaseStorage.createComment(comment),
  getCommentsByCoin: (coinAddress) => supabaseStorage.getCommentsByCoin(coinAddress),
  getAllComments: () => supabaseStorage.getAllComments(),

  // Notifications (Supabase)
  createNotification: (notification) => supabaseStorage.createNotification(notification),
  getNotificationsByUser: (userId) => supabaseStorage.getNotificationsByUser(userId),
  getUnreadNotificationsByUser: (userId) => supabaseStorage.getUnreadNotificationsByUser(userId),
  markNotificationAsRead: (id) => supabaseStorage.markNotificationAsRead(id),
  markAllNotificationsAsRead: (userId) => supabaseStorage.markAllNotificationsAsRead(userId),
  deleteNotification: (id) => supabaseStorage.deleteNotification(id),
  
  // Follows (Supabase)
  createFollow: (follow) => supabaseStorage.createFollow(follow),
  deleteFollow: (followerAddress, followingAddress) => supabaseStorage.deleteFollow(followerAddress, followingAddress),
  getFollowers: (userAddress) => supabaseStorage.getFollowers(userAddress),
  getFollowing: (userAddress) => supabaseStorage.getFollowing(userAddress),
  isFollowing: (followerAddress, followingAddress) => supabaseStorage.isFollowing(followerAddress, followingAddress),
  
  // Referrals (Supabase)
  createReferral: (referral) => supabaseStorage.createReferral(referral),
  getReferralsByReferrer: (referrerAddress) => supabaseStorage.getReferralsByReferrer(referrerAddress),
  getReferralsByCode: (referralCode) => supabaseStorage.getReferralsByCode(referralCode),
  getReferralByAddresses: (referrerAddress, referredAddress) => supabaseStorage.getReferralByAddresses(referrerAddress, referredAddress),

  // Login Streaks (Supabase)
  getLoginStreak: (userAddress) => supabaseStorage.getLoginStreak(userAddress),
  createLoginStreak: (loginStreak) => supabaseStorage.createLoginStreak(loginStreak),
  updateLoginStreak: (userAddress, update) => supabaseStorage.updateLoginStreak(userAddress, update),
};
