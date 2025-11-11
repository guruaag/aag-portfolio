-- =====================================================
-- FIXED RLS Policy - More Robust Version
-- =====================================================
-- This uses string functions instead of storage.foldername()
-- which is more reliable and works consistently
-- =====================================================

-- Step 1: Drop ALL existing insert policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;

-- Step 2: Create a TEMPORARY test policy (to verify uploads work)
-- This allows all authenticated uploads to public-assets bucket
-- Run this first to test if the basic setup works
CREATE POLICY "temp_allow_all_inserts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
);

-- =====================================================
-- TEST: Try uploading an image now
-- If this works, proceed to Step 3
-- If this fails, there's a different issue (auth, bucket, etc.)
-- =====================================================

-- Step 3: Once temp policy works, replace it with the secure policy
-- Uncomment the lines below and run them AFTER confirming temp policy works

/*
-- Drop the temp policy
DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;

-- Create the secure policy using string functions
-- This extracts the first folder from the path using split_part()
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND split_part(name, '/', 1) = (auth.uid())::text
);
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check current policies:
-- SELECT policyname, cmd, with_check 
-- FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects';

-- Test manual insert (replace YOUR_USER_ID with actual UUID):
-- INSERT INTO storage.objects (bucket_id, name, owner)
-- VALUES ('public-assets', 'YOUR_USER_ID/test.jpg', 'YOUR_USER_ID');

