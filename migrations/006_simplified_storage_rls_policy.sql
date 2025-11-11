-- =====================================================
-- Simplified Storage RLS Policy
-- =====================================================
-- Allows authenticated users to upload directly to
-- /publications/ and /authors/ folders without UUID prefix
-- =====================================================

-- Step 1: Drop old policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;

-- Step 2: Create simplified policy for authenticated uploads
-- Allows uploads to public-assets bucket for authenticated users
-- Paths should be: publications/... or authors/...
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
);

-- Step 3: Ensure public read policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Allow public read'
  ) THEN
    CREATE POLICY "Allow public read"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'public-assets');
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify policies:
-- SELECT policyname, cmd, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects';

