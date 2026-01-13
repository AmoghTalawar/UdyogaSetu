-- ===============================================
-- CREATE VIDEOS BUCKET - SIMPLE VERSION
-- ===============================================

-- This is a simplified script to create the videos bucket
-- Run this in your Supabase SQL Editor

-- Create the videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
)
ON CONFLICT (id) DO NOTHING;

-- Check if it was created
SELECT
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets
WHERE id = 'videos';

-- If the above doesn't work due to permissions, you'll need to create it manually in the dashboard