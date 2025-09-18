-- QUICK FIX: Disable RLS temporarily (NOT recommended for production)
-- Run this in your Supabase SQL Editor if you want a quick solution

-- Disable RLS for applications table
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Disable RLS for job_applications table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Disable RLS for uploaded_files table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'uploaded_files') THEN
        ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Note: This approach disables security completely on these tables
-- Use only for development/testing purposes
-- For production, use the proper RLS policies from fix_applications_rls.sql