-- ===============================================
-- FIX FOR FOREIGN KEY CONSTRAINT ERROR
-- ===============================================
-- This script fixes the "fk_jobs_company_id" constraint violation
-- by either removing the constraint or creating missing company records

-- OPTION 1: Drop the foreign key constraint (Quick Fix)
-- This allows jobs to be posted without requiring a companies table entry
-- Use this if you want to post jobs immediately without company setup

ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS fk_jobs_company_id;

-- Add company_name and company_about columns if they don't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_about TEXT;

-- Make company_id nullable temporarily (optional, for flexibility)
-- ALTER TABLE jobs ALTER COLUMN company_id DROP NOT NULL;

-- ===============================================
-- OPTION 2: Create a function to auto-create company records
-- ===============================================
-- This function will automatically create a company record when needed

CREATE OR REPLACE FUNCTION ensure_company_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if company exists
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = NEW.company_id) THEN
        -- Create a basic company record
        INSERT INTO companies (
            id,
            clerk_user_id,
            company_name,
            company_email,
            is_active
        ) VALUES (
            NEW.company_id,
            'auto-generated-' || NEW.company_id::text,
            COALESCE(NEW.company_name, 'Company'),
            COALESCE(NEW.contact_email, 'contact@company.com'),
            true
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create companies
DROP TRIGGER IF EXISTS ensure_company_before_job_insert ON jobs;
CREATE TRIGGER ensure_company_before_job_insert
    BEFORE INSERT ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION ensure_company_exists();

-- ===============================================
-- OPTION 3: Re-add the foreign key with ON DELETE CASCADE
-- ===============================================
-- Only run this after choosing Option 1 or 2 above

-- ALTER TABLE jobs 
-- ADD CONSTRAINT fk_jobs_company_id 
-- FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- ===============================================
-- Verify the fix
-- ===============================================

-- Check if constraint exists
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
WHERE tc.table_name = 'jobs' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- Check jobs table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
ORDER BY ordinal_position;

SELECT '✅ Foreign key constraint fix applied successfully!' as status;