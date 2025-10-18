-- Create base tables

-- Create scraped_content table
CREATE TABLE IF NOT EXISTS scraped_content (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'blog',
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  publish_date TEXT,
  image TEXT,
  content TEXT,
  tags JSONB,
  metadata JSONB,
  scraped_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create coins table
CREATE TABLE IF NOT EXISTS coins (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  address TEXT,
  creator_wallet TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scraped_content_id VARCHAR REFERENCES scraped_content(id),
  ipfs_uri TEXT,
  chain_id TEXT,
  registry_tx_hash TEXT,
  metadata_hash TEXT,
  registered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  image TEXT,
  description TEXT
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  coin_address TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  reward_amount TEXT NOT NULL,
  reward_currency TEXT NOT NULL DEFAULT 'ZORA',
  recipient_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  coin_address TEXT,
  coin_symbol TEXT,
  amount TEXT,
  transaction_hash TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create creators table
CREATE TABLE IF NOT EXISTS creators (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  address TEXT NOT NULL UNIQUE,
  name TEXT,
  bio TEXT,
  avatar TEXT,
  verified TEXT NOT NULL DEFAULT 'false',
  total_coins TEXT NOT NULL DEFAULT '0',
  total_volume TEXT NOT NULL DEFAULT '0',
  followers TEXT NOT NULL DEFAULT '0',
  points TEXT NOT NULL DEFAULT '0',
  referral_code TEXT,
  "profileImage" TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  coin_address TEXT NOT NULL,
  user_address TEXT NOT NULL,
  comment TEXT NOT NULL,
  transaction_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  follower_address TEXT NOT NULL,
  creator_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(follower_address, creator_address)
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  referrer_address TEXT NOT NULL,
  referred_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(referrer_address, referred_address)
);

-- Create login_streaks table
CREATE TABLE IF NOT EXISTS login_streaks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_address TEXT NOT NULL UNIQUE,
  last_login TIMESTAMP NOT NULL,
  current_streak INT NOT NULL DEFAULT 1,
  longest_streak INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coins_address ON coins(address);
CREATE INDEX IF NOT EXISTS idx_coins_creator ON coins(creator_wallet);
CREATE INDEX IF NOT EXISTS idx_coins_status ON coins(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_creators_address ON creators(address);
CREATE INDEX IF NOT EXISTS idx_creators_referral_code ON creators(referral_code);
CREATE INDEX IF NOT EXISTS idx_comments_coin ON comments(coin_address);
CREATE INDEX IF NOT EXISTS idx_rewards_coin ON rewards(coin_address);
CREATE INDEX IF NOT EXISTS idx_rewards_recipient ON rewards(recipient_address);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_address);
CREATE INDEX IF NOT EXISTS idx_follows_creator ON follows(creator_address);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_address);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_address);
CREATE INDEX IF NOT EXISTS idx_login_streaks_user ON login_streaks(user_address);