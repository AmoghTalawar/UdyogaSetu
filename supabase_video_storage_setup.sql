-- ===============================================
-- SUPABASE STORAGE SETUP FOR VIDEO UPLOADS
-- MANUAL SETUP INSTRUCTIONS (Dashboard Method)
-- ===============================================

-- NOTE: This script contains manual instructions because direct SQL
-- manipulation of storage.objects requires database owner permissions.
-- Please follow these steps in your Supabase Dashboard instead:

-- ===============================================
-- STEP 1: CREATE THE VIDEOS BUCKET
-- ===============================================

-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Storage in the left sidebar
-- 3. Click "Create bucket"
-- 4. Set the following:
--    - Name: videos
--    - Public bucket: ✅ Check this box
--    - File size limit: 50 MB
--    - Allowed MIME types: video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime

-- ===============================================
-- STEP 2: CONFIGURE STORAGE POLICIES
-- ===============================================

-- After creating the bucket:

-- 1. Go to Storage > Policies
-- 2. Find the "videos" bucket
-- 3. Click "New Policy" for each of the following:

-- POLICY 1: Allow Video Uploads
-- - Policy name: Allow video uploads
-- - Operation: INSERT
-- - Target roles: authenticated, anon
-- - Policy definition:
--   true

-- POLICY 2: Allow Video Downloads
-- - Policy name: Allow video downloads
-- - Operation: SELECT
-- - Target roles: authenticated, anon
-- - Policy definition:
--   true

-- POLICY 3: Allow Video Updates (Optional)
-- - Policy name: Allow video updates
-- - Operation: UPDATE
-- - Target roles: authenticated
-- - Policy definition:
--   true

-- POLICY 4: Allow Video Deletions (Optional)
-- - Policy name: Allow video deletions
-- - Operation: DELETE
-- - Target roles: authenticated
-- - Policy definition:
--   true

-- ===============================================
-- VERIFICATION QUERIES (Run these in SQL Editor)
-- ===============================================

-- Check if videos bucket exists
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'videos';

-- Check storage policies for videos
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%video%';

-- Check bucket configuration
SELECT * FROM storage.buckets WHERE id = 'videos';

-- ===============================================
-- ALTERNATIVE: AUTOMATED SETUP (if you have owner access)
-- ===============================================

-- If you have database owner permissions, you can run this instead:
/*
-- Create the videos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  52428800,
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage policies for videos bucket
CREATE POLICY "Allow video uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow video downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');

CREATE POLICY "Allow video updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');

CREATE POLICY "Allow video deletions" ON storage.objects
  FOR DELETE USING (bucket_id = 'videos' AND auth.role() = 'authenticated');
*/

SELECT 'Please follow the manual setup instructions above in your Supabase Dashboard.' as status;