-- Create job_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id VARCHAR NOT NULL,
    applicant_name VARCHAR NOT NULL,
    applicant_email VARCHAR,
    applicant_phone VARCHAR NOT NULL,
    application_method VARCHAR NOT NULL CHECK (application_method IN ('qr', 'voice')),
    resume_url TEXT,
    resume_file_id VARCHAR,
    voice_language VARCHAR,
    voice_transcript TEXT,
    status VARCHAR DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'interview', 'hired', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional fields for better tracking
    applicant_score INTEGER, -- AI-generated score based on resume/voice analysis
    interviewer_notes TEXT,
    interview_scheduled_at TIMESTAMP WITH TIME ZONE,
    company_id VARCHAR -- To link with the company that posted the job
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON job_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policy for companies to see only their applications
CREATE POLICY "Companies can view their own job applications" ON job_applications
    FOR SELECT USING (company_id = auth.uid()::text);

-- Create policy for inserting applications (public can apply)
CREATE POLICY "Anyone can submit job applications" ON job_applications
    FOR INSERT WITH CHECK (true);

-- Create policy for companies to update application status
CREATE POLICY "Companies can update their job applications" ON job_applications
    FOR UPDATE USING (company_id = auth.uid()::text);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_applications_updated_at 
    BEFORE UPDATE ON job_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get application statistics for companies
CREATE OR REPLACE FUNCTION get_company_application_stats(company_uuid TEXT)
RETURNS TABLE(
    total_applications BIGINT,
    new_applications BIGINT,
    reviewed_applications BIGINT,
    interview_applications BIGINT,
    hired_applications BIGINT,
    rejected_applications BIGINT,
    applications_this_week BIGINT,
    applications_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_applications,
        COUNT(*) FILTER (WHERE status = 'submitted') as new_applications,
        COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_applications,
        COUNT(*) FILTER (WHERE status = 'interview') as interview_applications,
        COUNT(*) FILTER (WHERE status = 'hired') as hired_applications,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications,
        COUNT(*) FILTER (WHERE applied_at >= NOW() - INTERVAL '7 days') as applications_this_week,
        COUNT(*) FILTER (WHERE applied_at >= NOW() - INTERVAL '30 days') as applications_this_month
    FROM job_applications 
    WHERE company_id = company_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;