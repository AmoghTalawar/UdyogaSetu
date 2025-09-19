-- Fix mobile upload constraint issues
-- This script modifies the job_applications table to allow NULL values for mobile uploads

-- First, drop the foreign key constraint if it exists
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_job_id_fkey;

-- Modify job_id column to allow NULL values
ALTER TABLE job_applications ALTER COLUMN job_id DROP NOT NULL;

-- Modify company_id column to allow NULL values for mobile uploads
ALTER TABLE job_applications ALTER COLUMN company_id DROP NOT NULL;

-- Update the check constraint to allow 'mobile' as an application method
-- First drop the existing constraint
ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_application_method_check;

-- Add new check constraint that includes 'mobile' method
ALTER TABLE job_applications ADD CONSTRAINT job_applications_application_method_check
CHECK (application_method IN ('qr', 'voice', 'mobile'));

-- Update existing mobile upload records to use 'mobile' method
UPDATE job_applications SET application_method = 'mobile' WHERE application_method = 'qr_mobile';

-- Add comments to explain the changes
COMMENT ON COLUMN job_applications.job_id IS 'Job ID for job-specific applications, NULL for general mobile uploads';
COMMENT ON COLUMN job_applications.company_id IS 'Company ID for job-specific applications, NULL for general mobile uploads';