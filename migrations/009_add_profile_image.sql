
-- Add profileImage column to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS "profileImage" TEXT;
