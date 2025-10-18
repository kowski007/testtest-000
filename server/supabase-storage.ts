
import pkg from 'pg';
const { Pool } = pkg;
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

const databaseUrl = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class SupabaseStorage {
  // ===== COINS =====
  async getAllCoins(): Promise<Coin[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM coins ORDER BY created_at DESC');
      return result.rows as Coin[];
    } finally {
      client.release();
    }
  }

  async getCoin(id: string): Promise<Coin | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM coins WHERE id = $1', [id]);
      return result.rows[0] as Coin | undefined;
    } finally {
      client.release();
    }
  }

  async getCoinByAddress(address: string): Promise<Coin | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM coins WHERE address = $1', [address]);
      return result.rows[0] as Coin | undefined;
    } finally {
      client.release();
    }
  }

  async getCoinsByCreator(creator: string): Promise<Coin[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM coins WHERE creator_wallet = $1 ORDER BY created_at DESC',
        [creator]
      );
      return result.rows as Coin[];
    } finally {
      client.release();
    }
  }

  async createCoin(insertCoin: InsertCoin): Promise<Coin> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO coins (
          id, name, symbol, address, creator_wallet, status, 
          scraped_content_id, ipfs_uri, chain_id, registry_tx_hash, 
          metadata_hash, registered_at, created_at, image, description
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13
        ) RETURNING *`,
        [
          insertCoin.name, insertCoin.symbol, insertCoin.address, insertCoin.creator_wallet,
          insertCoin.status || 'pending', insertCoin.scrapedContentId, insertCoin.ipfsUri,
          insertCoin.chainId, insertCoin.registryTxHash, insertCoin.metadataHash,
          insertCoin.registeredAt, insertCoin.image, insertCoin.description
        ]
      );
      return result.rows[0] as Coin;
    } finally {
      client.release();
    }
  }

  async updateCoin(id: string, update: UpdateCoin): Promise<Coin | undefined> {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (update.address !== undefined) {
        fields.push(`address = $${paramCount++}`);
        values.push(update.address);
      }
      if (update.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(update.status);
      }

      if (fields.length === 0) return this.getCoin(id);

      values.push(id);
      const result = await client.query(
        `UPDATE coins SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0] as Coin | undefined;
    } finally {
      client.release();
    }
  }

  // ===== SCRAPED CONTENT =====
  async getScrapedContent(id: string): Promise<ScrapedContent | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM scraped_content WHERE id = $1', [id]);
      return result.rows[0] as ScrapedContent | undefined;
    } finally {
      client.release();
    }
  }

  async createScrapedContent(content: InsertScrapedContent): Promise<ScrapedContent> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO scraped_content (
          id, url, platform, title, description, author, publish_date, 
          image, content, tags, metadata, scraped_at
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
        ) RETURNING *`,
        [
          content.url, content.platform || 'blog', content.title, content.description,
          content.author, content.publishDate, content.image, content.content,
          JSON.stringify(content.tags || []), JSON.stringify(content.metadata || {})
        ]
      );
      return result.rows[0] as ScrapedContent;
    } finally {
      client.release();
    }
  }

  async getAllScrapedContent(): Promise<ScrapedContent[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM scraped_content ORDER BY scraped_at DESC');
      return result.rows as ScrapedContent[];
    } finally {
      client.release();
    }
  }

  // ===== REWARDS =====
  async getReward(id: string): Promise<Reward | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM rewards WHERE id = $1', [id]);
      return result.rows[0] as Reward | undefined;
    } finally {
      client.release();
    }
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO rewards (
          id, type, coin_address, coin_symbol, transaction_hash, 
          reward_amount, reward_currency, recipient_address, created_at
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW()
        ) RETURNING *`,
        [
          reward.type, reward.coinAddress, reward.coinSymbol, reward.transactionHash,
          reward.rewardAmount, reward.rewardCurrency || 'ZORA', reward.recipientAddress
        ]
      );
      return result.rows[0] as Reward;
    } finally {
      client.release();
    }
  }

  async getAllRewards(): Promise<Reward[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM rewards ORDER BY created_at DESC');
      return result.rows as Reward[];
    } finally {
      client.release();
    }
  }

  async getRewardsByCoin(coinAddress: string): Promise<Reward[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM rewards WHERE coin_address = $1 ORDER BY created_at DESC',
        [coinAddress]
      );
      return result.rows as Reward[];
    } finally {
      client.release();
    }
  }

  async getRewardsByRecipient(recipientAddress: string): Promise<Reward[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM rewards WHERE recipient_address = $1 ORDER BY created_at DESC',
        [recipientAddress]
      );
      return result.rows as Reward[];
    } finally {
      client.release();
    }
  }

  // ===== CREATORS =====
  async getCreator(id: string): Promise<Creator | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM creators WHERE id = $1', [id]);
      return result.rows[0] as Creator | undefined;
    } finally {
      client.release();
    }
  }

  async getCreatorByAddress(address: string): Promise<Creator | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM creators WHERE address = $1', [address]);
      return result.rows[0] as Creator | undefined;
    } finally {
      client.release();
    }
  }

  async getCreatorByReferralCode(referralCode: string): Promise<Creator | undefined> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM creators WHERE referral_code = $1', [referralCode]);
      return result.rows[0] as Creator | undefined;
    } finally {
      client.release();
    }
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO creators (
          id, address, name, bio, avatar, verified, total_coins, 
          total_volume, followers, referral_code, points, created_at, updated_at
        ) VALUES (
          gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
        ) RETURNING *`,
        [
          creator.address, creator.name, creator.bio, creator.avatar,
          creator.verified || 'false', creator.totalCoins || '0',
          creator.totalVolume || '0', creator.followers || '0',
          creator.referralCode || null, creator.points || '0'
        ]
      );
      return result.rows[0] as Creator;
    } finally {
      client.release();
    }
  }

  async updateCreator(id: string, update: UpdateCreator): Promise<Creator | undefined> {
    const client = await pool.connect();
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (update.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(update.name);
      }
      if (update.bio !== undefined) {
        fields.push(`bio = $${paramCount++}`);
        values.push(update.bio);
      }
      if (update.avatar !== undefined) {
        fields.push(`avatar = $${paramCount++}`);
        values.push(update.avatar);
      }
      if (update.verified !== undefined) {
        fields.push(`verified = $${paramCount++}`);
        values.push(update.verified);
      }
      if (update.totalCoins !== undefined) {
        fields.push(`total_coins = $${paramCount++}`);
        values.push(update.totalCoins);
      }
      if (update.totalVolume !== undefined) {
        fields.push(`total_volume = $${paramCount++}`);
        values.push(update.totalVolume);
      }
      if (update.followers !== undefined) {
        fields.push(`followers = $${paramCount++}`);
        values.push(update.followers);
      }
      if (update.referralCode !== undefined) {
        fields.push(`referral_code = $${paramCount++}`);
        values.push(update.referralCode);
      }
      if (update.points !== undefined) {
        fields.push(`points = $${paramCount++}`);
        values.push(update.points);
      }

      if (fields.length === 0) return this.getCreator(id);

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE creators SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0] as Creator | undefined;
    } finally {
      client.release();
    }
  }

  async getAllCreators(): Promise<Creator[]> {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM creators ORDER BY created_at DESC');
      return result.rows as Creator[];
    } finally {
      client.release();
    }
  }

  async getTopCreators(): Promise<Creator[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM creators ORDER BY total_coins DESC LIMIT 10'
      );
      return result.rows as Creator[];
    } finally {
      client.release();
    }
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
