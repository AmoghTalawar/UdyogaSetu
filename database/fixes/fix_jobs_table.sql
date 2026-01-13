-- Add missing company columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_about TEXT;

-- Check what constraints exist on the jobs table
SELECT constraint_name, constraint_type, check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'jobs';

-- If there's a problematic check constraint, we might need to drop and recreate it
-- First, let's see what columns exist in the jobs table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- Update existing jobs to have default values for the new columns
UPDATE jobs 
SET 
  company_name = COALESCE(company_name, 'Company Name'),
  company_about = COALESCE(company_about, 'Company description')
WHERE company_name IS NULL OR company_about IS NULL;

-- Show sample of updated data
SELECT id, title, company_name, company_about, company_id 
FROM jobs 
LIMIT 3;