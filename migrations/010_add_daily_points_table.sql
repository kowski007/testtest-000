-- Add daily_points table to track daily logins and streaks
CREATE TABLE IF NOT EXISTS daily_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT REFERENCES creators(id),
    date DATE NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(creator_id, date)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS daily_points_creator_id_idx ON daily_points(creator_id);
CREATE INDEX IF NOT EXISTS daily_points_date_idx ON daily_points(date);

-- Add new columns to notifications table for points metadata
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB;