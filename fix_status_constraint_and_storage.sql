-- Fix job_applications status constraint and storage issues
-- Run this in your Supabase SQL Editor

-- Step 1: Check what status values are allowed
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'job_applications'::regclass 
AND contype = 'c';

-- Step 2: Drop the existing status check constraint
ALTER TABLE job_applications 
DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Step 3: Add a new, more permissive status check constraint
ALTER TABLE job_applications 
ADD CONSTRAINT job_applications_status_check 
CHECK (status IN (
    'submitted', 
    'under_review', 
    'reviewed', 
    'shortlisted', 
    'interview_scheduled', 
    'interview_completed',
    'approved', 
    'hired',
    'rejected', 
    'withdrawn',
    'new',
    'pending'
));

-- Step 4: Set default status if not already set
ALTER TABLE job_applications 
ALTER COLUMN status SET DEFAULT 'submitted';

-- Step 5: Update any existing records with invalid status
UPDATE job_applications 
SET status = 'submitted' 
WHERE status NOT IN (
    'submitted', 
    'under_review', 
    'reviewed', 
    'shortlisted', 
    'interview_scheduled', 
    'interview_completed',
    'approved', 
    'hired',
    'rejected', 
    'withdrawn',
    'new',
    'pending'
) OR status IS NULL;

-- Step 6: Check if storage bucket allows text/plain files
-- First, let's see current bucket configuration
SELECT name, file_size_limit, allowed_mime_types FROM storage.buckets WHERE name = 'resumes';

-- Step 7: Update bucket to allow text/plain files if needed
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/rtf',
    'image/jpeg',
    'image/png'
] 
WHERE name = 'resumes';

-- Alternative: Remove MIME type restrictions entirely (allow all file types)
-- UPDATE storage.buckets SET allowed_mime_types = NULL WHERE name = 'resumes';

-- Step 8: Verify the changes
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'job_applications' AND column_name = 'status';

-- Step 9: Check bucket configuration
SELECT name, file_size_limit, allowed_mime_types, public FROM storage.buckets WHERE name = 'resumes';

-- Step 10: Test query - this should work now
-- INSERT INTO job_applications (
--     job_id, 
--     applicant_name, 
--     applicant_phone, 
--     application_method, 
--     status
-- ) VALUES (
--     (SELECT id FROM jobs LIMIT 1), 
--     'Test User', 
--     '+1234567890', 
--     'voice', 
--     'submitted'
-- );