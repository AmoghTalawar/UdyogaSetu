-- Fix job_applications table schema for voice applications
-- Run this in your Supabase SQL Editor

-- First, let's check the current structure of job_applications table
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'job_applications';

-- Add missing columns to job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_file_id TEXT,
ADD COLUMN IF NOT EXISTS voice_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS voice_transcript TEXT,
ADD COLUMN IF NOT EXISTS cover_letter TEXT,
ADD COLUMN IF NOT EXISTS kiosk_id TEXT,
ADD COLUMN IF NOT EXISTS submission_location TEXT;

-- Update existing columns if they have wrong types
ALTER TABLE job_applications 
ALTER COLUMN applicant_score TYPE INTEGER USING applicant_score::INTEGER,
ALTER COLUMN applied_at TYPE TIMESTAMP WITH TIME ZONE USING applied_at::TIMESTAMP WITH TIME ZONE,
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at::TIMESTAMP WITH TIME ZONE,
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at::TIMESTAMP WITH TIME ZONE;

-- Add default values for timestamp columns if they don't exist
ALTER TABLE job_applications 
ALTER COLUMN applied_at SET DEFAULT NOW(),
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create or update the function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for job_applications
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Make sure RLS is properly configured (if you haven't run the previous RLS fix)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they work with new columns
DROP POLICY IF EXISTS "job_applications_insert_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_select_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON job_applications;

-- Allow anyone to insert applications (job seekers)
CREATE POLICY "job_applications_insert_policy" ON job_applications
    FOR INSERT 
    WITH CHECK (true);

-- Allow companies to view applications for their jobs
CREATE POLICY "job_applications_select_policy" ON job_applications
    FOR SELECT 
    USING (true);

-- Allow updates for managing application status
CREATE POLICY "job_applications_update_policy" ON job_applications
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON job_applications TO authenticated;
GRANT ALL ON job_applications TO anon;

-- Also ensure the storage bucket exists and has proper policies
-- This needs to be done in Supabase Storage settings, but we can check:
-- SELECT * FROM storage.buckets WHERE name = 'resumes';

-- If the bucket doesn't exist, you need to create it in the Supabase dashboard
-- Go to Storage > Create a new bucket called 'resumes'

-- You'll also need to set up storage policies for the resumes bucket:
-- INSERT policy: Allow authenticated and anonymous users to upload
-- SELECT policy: Allow authenticated users to download their uploads