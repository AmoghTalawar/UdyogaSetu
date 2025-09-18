-- Fix for Job Applications not showing in dashboard
-- This creates a company record that matches the existing jobs

-- First, let's see what company_id exists in the jobs table
-- Copy and paste this in your Supabase SQL Editor

-- Step 1: Create a company record with the existing company_id
INSERT INTO companies (
    id, 
    clerk_user_id, 
    company_name, 
    company_email, 
    company_description, 
    industry, 
    company_size, 
    location
) VALUES (
    '62c06e3f-0000-4340-86c3-23406c390000',  -- This matches your jobs
    'your_current_clerk_user_id_here',       -- Replace with your actual Clerk user ID
    'Your Company Name',
    'contact@yourcompany.com',
    'Your company description here',
    'Technology',
    '11-50',
    'Remote'
) ON CONFLICT (id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    updated_at = NOW();

-- Step 2: Verify the fix by checking if applications can now be found
SELECT 
    a.applicant_name,
    a.applicant_email,
    a.status,
    j.title as job_title,
    j.company_id,
    c.company_name
FROM applications a
JOIN jobs j ON a.job_id = j.id
LEFT JOIN companies c ON j.company_id = c.id
WHERE j.company_id = '62c06e3f-0000-4340-86c3-23406c390000'
ORDER BY a.created_at DESC;

-- If you see results above, your applications should now show in the dashboard!