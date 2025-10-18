
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
