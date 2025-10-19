
import { createClient } from '@supabase/supabase-js';
import { 
  type Coin, type InsertCoin, type UpdateCoin,
  type ScrapedContent, type InsertScrapedContent,
  type Reward, type InsertReward,
  type Creator, type InsertCreator, type UpdateCreator,
  type Comment, type InsertComment,
  type Notification, type InsertNotification,
  type Follow, type InsertFollow,
  type Referral, type InsertReferral,
  type LoginStreak, type InsertLoginStreak, type UpdateLoginStreak
} from '@shared/schema';

// Initialize Supabase client with service role key for full database access
console.log('Loading Supabase configuration...');

// Hardcoded configuration for development
const supabaseUrl = 'https://hgwhbdlejogerdghkxac.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd2hiZGxlam9nZXJkZ2hreGFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc1MzI4NiwiZXhwIjoyMDc2MzI5Mjg2fQ.pTy3zUBuCUqZJd-tC4VXu-HYCO1SfrObTGh2eXHYY3g';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment configuration error:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'set' : 'missing');
  throw new Error('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseStorage {
  // ===== COINS =====
  async getAllCoins(): Promise<Coin[]> {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Coin[];
  }

  async getCoin(id: string): Promise<Coin | undefined> {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data as Coin | undefined;
  }

  async getCoinByAddress(address: string): Promise<Coin | undefined> {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .eq('address', address)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Coin | undefined;
  }

  async getCoinsByCreator(creator: string): Promise<Coin[]> {
    const { data, error } = await supabase
      .from('coins')
      .select('*')
      .eq('creator_wallet', creator)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Coin[];
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const { data, error } = await supabase
      .from('coins')
      .insert({
        name: insertCoin.name,
        symbol: insertCoin.symbol,
        address: insertCoin.address,
        creator_wallet: insertCoin.creator_wallet,
        status: insertCoin.status || 'pending',
        scraped_content_id: insertCoin.scrapedContentId,
        ipfs_uri: insertCoin.ipfsUri,
        chain_id: insertCoin.chainId,
        registry_tx_hash: insertCoin.registryTxHash,
        metadata_hash: insertCoin.metadataHash,
        registered_at: insertCoin.registeredAt,
        image: insertCoin.image,
        description: insertCoin.description,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as Coin;
  }

  async updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined> {
    const { data, error } = await supabase
      .from('coins')
      .update({
        ...(update.address !== undefined && { address: update.address }),
        ...(update.status !== undefined && { status: update.status })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Coin;
  }

  // ===== SCRAPED CONTENT =====
  async getScrapedContent(id: string): Promise<ScrapedContent | undefined> {
    const { data, error } = await supabase
      .from('scraped_content')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as ScrapedContent | undefined;
  }

  async createScrapedContent(content: InsertScrapedContent): Promise<ScrapedContent> {
    const { data, error } = await supabase
      .from('scraped_content')
      .insert({
        url: content.url,
        platform: content.platform || 'blog',
        title: content.title,
        description: content.description,
        author: content.author,
        publish_date: content.publishDate,
        image: content.image,
        content: content.content,
        tags: content.tags || [],
        metadata: content.metadata || {},
        scraped_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as ScrapedContent;
  }

  async getAllScrapedContent(): Promise<ScrapedContent[]> {
    const { data, error } = await supabase
      .from('scraped_content')
      .select('*')
      .order('scraped_at', { ascending: false });

    if (error) throw error;
    return data as ScrapedContent[];
  }

  // ===== REWARDS =====
  async getReward(id: string): Promise<Reward | undefined> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Reward | undefined;
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .insert({
        type: reward.type,
        coin_address: reward.coinAddress,
        coin_symbol: reward.coinSymbol,
        transaction_hash: reward.transactionHash,
        reward_amount: reward.rewardAmount,
        reward_currency: reward.rewardCurrency || 'ZORA',
        recipient_address: reward.recipientAddress,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as Reward;
  }

  async getAllRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Reward[];
  }

  async getRewardsByCoin(coinAddress: string): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('coin_address', coinAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Reward[];
  }

  async getRewardsByRecipient(recipientAddress: string): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('recipient_address', recipientAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Reward[];
  }

  // ===== CREATORS =====
  async getCreator(id: string): Promise<Creator | undefined> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Creator | undefined;
  }

  async getCreatorByAddress(address: string): Promise<Creator | undefined> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('address', address)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Creator | undefined;
  }

  async getCreatorByReferralCode(referralCode: string): Promise<Creator | undefined> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('referral_code', referralCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Creator | undefined;
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const { data, error } = await supabase
      .from('creators')
      .insert({
        address: creator.address,
        name: creator.name,
        bio: creator.bio,
        avatar: creator.avatar,
        verified: creator.verified || 'false',
        total_coins: creator.totalCoins || '0',
        total_volume: creator.totalVolume || '0',
        followers: creator.followers || '0',
        referral_code: creator.referralCode || null,
        points: creator.points || '0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as Creator;
  }

  async updateCreator(id: string, update: UpdateCreator): Promise<Creator | undefined> {
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (update.name !== undefined) updates.name = update.name;
    if (update.bio !== undefined) updates.bio = update.bio;
    if (update.avatar !== undefined) updates.avatar = update.avatar;
    if (update.verified !== undefined) updates.verified = update.verified;
    if (update.totalCoins !== undefined) updates.total_coins = update.totalCoins;
    if (update.totalVolume !== undefined) updates.total_volume = update.totalVolume;
    if (update.followers !== undefined) updates.followers = update.followers;
    if (update.referralCode !== undefined) updates.referral_code = update.referralCode;
    if (update.points !== undefined) updates.points = update.points;

    const { data, error } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Creator;
  }

  // E1XP Points System Methods
  async addPoints(creatorId: string, amount: number, reason: string): Promise<void> {
    const creator = await this.getCreator(creatorId);
    if (!creator) throw new Error('Creator not found');

    const currentPoints = parseInt(creator.points || '0');
    const newPoints = currentPoints + amount;

    // Update creator points
    await this.updateCreator(creatorId, { points: newPoints.toString() });

    // Create notification for points earned
    const notification = {
      creator_id: creatorId,
      type: 'points_earned',
      title: '⚡ E1XP Points Earned!',
      message: `You earned ${amount} E1XP points for ${reason}`,
      metadata: {
        points: amount,
        reason,
        totalPoints: newPoints,
        shareText: `I just earned ${amount} E1XP points on @Every1Fun for ${reason}! Total: ${newPoints} ⚡\n\nJoin me: https://every1.fun/profile/${creatorId}\n\n#Every1Fun #E1XP #Web3`
      },
      read: false,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('notifications')
      .insert(notification);

    if (error) throw error;
  }

  async getDailyPoints(creatorId: string): Promise<{ claimed: boolean; streak: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_points')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Get streak information
    const { data: streakData, error: streakError } = await supabase
      .from('daily_points')
      .select('date')
      .eq('creator_id', creatorId)
      .order('date', { ascending: false });

    if (streakError) throw streakError;

    let streak = 0;
    if (streakData && streakData.length > 0) {
      const dates = streakData.map(d => new Date(d.date));
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (dates[0].toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        for (let i = 0; i < dates.length; i++) {
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - (i + 1));
          if (dates[i].toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
          } else break;
        }
      }
    }

    return {
      claimed: !!data,
      streak
    };
  }

  async claimDailyPoints(creatorId: string): Promise<number> {
    const { claimed, streak } = await this.getDailyPoints(creatorId);
    if (claimed) throw new Error('Daily points already claimed');

    const basePoints = 10;
    const streakBonus = Math.floor(streak / 7) * 5; // +5 points for every week of streak
    const totalPoints = basePoints + streakBonus;

    const today = new Date().toISOString().split('T')[0];
    
    // Record daily points claim
    const { error } = await supabase
      .from('daily_points')
      .insert({
        creator_id: creatorId,
        date: today,
        points: totalPoints
      });

    if (error) throw error;

    // Add points and create notification
    await this.addPoints(
      creatorId,
      totalPoints,
      `daily login (${streak + 1} day streak)`
    );

    return totalPoints;
  }

  async getAllCreators(): Promise<Creator[]> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Creator[];
  }

  async getTopCreators(): Promise<Creator[]> {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('total_coins', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data as Creator[];
  }

  // Points System Methods
  async awardPoints(creatorId: string, amount: number, reason: string, type: NotificationType): Promise<void> {
    const creator = await this.getCreator(creatorId);
    if (!creator) throw new Error('Creator not found');

    const currentPoints = parseInt(creator.points || '0');
    const newPoints = currentPoints + amount;

    // Update creator points
    await this.updateCreator(creatorId, { points: newPoints.toString() });

    // Create notification for points earned
    await this.createNotification({
      creator_id: creatorId,
      type,
      title: '⚡ E1XP Points Earned!',
      message: `You earned ${amount} E1XP points for ${reason}`,
      metadata: {
        points: amount,
        reason,
        totalPoints: newPoints,
        shareText: `I just earned ${amount} E1XP points on @Every1Fun for ${reason}! Total: ${newPoints} ⚡\n\nJoin me: https://every1.fun/profile/${creatorId}\n\n#Every1Fun #E1XP #Web3`
      },
      read: false
    });
  }

  async getDailyPointsStatus(creatorId: string): Promise<{ claimed: boolean; streak: number; nextClaimAmount: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already claimed today
    const { data: claimData, error: claimError } = await supabase
      .from('daily_points')
      .select('*')
      .eq('creator_id', creatorId)
      .eq('date', today)
      .single();

    if (claimError && claimError.code !== 'PGRST116') throw claimError;

    // Get streak information
    const { data: streakData, error: streakError } = await supabase
      .from('daily_points')
      .select('date')
      .eq('creator_id', creatorId)
      .order('date', { ascending: false });

    if (streakError) throw streakError;

    // Calculate current streak
    let streak = 0;
    if (streakData && streakData.length > 0) {
      const dates = streakData.map(d => new Date(d.date));
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (dates[0].toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        for (let i = 0; i < dates.length; i++) {
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() - (i + 1));
          if (dates[i].toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            streak++;
          } else break;
        }
      }
    }

    // Calculate next claim amount
    const basePoints = 10;
    const streakBonus = Math.floor(streak / 7) * 5; // +5 points for every week of streak
    const nextClaimAmount = basePoints + streakBonus;

    return {
      claimed: !!claimData,
      streak,
      nextClaimAmount
    };
  }

  async claimDailyPoints(creatorId: string): Promise<number> {
    const { claimed, streak, nextClaimAmount } = await this.getDailyPointsStatus(creatorId);
    if (claimed) throw new Error('Daily points already claimed');

    const today = new Date().toISOString().split('T')[0];
    
    // Record daily points claim
    const { error } = await supabase
      .from('daily_points')
      .insert({
        creator_id: creatorId,
        date: today,
        points: nextClaimAmount
      });

    if (error) throw error;

    // Add points and create notification
    await this.awardPoints(
      creatorId,
      nextClaimAmount,
      `daily login (${streak + 1} day streak)`,
      'points_earned'
    );

    // Check for streak milestones
    if ((streak + 1) % 7 === 0) {
      await this.createNotification({
        creator_id: creatorId,
        type: 'streak_milestone',
        title: '🎉 Weekly Streak Achievement!',
        message: `Congratulations! You've maintained a ${streak + 1} day streak! Keep it up for more bonus points!`,
        metadata: {
          streakDays: streak + 1,
          shareText: `I just hit a ${streak + 1} day streak on @Every1Fun! 🔥 Earning more E1XP points every day!\n\n#Every1Fun #E1XP #Web3`
        },
        read: false
      });
    }

    return nextClaimAmount;
  }

  // Notification Methods
  async createNotification(notification: {
    creator_id: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: NotificationMetadata;
    read: boolean;
  }): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getUserNotifications(creatorId: string): Promise<UserNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserNotification[];
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Moderation Methods
  async moderateUser(creatorId: string, action: ModerationType): Promise<void> {
    const now = new Date();
    const expiresAt = action.duration 
      ? new Date(now.getTime() + action.duration * 24 * 60 * 60 * 1000)
      : null;

    // Create moderation action record
    const { error: moderationError } = await supabase
      .from('moderation_actions')
      .insert({
        creator_id: creatorId,
        type: action.type,
        reason: action.reason,
        expires_at: expiresAt?.toISOString(),
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });

    if (moderationError) throw moderationError;

    // Update creator status
    const updates: any = {
      status: action.type === 'warning' ? 'warned' : action.type,
      restricted_until: expiresAt?.toISOString(),
      updated_at: now.toISOString()
    };

    const { error: updateError } = await supabase
      .from('creators')
      .update(updates)
      .eq('id', creatorId);

    if (updateError) throw updateError;

    // Create notification for the user
    const notification = {
      creator_id: creatorId,
      type: `account_${action.type}`,
      title: `Account ${action.type === 'warning' ? 'Warning' : action.type === 'restrict' ? 'Restricted' : 'Banned'}`,
      message: `Your account has been ${action.type === 'warning' ? 'warned' : action.type === 'restrict' ? 'restricted' : 'banned'} for the following reason: ${action.reason}`,
      metadata: {
        type: action.type,
        reason: action.reason,
        duration: action.duration,
        expiresAt: expiresAt?.toISOString()
      },
      read: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notification);

    if (notificationError) throw notificationError;
  }

  async getModerationHistory(creatorId: string): Promise<ModerationType[]> {
    const { data, error } = await supabase
      .from('moderation_actions')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ModerationType[];
  }

  // ===== COMMENTS =====
  async createComment(comment: InsertComment): Promise<Comment> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO comments (
          id, coin_address, user_address, comment, transaction_hash, created_at
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, NOW()
        ) RETURNING *`,
        [comment.coinAddress, comment.userAddress, comment.comment, comment.transactionHash]
      );
      return result.rows[0] as Comment;
    } finally {
      client.release();
    }
  }

  async getCommentsByCoin(coinAddress: string): Promise<Comment[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM comments WHERE coin_address = $1 ORDER BY created_at DESC',
        [coinAddress]
      );
      return result.rows as Comment[];
    } finally {
      client.release();
    }
  }

  async getAllComments(): Promise<Comment[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM comments ORDER BY created_at DESC');
      return result.rows as Comment[];
    } finally {
      client.release();
    }
  }

  // ===== NOTIFICATIONS =====
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO notifications (
          id, user_id, type, title, message, coin_address, coin_symbol, 
          amount, transaction_hash, read, created_at
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, false, NOW()
        ) RETURNING *`,
        [
          notification.userId, notification.type, notification.title, notification.message,
          notification.coinAddress, notification.coinSymbol, notification.amount,
          notification.transactionHash
        ]
      );
      return result.rows[0] as Notification;
    } finally {
      client.release();
    }
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows as Notification[];
    } finally {
      client.release();
    }
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM notifications WHERE user_id = $1 AND read = false ORDER BY created_at DESC',
        [userId]
      );
      return result.rows as Notification[];
    } finally {
      client.release();
    }
  }

  async markNotificationAsRead(id: string): Promise<Notification | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE notifications SET read = true WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] as Notification | undefined;
    } finally {
      client.release();
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE notifications SET read = true WHERE user_id = $1', [userId]);
    } finally {
      client.release();
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query('DELETE FROM notifications WHERE id = $1', [id]);
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  // ===== FOLLOWS =====
  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO follows (id, follower_address, following_address, created_at)
         VALUES (gen_random_uuid()::text, $1, $2, NOW())
         RETURNING *`,
        [insertFollow.followerAddress, insertFollow.followingAddress]
      );
      return result.rows[0] as Follow;
    } finally {
      client.release();
    }
  }

  async deleteFollow(followerAddress: string, followingAddress: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM follows WHERE follower_address = $1 AND following_address = $2',
        [followerAddress, followingAddress]
      );
      return (result.rowCount || 0) > 0;
    } finally {
      client.release();
    }
  }

  async getFollowers(userAddress: string): Promise<Follow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM follows WHERE following_address = $1 ORDER BY created_at DESC',
        [userAddress]
      );
      return result.rows as Follow[];
    } finally {
      client.release();
    }
  }

  async getFollowing(userAddress: string): Promise<Follow[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM follows WHERE follower_address = $1 ORDER BY created_at DESC',
        [userAddress]
      );
      return result.rows as Follow[];
    } finally {
      client.release();
    }
  }

  async isFollowing(followerAddress: string, followingAddress: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT 1 FROM follows WHERE follower_address = $1 AND following_address = $2',
        [followerAddress, followingAddress]
      );
      return result.rows.length > 0;
    } finally {
      client.release();
    }
  }

  // ===== REFERRALS =====
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO referrals (
          id, referrer_address, referred_address, referral_code, 
          points_earned, claimed, created_at
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, true, NOW()
        ) RETURNING *`,
        [
          insertReferral.referrerAddress,
          insertReferral.referredAddress,
          insertReferral.referralCode,
          insertReferral.pointsEarned || '100'
        ]
      );
      return result.rows[0] as Referral;
    } finally {
      client.release();
    }
  }

  async getReferralsByReferrer(referrerAddress: string): Promise<Referral[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM referrals WHERE referrer_address = $1 ORDER BY created_at DESC',
        [referrerAddress]
      );
      return result.rows as Referral[];
    } finally {
      client.release();
    }
  }

  async getReferralsByCode(referralCode: string): Promise<Referral[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM referrals WHERE referral_code = $1 ORDER BY created_at DESC',
        [referralCode]
      );
      return result.rows as Referral[];
    } finally {
      client.release();
    }
  }

  async getReferralByAddresses(referrerAddress: string, referredAddress: string): Promise<Referral | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM referrals WHERE referrer_address = $1 AND referred_address = $2',
        [referrerAddress, referredAddress]
      );
      return result.rows[0] as Referral | undefined;
    } finally {
      client.release();
    }
  }

  async getLoginStreak(userAddress: string): Promise<LoginStreak | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM login_streaks WHERE user_address = $1',
        [userAddress]
      );
      return result.rows[0] as LoginStreak | undefined;
    } finally {
      client.release();
    }
  }

  async createLoginStreak(insertLoginStreak: InsertLoginStreak): Promise<LoginStreak> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO login_streaks (
          user_address, current_streak, longest_streak, last_login_date, 
          total_points, login_dates
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          insertLoginStreak.userAddress,
          insertLoginStreak.currentStreak || '0',
          insertLoginStreak.longestStreak || '0',
          insertLoginStreak.lastLoginDate || null,
          insertLoginStreak.totalPoints || '0',
          JSON.stringify(insertLoginStreak.loginDates || [])
        ]
      );
      return result.rows[0] as LoginStreak;
    } finally {
      client.release();
    }
  }

  async updateLoginStreak(userAddress: string, update: UpdateLoginStreak): Promise<LoginStreak | undefined> {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (update.currentStreak !== undefined) {
        fields.push(`current_streak = $${paramIndex++}`);
        values.push(update.currentStreak);
      }
      if (update.longestStreak !== undefined) {
        fields.push(`longest_streak = $${paramIndex++}`);
        values.push(update.longestStreak);
      }
      if (update.lastLoginDate !== undefined) {
        fields.push(`last_login_date = $${paramIndex++}`);
        values.push(update.lastLoginDate);
      }
      if (update.totalPoints !== undefined) {
        fields.push(`total_points = $${paramIndex++}`);
        values.push(update.totalPoints);
      }
      if (update.loginDates !== undefined) {
        fields.push(`login_dates = $${paramIndex++}`);
        values.push(JSON.stringify(update.loginDates));
      }
      
      fields.push(`updated_at = NOW()`);
      values.push(userAddress);

      const result = await client.query(
        `UPDATE login_streaks SET ${fields.join(', ')} WHERE user_address = $${paramIndex} RETURNING *`,
        values
      );
      return result.rows[0] as LoginStreak | undefined;
    } finally {
      client.release();
    }
  }
}
