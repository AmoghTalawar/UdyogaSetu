-- QUICK FIX: Remove all MIME type restrictions from storage bucket
-- Run this in your Supabase SQL Editor

-- Step 1: Remove MIME type restrictions entirely (allow all file types)
UPDATE storage.buckets 
SET allowed_mime_types = NULL 
WHERE name = 'resumes';

-- Step 2: Fix status constraint
ALTER TABLE job_applications 
DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Step 3: Add more permissive status constraint
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

-- Step 4: Set default status
ALTER TABLE job_applications 
ALTER COLUMN status SET DEFAULT 'submitted';

-- Step 5: Verify changes
SELECT name, file_size_limit, allowed_mime_types, public FROM storage.buckets WHERE name = 'resumes';

SELECT column_name, column_default FROM information_schema.columns 
WHERE table_name = 'job_applications' AND column_name = 'status';