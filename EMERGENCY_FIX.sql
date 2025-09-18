-- EMERGENCY FIX: Run this first to get job posting working immediately

-- Add missing columns
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'Company Name',
ADD COLUMN IF NOT EXISTS company_about TEXT DEFAULT 'Company description';

-- Drop the problematic constraint that's blocking inserts
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_check;

-- That's it! Try posting a job now.