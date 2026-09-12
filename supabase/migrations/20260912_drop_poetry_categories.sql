-- Safe Database Migration Script: Drop poetry_categories and unused constraints

-- 1. Safely remove foreign key constraints referencing categories from poems table (if any exist)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'poems_category_id_fkey' 
        AND table_name = 'poems'
    ) THEN
        ALTER TABLE poems DROP CONSTRAINT poems_category_id_fkey;
    END IF;
END $$;

-- 2. Drop category_id column if present on poems table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'poems' AND column_name = 'category_id'
    ) THEN
        ALTER TABLE poems DROP COLUMN category_id;
    END IF;
END $$;

-- 3. Drop poetry_categories table if it exists
DROP TABLE IF EXISTS poetry_categories CASCADE;

-- 4. Drop categories table if it exists
DROP TABLE IF EXISTS categories CASCADE;
