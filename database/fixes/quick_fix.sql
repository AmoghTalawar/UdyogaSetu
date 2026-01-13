-- Quick fix: Add missing moderation columns to jobs table
-- Run this in your Supabase SQL Editor

-- Add moderation columns if they don't exist
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- Update the status constraint to include new statuses
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
CHECK (status IN ('active', 'paused', 'closed', 'draft', 'pending', 'under_review', 'rejected', 'flagged'));

-- Insert some test jobs for moderation
INSERT INTO jobs (
    title, company_name, company_about, location, job_type, 
    description, requirements, benefits, experience_level, skills, 
    contact_email, company_id, status, priority, 
    kiosk_enabled, total_applications
) VALUES 
(
    'Senior React Developer',
    'Tech Startup Inc',
    'A growing tech company focused on innovative solutions',
    'San Francisco, CA',
    'full-time',
    'We are looking for a senior React developer to join our team.',
    ARRAY['React', 'TypeScript', '3+ years experience'],
    ARRAY['Health insurance', 'Remote work'],
    'senior',
    ARRAY['React', 'TypeScript', 'Node.js'],
    'hr@techstartup.com',
    'test-company-1',
    'pending',
    'normal',
    true,
    0
),
(
    'Marketing Manager',
    'Marketing Solutions LLC',
    'Full-service marketing agency',
    'New York, NY',
    'full-time',
    'Looking for an experienced marketing manager.',
    ARRAY['Marketing degree', '2+ years experience'],
    ARRAY['Health insurance', '401k'],
    'mid',
    ARRAY['Digital Marketing', 'Analytics', 'Content Creation'],
    'jobs@marketingsolutions.com',
    'test-company-2',
    'flagged',
    'high',
    true,
    0
),
(
    'Data Analyst',
    'Data Corp',
    'Data analytics company',
    'Remote',
    'contract',
    'Contract data analyst position.',
    ARRAY['SQL', 'Python', 'Statistics'],
    ARRAY['Flexible hours'],
    'entry',
    ARRAY['SQL', 'Python', 'Excel'],
    'hiring@datacorp.com',
    'test-company-3',
    'under_review',
    'normal',
    false,
    0
);

-- Update flagged job with reason
UPDATE jobs 
SET flagged_reason = 'Potentially misleading requirements'
WHERE status = 'flagged';

-- Update under_review job with notes
UPDATE jobs 
SET moderation_notes = 'Reviewing salary range and requirements'
WHERE status = 'under_review';