-- ===============================================
-- VERIFY VIDEO STORAGE SETUP
-- ===============================================

-- Run these queries in your Supabase SQL Editor to verify the setup

-- 1. Check if videos bucket exists
SELECT
  id,
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets
WHERE id = 'videos';

-- 2. Check storage policies for videos bucket
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'objects'
  AND (policyname LIKE '%video%' OR qual LIKE '%videos%');

-- 3. Check if RLS is enabled on storage.objects
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'storage'
  AND tablename = 'objects';

-- 4. Test bucket access (should return the bucket if it exists)
SELECT * FROM storage.buckets WHERE name = 'videos';

-- ===============================================
-- EXPECTED RESULTS
-- ===============================================

-- Query 1 should return:
-- id: videos
-- name: videos
-- public: true
-- file_size_limit: 52428800 (or your configured limit)

-- Query 2 should return policies like:
-- "Allow video uploads", "Allow video downloads", etc.

-- Query 3 should return:
-- rowsecurity: true

-- If any of these queries don't return the expected results,
-- please check your Supabase Dashboard Storage settings.