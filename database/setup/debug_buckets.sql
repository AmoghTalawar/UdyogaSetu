-- ===============================================
-- DEBUG: Check Current Storage Buckets
-- ===============================================

-- Run this in your Supabase SQL Editor to see what buckets exist

-- List all storage buckets
SELECT
  id,
  name,
  public,
  created_at,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_types_count,
  allowed_mime_types
FROM storage.buckets
ORDER BY created_at DESC;

-- Check if videos bucket exists specifically
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'videos') THEN '✅ Videos bucket exists'
    ELSE '❌ Videos bucket does not exist'
  END as videos_bucket_status;

-- Show bucket policies (if any)
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
ORDER BY policyname;

-- If videos bucket exists, show its details
SELECT * FROM storage.buckets WHERE name = 'videos';