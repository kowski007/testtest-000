
-- Fix creator_wallet column
ALTER TABLE coins ADD COLUMN IF NOT EXISTS creator_wallet TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coins' 
AND column_name = 'creator_wallet';
