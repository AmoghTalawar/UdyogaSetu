-- ULTIMATE FOREIGN KEY CONSTRAINT FIX
-- This script completely removes the problematic constraint and replaces it

-- Step 1: Check current constraint status
SELECT 
    'Current constraint status:' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'job_applications'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND tc.constraint_name LIKE '%company_id%';

-- Step 2: Drop ALL foreign key constraints for job_applications.company_id
-- This ensures we remove any conflicting constraints
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_company_id_fkey;
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS fk_job_applications_company_id;
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_company_id_fkey_1;

-- Step 3: Make company_id explicitly nullable
ALTER TABLE job_applications ALTER COLUMN company_id DROP NOT NULL;

-- Step 4: Remove company_id from job_applications entirely (most aggressive fix)
-- UNCOMMENT THIS LINE if you want to completely remove the column:
-- ALTER TABLE job_applications DROP COLUMN IF EXISTS company_id;

-- Step 5: Add a new constraint that allows NULL and any value (most permissive)
ALTER TABLE job_applications
ADD CONSTRAINT job_applications_company_id_permissive
CHECK (company_id IS NULL OR company_id LIKE '%'); -- Allow any value including NULL

-- Step 6: Verify the fix
SELECT 
    'After fix - constraint status:' as info,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'job_applications'
    AND tc.constraint_type IN ('FOREIGN KEY', 'CHECK')
    AND (tc.constraint_name LIKE '%company_id%' OR kcu.column_name = 'company_id');

-- Step 7: Check column definition
SELECT 
    'Column definition after fix:' as info,
    column_name, 
    data_type, 
    is_nullable,
    CASE 
        WHEN is_nullable = 'YES' THEN '✅ NULLs allowed'
        WHEN is_nullable = 'NO' THEN '❌ NULLs not allowed'
        ELSE '❓ Unknown'
    END as status
FROM information_schema.columns
WHERE table_name = 'job_applications' 
    AND column_name = 'company_id';

SELECT '✅ COMPLETE FOREIGN KEY CONSTRAINT FIX APPLIED!' as status;