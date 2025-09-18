-- Fix for status updates not working
-- Run this in your Supabase SQL Editor

-- First, let's see current applications and their statuses
SELECT id, applicant_name, status, reviewer_notes, updated_at 
FROM applications 
ORDER BY created_at DESC;

-- Check what RLS policies exist on applications table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'applications';

-- Let's try manually updating one application status to test
UPDATE applications 
SET 
    status = 'reviewed',
    reviewer_notes = 'Manually updated for testing',
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE applicant_name = 'ALan'
AND status = 'submitted';

-- Verify the update worked
SELECT id, applicant_name, status, reviewer_notes, updated_at 
FROM applications 
WHERE applicant_name = 'ALan';

-- If the above worked, let's ensure the application service can make updates
-- by temporarily disabling RLS (be careful with this in production!)
-- ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Or, create a more permissive policy for updates:
DROP POLICY IF EXISTS "applications_update_policy" ON applications;
CREATE POLICY "applications_update_policy" ON applications
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Test statistics calculation
SELECT 
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
    COUNT(*) FILTER (WHERE status = 'interview_scheduled') as interview_scheduled,
    COUNT(*) FILTER (WHERE status = 'hired') as hired,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected
FROM applications a
JOIN jobs j ON a.job_id = j.id
WHERE j.company_id = '62c06e3f-0000-4340-86c3-23406c390000';

-- Show all status values currently in the database
SELECT DISTINCT status FROM applications;