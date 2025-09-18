-- Add missing company fields to the jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_about TEXT;

-- Update any existing jobs to have default company info if they don't have it
UPDATE jobs 
SET 
  company_name = COALESCE(company_name, 'Company Name'),
  company_about = COALESCE(company_about, 'Company description not provided')
WHERE company_name IS NULL OR company_about IS NULL;

-- Optional: Make company_name required for new rows
-- ALTER TABLE jobs ALTER COLUMN company_name SET NOT NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name IN ('company_name', 'company_about');