
-- Add missing status column to coins table
ALTER TABLE coins ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'coins' 
AND column_name = 'status';
