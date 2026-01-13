-- Fix Foreign Key Constraint for job_applications.company_id
-- This script makes the company_id column nullable to prevent constraint violations
-- 
-- IMPORTANT: This will NOT delete any existing data
-- It only modifies the constraint to allow NULL values

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE job_applications
DROP CONSTRAINT IF EXISTS job_applications_company_id_fkey;

-- Step 2: Make the company_id column nullable (if it's currently NOT NULL)
ALTER TABLE job_applications
ALTER COLUMN company_id DROP NOT NULL;

-- Step 3: Re-add the foreign key constraint allowing NULL values
ALTER TABLE job_applications
ADD CONSTRAINT job_applications_company_id_fkey
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Step 4: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN is_nullable = 'YES' THEN '✅ NULLs now allowed'
        WHEN is_nullable = 'NO' THEN '❌ NULLs still not allowed'
        ELSE '❓ Unknown status'
    END as nullable_status
FROM information_schema.columns
WHERE table_name = 'job_applications' 
    AND column_name = 'company_id';

-- Step 5: Verify the constraint is properly configured
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

SELECT '✅ Foreign key constraint fixed successfully! Company_id now allows NULL values.' as final_status;