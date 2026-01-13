-- Fix job_applications company_id foreign key constraint
-- This script makes company_id nullable to allow applications when company_id cannot be determined

-- Step 1: Drop the existing foreign key constraint if it exists
ALTER TABLE job_applications
DROP CONSTRAINT IF EXISTS job_applications_company_id_fkey;

-- Step 2: Make company_id column nullable
ALTER TABLE job_applications
ALTER COLUMN company_id DROP NOT NULL;

-- Step 3: Re-add the foreign key constraint allowing NULL values
ALTER TABLE job_applications
ADD CONSTRAINT job_applications_company_id_fkey
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Step 4: Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'job_applications' AND column_name = 'company_id';

-- Step 5: Check the constraint
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
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

SELECT '✅ job_applications company_id constraint fixed successfully!' as status;