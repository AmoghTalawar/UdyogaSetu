-- URGENT: Run this SQL in your Supabase SQL Editor to fix job posting issues

-- First, let's see what constraints exist that might be causing issues
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'jobs'::regclass;

-- Add the missing columns if they don't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_about TEXT;

-- Check if there's a problematic check constraint and drop it if needed
-- (This is likely the "jobs_check" constraint causing the issue)
DO $$
BEGIN
    -- Drop the problematic check constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_check') THEN
        ALTER TABLE jobs DROP CONSTRAINT jobs_check;
        RAISE NOTICE 'Dropped problematic jobs_check constraint';
    END IF;
END$$;

-- Update any existing rows to have default values for the new columns
UPDATE jobs 
SET 
  company_name = COALESCE(company_name, 'Company Name'),
  company_about = COALESCE(company_about, 'Company description')
WHERE company_name IS NULL OR company_about IS NULL;

-- Add proper constraints that make sense
ALTER TABLE jobs 
ADD CONSTRAINT jobs_title_not_empty CHECK (char_length(trim(title)) > 0),
ADD CONSTRAINT jobs_location_not_empty CHECK (char_length(trim(location)) > 0),
ADD CONSTRAINT jobs_company_name_not_empty CHECK (char_length(trim(company_name)) > 0),
ADD CONSTRAINT jobs_status_valid CHECK (status IN ('active', 'draft', 'closed', 'pending')),
ADD CONSTRAINT jobs_salary_positive CHECK (
  (salary_min IS NULL OR salary_min >= 0) AND 
  (salary_max IS NULL OR salary_max >= 0) AND
  (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- Show current constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'jobs'::regclass
ORDER BY conname;