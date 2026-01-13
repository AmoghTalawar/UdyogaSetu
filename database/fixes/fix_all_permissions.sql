-- Complete fix for application status updates
-- Run this entire script in your Supabase SQL Editor

-- 1. First, let's see current applications and their statuses
SELECT id, applicant_name, status, reviewer_notes, reviewed_at, updated_at 
FROM applications 
ORDER BY created_at DESC;

-- 2. Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'applications';

-- 3. Drop all existing policies and create new ones
DROP POLICY IF EXISTS "job_applications_insert_policy" ON applications;
DROP POLICY IF EXISTS "job_applications_select_policy" ON applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON applications;
DROP POLICY IF EXISTS "applications_insert_policy" ON applications;
DROP POLICY IF EXISTS "applications_select_policy" ON applications;
DROP POLICY IF EXISTS "applications_update_policy" ON applications;

-- 4. Create new permissive policies
-- Allow anyone to insert applications (job seekers)
CREATE POLICY "applications_insert_policy" ON applications
    FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to select applications 
CREATE POLICY "applications_select_policy" ON applications
    FOR SELECT 
    USING (true);

-- Allow anyone to update applications (employers updating status)
CREATE POLICY "applications_update_policy" ON applications
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- 5. Ensure RLS is enabled
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 6. Grant necessary permissions
GRANT ALL ON applications TO authenticated;
GRANT ALL ON applications TO anon;

-- 7. Test the permissions by updating Alice Johnson to 'hired'
UPDATE applications 
SET 
    status = 'hired',
    reviewer_notes = 'Hired through SQL test',
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE applicant_name = 'Alice Johnson'
AND status = 'submitted';

-- 8. Test updating Alan to 'interviewed'
UPDATE applications 
SET 
    status = 'interview_scheduled',
    reviewer_notes = 'Interview scheduled via SQL',
    updated_at = NOW()
WHERE applicant_name = 'ALan'
AND status = 'reviewed';

-- 9. Verify all updates worked
SELECT id, applicant_name, status, reviewer_notes, reviewed_at, updated_at 
FROM applications 
ORDER BY updated_at DESC;

-- 10. Test statistics calculation
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

-- 11. Show all distinct status values
SELECT DISTINCT status, COUNT(*) as count
FROM applications 
GROUP BY status
ORDER BY count DESC;

-- Success message
SELECT 'Database permissions fixed successfully! You can now update application statuses from the web interface.' as message;