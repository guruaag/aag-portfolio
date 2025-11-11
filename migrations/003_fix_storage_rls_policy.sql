-- =====================================================
-- Fix Storage RLS Policy for Image Uploads
-- =====================================================
-- This migration fixes the Row-Level Security policy
-- on storage.objects to allow authenticated users to
-- upload files to their own UUID folder in public-assets bucket
-- =====================================================

-- Step 1: Drop the existing insert policy if it exists
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

-- Step 2: Create the correct INSERT policy
-- This policy allows authenticated users to upload files
-- ONLY to folders that start with their own UUID
-- USING split_part() instead of storage.foldername() for better reliability
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND split_part(name, '/', 1) = (auth.uid())::text
);

-- Step 3: Verify the SELECT policy exists (for public read access)
-- If it doesn't exist, create it
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

-- Step 4: Verify policies are set correctly
-- Run this query to check:
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects';

