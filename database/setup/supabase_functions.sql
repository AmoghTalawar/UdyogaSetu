-- Create missing RPC function for getting company application stats
CREATE OR REPLACE FUNCTION get_company_application_stats(company_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- If job_applications table doesn't exist, return empty stats
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_applications') THEN
        RETURN '{
            "total_applications": 0,
            "new_applications": 0,
            "reviewed_applications": 0,
            "interview_applications": 0,
            "hired_applications": 0,
            "rejected_applications": 0,
            "applications_this_week": 0,
            "applications_this_month": 0
        }'::JSON;
    END IF;
    
    -- If applications table exists but has no data for this company, return zeros
    IF NOT EXISTS (
        SELECT 1 FROM job_applications ja
        JOIN jobs j ON ja.job_id = j.id
        WHERE j.company_id = company_uuid
    ) THEN
        RETURN '{
            "total_applications": 0,
            "new_applications": 0,
            "reviewed_applications": 0,
            "interview_applications": 0,
            "hired_applications": 0,
            "rejected_applications": 0,
            "applications_this_week": 0,
            "applications_this_month": 0
        }'::JSON;
    END IF;

    -- Calculate actual stats
    SELECT json_build_object(
        'total_applications', COUNT(*),
        'new_applications', COUNT(*) FILTER (WHERE ja.status = 'new'),
        'reviewed_applications', COUNT(*) FILTER (WHERE ja.status = 'reviewed'),
        'interview_applications', COUNT(*) FILTER (WHERE ja.status = 'interview'),
        'hired_applications', COUNT(*) FILTER (WHERE ja.status = 'hired'),
        'rejected_applications', COUNT(*) FILTER (WHERE ja.status = 'rejected'),
        'applications_this_week', COUNT(*) FILTER (WHERE ja.applied_at >= NOW() - INTERVAL '7 days'),
        'applications_this_month', COUNT(*) FILTER (WHERE ja.applied_at >= NOW() - INTERVAL '30 days')
    ) INTO result
    FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE j.company_id = company_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_company_application_stats(UUID) TO anon, authenticated;

-- Create a simple function to test if job_applications table exists
CREATE OR REPLACE FUNCTION check_applications_table_exists()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'job_applications'
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION check_applications_table_exists() TO anon, authenticated;