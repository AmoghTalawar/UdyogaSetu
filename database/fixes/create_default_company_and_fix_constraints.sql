-- Create default company for unassigned jobs and fix foreign key constraints
-- This script addresses the foreign key constraint violation issue

-- Step 1: Create a default company for unassigned jobs
INSERT INTO companies (id, company_name, contact_email, created_at, updated_at)
VALUES (
    'unassigned',
    'Unassigned Job',
    'admin@udyogsetu.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Drop the existing foreign key constraint if it exists
ALTER TABLE job_applications
DROP CONSTRAINT IF EXISTS job_applications_company_id_fkey;

-- Step 3: Make company_id column nullable (allows NULL values)
ALTER TABLE job_applications
ALTER COLUMN company_id DROP NOT NULL;

-- Step 4: Re-add the foreign key constraint allowing NULL values and our default company
ALTER TABLE job_applications
ADD CONSTRAINT job_applications_company_id_fkey
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Step 5: Verify the changes were applied
SELECT 
    c.id,
    c.company_name,
    c.contact_email,
    'Created/Verified' as status
FROM companies c
WHERE c.id = 'unassigned';

-- Step 6: Check the constraint is properly configured
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE WHEN tc.constraint_type = 'FOREIGN KEY' THEN '✅ Configured correctly' ELSE '❌ Not configured' END as config_status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'job_applications'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%company_id%';

-- Step 7: Check column nullable status
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN is_nullable = 'YES' THEN '✅ NULLs allowed'
        WHEN is_nullable = 'NO' THEN '❌ NULLs not allowed'
        ELSE '❓ Unknown status'
    END as nullable_status
FROM information_schema.columns
WHERE table_name = 'job_applications' 
    AND column_name = 'company_id';

SELECT '✅ Database fix applied successfully! Default company created and constraints updated.' as final_status;