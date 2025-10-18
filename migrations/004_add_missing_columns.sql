
-- Add missing columns to coins table
ALTER TABLE coins ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coins' 
ORDER BY ordinal_position;
