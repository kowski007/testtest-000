
-- Add missing columns to existing coins table (if it exists as zora_coins)
ALTER TABLE coins ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS image TEXT;

-- If your table is named zora_coins, rename it:
-- ALTER TABLE zora_coins RENAME TO coins;
