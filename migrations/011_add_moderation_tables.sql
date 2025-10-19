-- Add status and restricted_until to creators table
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS restricted_until TIMESTAMP WITH TIME ZONE;

-- Create moderation_actions table
CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id TEXT REFERENCES creators(id),
    type TEXT NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for looking up moderation history
CREATE INDEX IF NOT EXISTS moderation_actions_creator_id_idx ON moderation_actions(creator_id);