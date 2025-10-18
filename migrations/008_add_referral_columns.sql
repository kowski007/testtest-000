
-- Add referral code and points columns to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS points TEXT NOT NULL DEFAULT '0';

-- Create index for faster referral code lookups
CREATE INDEX IF NOT EXISTS idx_creators_referral_code ON creators(referral_code);
