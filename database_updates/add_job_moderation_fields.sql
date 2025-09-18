-- Add moderation fields to jobs table
-- Run this in your Supabase SQL Editor to add the new moderation functionality

-- Add new columns for job moderation
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by TEXT,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Update status column to include new moderation statuses
-- First, create a new type with all statuses
DO $$ BEGIN
    -- Drop the constraint temporarily
    ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
    
    -- Add the new constraint with additional statuses
    ALTER TABLE jobs ADD CONSTRAINT jobs_status_check 
    CHECK (status IN ('active', 'paused', 'closed', 'draft', 'pending', 'under_review', 'rejected', 'flagged'));
    
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status_priority ON jobs(status, priority);
CREATE INDEX IF NOT EXISTS idx_jobs_moderated_at ON jobs(moderated_at);
CREATE INDEX IF NOT EXISTS idx_jobs_moderated_by ON jobs(moderated_by);

-- Add trigger to automatically set moderated_at when status changes to active or rejected
CREATE OR REPLACE FUNCTION update_moderated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is changing to active or rejected, set moderated_at if not already set
    IF NEW.status IN ('active', 'rejected') AND OLD.status != NEW.status THEN
        IF NEW.moderated_at IS NULL THEN
            NEW.moderated_at = NOW();
        END IF;
    END IF;
    
    -- Update the updated_at timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_moderated_at ON jobs;
CREATE TRIGGER trigger_update_moderated_at
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_moderated_at();

-- Add RLS policies for job moderation (adjust these based on your admin user setup)
-- Note: You'll need to modify these policies based on your authentication setup

-- Policy for admins to view all jobs
CREATE POLICY IF NOT EXISTS "Admins can view all jobs for moderation" 
ON jobs FOR SELECT 
USING (
    -- Replace this condition with your admin user identification logic
    auth.jwt() ->> 'role' = 'admin' 
    OR 
    auth.jwt() ->> 'email' IN ('admin@yourdomain.com') -- Replace with actual admin emails
);

-- Policy for admins to update jobs for moderation
CREATE POLICY IF NOT EXISTS "Admins can update jobs for moderation" 
ON jobs FOR UPDATE 
USING (
    -- Replace this condition with your admin user identification logic
    auth.jwt() ->> 'role' = 'admin' 
    OR 
    auth.jwt() ->> 'email' IN ('admin@yourdomain.com') -- Replace with actual admin emails
);

-- Function to get moderation statistics
CREATE OR REPLACE FUNCTION get_job_moderation_stats()
RETURNS TABLE (
    total_jobs bigint,
    pending_jobs bigint,
    under_review_jobs bigint,
    flagged_jobs bigint,
    approved_today bigint,
    rejected_today bigint,
    avg_review_time_hours numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH job_stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
            COUNT(CASE WHEN status = 'flagged' THEN 1 END) as flagged,
            COUNT(CASE WHEN status = 'active' AND moderated_at::date = CURRENT_DATE THEN 1 END) as approved_today,
            COUNT(CASE WHEN status = 'rejected' AND moderated_at::date = CURRENT_DATE THEN 1 END) as rejected_today,
            COALESCE(
                AVG(
                    CASE 
                        WHEN moderated_at IS NOT NULL AND status IN ('active', 'rejected')
                        THEN EXTRACT(EPOCH FROM (moderated_at - created_at)) / 3600.0 
                    END
                ), 0
            ) as avg_review_hours
        FROM jobs
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' -- Only consider jobs from last 30 days
    )
    SELECT 
        total,
        pending,
        under_review,
        flagged,
        approved_today,
        rejected_today,
        ROUND(avg_review_hours, 1)
    FROM job_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (adjust as needed)
GRANT EXECUTE ON FUNCTION get_job_moderation_stats() TO authenticated;

-- Sample data update (optional - uncomment to add some test data)
/*
UPDATE jobs 
SET status = 'pending', priority = 'normal' 
WHERE status = 'draft' 
LIMIT 5;

UPDATE jobs 
SET status = 'flagged', 
    flagged_reason = 'Potentially misleading job requirements',
    priority = 'high'
WHERE id IN (
    SELECT id FROM jobs 
    WHERE status = 'pending' 
    LIMIT 2
);
*/