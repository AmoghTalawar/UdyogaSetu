-- COMPLETE FIX FOR VOICE APPLICATION ISSUES
-- Run this in your Supabase SQL Editor

-- Step 1: Fix job_applications table schema
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS resume_file_id TEXT,
ADD COLUMN IF NOT EXISTS voice_language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS voice_transcript TEXT,
ADD COLUMN IF NOT EXISTS cover_letter TEXT,
ADD COLUMN IF NOT EXISTS kiosk_id TEXT,
ADD COLUMN IF NOT EXISTS submission_location TEXT;

-- Step 2: Ensure correct data types for existing columns
ALTER TABLE job_applications 
ALTER COLUMN applicant_score TYPE INTEGER USING applicant_score::INTEGER,
ALTER COLUMN applied_at TYPE TIMESTAMP WITH TIME ZONE USING applied_at::TIMESTAMP WITH TIME ZONE,
ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at::TIMESTAMP WITH TIME ZONE,
ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at::TIMESTAMP WITH TIME ZONE;

-- Step 3: Add default values for timestamp columns
ALTER TABLE job_applications 
ALTER COLUMN applied_at SET DEFAULT NOW(),
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Step 4: Create function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Configure Row Level Security
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop and recreate RLS policies
DROP POLICY IF EXISTS "job_applications_insert_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_select_policy" ON job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON job_applications;

-- Step 8: Create permissive RLS policies
CREATE POLICY "job_applications_insert_policy" ON job_applications
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "job_applications_select_policy" ON job_applications
    FOR SELECT 
    USING (true);

CREATE POLICY "job_applications_update_policy" ON job_applications
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Step 9: Grant necessary permissions
GRANT ALL ON job_applications TO authenticated;
GRANT ALL ON job_applications TO anon;

-- Step 10: Also fix the applications table if it exists (legacy)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'applications') THEN
        ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "applications_insert_policy" ON applications;
        DROP POLICY IF EXISTS "applications_select_policy" ON applications;
        
        CREATE POLICY "applications_insert_policy" ON applications
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "applications_select_policy" ON applications
            FOR SELECT USING (true);
            
        GRANT ALL ON applications TO authenticated;
        GRANT ALL ON applications TO anon;
    END IF;
END $$;

-- Step 11: Fix uploaded_files table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'uploaded_files') THEN
        ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "uploaded_files_insert_policy" ON uploaded_files;
        DROP POLICY IF EXISTS "uploaded_files_select_policy" ON uploaded_files;
        
        CREATE POLICY "uploaded_files_insert_policy" ON uploaded_files
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "uploaded_files_select_policy" ON uploaded_files
            FOR SELECT USING (true);
            
        GRANT ALL ON uploaded_files TO authenticated;
        GRANT ALL ON uploaded_files TO anon;
    END IF;
END $$;

-- Step 12: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'job_applications'
ORDER BY ordinal_position;

-- Step 13: Check if resumes storage bucket exists
SELECT name, public FROM storage.buckets WHERE name = 'resumes';

-- Instructions for Storage Bucket Setup (if needed):
-- If the above query returns no results, you need to:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a new bucket called 'resumes'
-- 3. Set it as public if you want direct access to resume files
-- 4. Configure storage policies:
--    - INSERT: Allow authenticated and anonymous users
--    - SELECT: Allow authenticated users
--    - UPDATE/DELETE: Restrict as needed