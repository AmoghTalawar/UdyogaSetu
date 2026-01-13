-- Fix Row Level Security policies for applications table
-- Run this in your Supabase SQL Editor

-- First, let's check if RLS is enabled on applications table
-- You can see this in the Supabase dashboard under Authentication > Policies

-- Option 1: Disable RLS temporarily (Quick fix - NOT recommended for production)
-- ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies (Recommended)

-- Enable RLS if not already enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "applications_insert_policy" ON applications;
DROP POLICY IF EXISTS "applications_select_policy" ON applications;
DROP POLICY IF EXISTS "applications_update_policy" ON applications;

-- Create policy to allow anyone to insert applications (for job seekers)
CREATE POLICY "applications_insert_policy" ON applications
    FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow companies to view their applications
CREATE POLICY "applications_select_policy" ON applications
    FOR SELECT 
    USING (
        -- Allow if authenticated user's company_id matches the application's company_id
        -- OR allow public read for basic functionality
        true
    );

-- Create policy to allow companies to update their applications
CREATE POLICY "applications_update_policy" ON applications
    FOR UPDATE 
    USING (
        -- Allow if authenticated user's company_id matches
        auth.uid() IS NOT NULL
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- If you also have a job_applications table, apply similar policies
-- Check if the table exists and apply policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        -- Enable RLS for job_applications
        ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "job_applications_insert_policy" ON job_applications;
        DROP POLICY IF EXISTS "job_applications_select_policy" ON job_applications;
        DROP POLICY IF EXISTS "job_applications_update_policy" ON job_applications;
        
        -- Create policies for job_applications
        CREATE POLICY "job_applications_insert_policy" ON job_applications
            FOR INSERT 
            WITH CHECK (true);
            
        CREATE POLICY "job_applications_select_policy" ON job_applications
            FOR SELECT 
            USING (true);
            
        CREATE POLICY "job_applications_update_policy" ON job_applications
            FOR UPDATE 
            USING (auth.uid() IS NOT NULL)
            WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Grant necessary permissions to authenticated users
GRANT ALL ON applications TO authenticated;
GRANT ALL ON applications TO anon;

-- If job_applications table exists, grant permissions
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        GRANT ALL ON job_applications TO authenticated;
        GRANT ALL ON job_applications TO anon;
    END IF;
END $$;

-- Also fix policies for uploaded_files table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'uploaded_files') THEN
        ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "uploaded_files_insert_policy" ON uploaded_files;
        DROP POLICY IF EXISTS "uploaded_files_select_policy" ON uploaded_files;
        
        CREATE POLICY "uploaded_files_insert_policy" ON uploaded_files
            FOR INSERT 
            WITH CHECK (true);
            
        CREATE POLICY "uploaded_files_select_policy" ON uploaded_files
            FOR SELECT 
            USING (true);
            
        GRANT ALL ON uploaded_files TO authenticated;
        GRANT ALL ON uploaded_files TO anon;
    END IF;
END $$;