-- Fix Company IDs for Jobs
-- This script updates all existing jobs to use the correct company_id
-- Replace 'YOUR_CLERK_USER_ID' with your actual Clerk user ID

-- Step 1: Check current jobs and their company_ids
SELECT id, title, company_id, created_at 
FROM jobs 
ORDER BY created_at DESC;

-- Step 2: Update all jobs to use the correct company_id
-- IMPORTANT: Replace 'user_32YEN1zPK25DszcHomHcC4DYyts' with your actual Clerk user ID
-- The system will convert: user_32YEN1zPK25DszcHomHcC4DYyts → 62c06e3f-0000-4340-86c3-23406c390000

UPDATE jobs 
SET company_id = '62c06e3f-0000-4340-86c3-23406c390000'
WHERE company_id != '62c06e3f-0000-4340-86c3-23406c390000';

-- Step 3: Verify the update
SELECT id, title, company_id, created_at 
FROM jobs 
WHERE company_id = '62c06e3f-0000-4340-86c3-23406c390000'
ORDER BY created_at DESC;

-- Optional: If you want to delete jobs with wrong company_ids instead of updating
-- DELETE FROM jobs WHERE company_id != '62c06e3f-0000-4340-86c3-23406c390000';