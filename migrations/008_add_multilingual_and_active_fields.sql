-- Add multilingual fields to poems table
ALTER TABLE poems 
ADD COLUMN IF NOT EXISTS heading_en text,
ADD COLUMN IF NOT EXISTS heading_hi text,
ADD COLUMN IF NOT EXISTS body_text_en text,
ADD COLUMN IF NOT EXISTS body_text_hi text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Migrate existing heading to heading_en and heading_hi
UPDATE poems 
SET heading_en = heading, 
    heading_hi = heading 
WHERE heading IS NOT NULL AND heading_en IS NULL;

-- Add is_active field to categories and publications
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE publications 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add hero_tagline_en and hero_tagline_hi to settings (will be stored as key-value pairs)
-- These will be managed through the settings table

