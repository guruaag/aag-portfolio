-- =====================================================
-- Migration Script: Move Existing Files from UUID Folders
-- =====================================================
-- This script helps migrate existing files from
-- {uuid}/publications/... to publications/...
-- 
-- NOTE: This is a reference script. Actual file migration
-- should be done via Supabase Storage Admin API or manually
-- =====================================================

-- Step 1: Update publication image_paths in database
-- Remove UUID prefix from paths
UPDATE publications
SET image_path = regexp_replace(
  image_path, 
  '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/', 
  ''
)
WHERE image_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/';

-- Step 2: Update about_content photo_paths in database
UPDATE about_content
SET photo_path = regexp_replace(
  photo_path, 
  '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/', 
  ''
)
WHERE photo_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/';

-- =====================================================
-- FILE MIGRATION (Manual Steps Required)
-- =====================================================
-- 
-- The actual file movement in Supabase Storage must be done:
-- 
-- Option 1: Via Supabase Dashboard
-- 1. Go to Storage → public-assets
-- 2. Navigate to {uuid}/publications/ folders
-- 3. Move files to publications/ folder
-- 4. Delete empty {uuid}/ folders
-- 
-- Option 2: Via Supabase Storage Admin API (Node.js script)
-- See: scripts/migrate-storage-files.js
-- 
-- Option 3: Re-upload files (if few files)
-- 1. Download files from old location
-- 2. Re-upload via admin panel to new location
-- =====================================================

