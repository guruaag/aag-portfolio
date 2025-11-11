-- =====================================================
-- FINAL SECURE RLS Policy
-- =====================================================
-- Run this AFTER confirming temp_allow_all_inserts works
-- This uses split_part() which is more reliable than storage.foldername()
-- =====================================================

-- Step 1: Drop temp policy
DROP POLICY IF EXISTS "temp_allow_all_inserts" ON storage.objects;

-- Step 2: Create secure policy using split_part()
-- split_part(name, '/', 1) extracts the first folder from the path
-- This is more reliable than storage.foldername()
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'public-assets'
  AND split_part(name, '/', 1) = (auth.uid())::text
);

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify the policy was created:
SELECT 
  policyname, 
  cmd, 
  with_check,
  CASE 
    WHEN with_check LIKE '%split_part%' THEN '✅ Using split_part (GOOD)'
    WHEN with_check LIKE '%foldername%' THEN '⚠️ Using foldername (may fail)'
    ELSE '❓ Unknown function'
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND cmd = 'INSERT';

