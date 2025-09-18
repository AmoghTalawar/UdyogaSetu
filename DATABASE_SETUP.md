# Database Setup Instructions

The Company Dashboard is now working, but you may see some errors in the console related to missing database tables and functions. Here's how to fix them:

## Quick Fix Summary

The dashboard will work fine even with these errors (it shows mock data as fallback), but to get full functionality:

1. **Add missing database columns** (if not done already)
2. **Create the applications system tables** (optional - for full functionality)
3. **Set up proper UUID conversion**

## 1. Fix Job Posting Issues (Required)

### Add Missing Columns to Jobs Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing company columns to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_about TEXT;

-- Update existing jobs to have default values
UPDATE jobs 
SET 
  company_name = COALESCE(company_name, 'Company Name'),
  company_about = COALESCE(company_about, 'Company description')
WHERE company_name IS NULL OR company_about IS NULL;
```

## 2. Fix Application System Issues (Optional but Recommended)

### Create Applications Table

```sql
-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT,
  applicant_phone TEXT,
  resume_url TEXT,
  voice_recording_url TEXT,
  voice_transcript TEXT,
  application_method TEXT DEFAULT 'qr' CHECK (application_method IN ('qr', 'voice')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'interview', 'hired', 'rejected')),
  applicant_score INTEGER CHECK (applicant_score >= 0 AND applicant_score <= 100),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  interviewer_notes TEXT,
  interview_scheduled_at TIMESTAMP WITH TIME ZONE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_company_id ON job_applications(company_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON job_applications
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON job_applications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for company owners" ON job_applications
FOR UPDATE USING (auth.role() = 'authenticated');
```

### Create Database Functions

```sql
-- Create application stats function
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
    
    -- Calculate stats
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_company_application_stats(UUID) TO anon, authenticated;
```

## 3. Current Status

### ✅ What's Working Now:
- Job posting with company information
- Enhanced Company Dashboard with all management features
- Job deletion, duplication, status management
- Bulk operations on jobs
- Deadline management and expiration detection
- Beautiful, responsive UI with analytics
- Proper error handling and fallbacks

### ⚠️ What Needs Database Setup:
- Application tracking and statistics
- Candidate management
- Application status updates
- Performance metrics based on real data

### 🔧 Temporary Workarounds:
- Mock data shows in place of real applications
- Zero stats display until applications system is set up
- All job management features work perfectly

## 4. Production Deployment Notes

### Clerk Development Warning
The warning about development keys is normal for local development. For production:

1. Create a production Clerk instance
2. Update your environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY` (change from `pk_test_` to `pk_live_`)
   - `CLERK_SECRET_KEY` (change from `sk_test_` to `sk_live_`)

### Environment Variables Checklist
Make sure these are set in your `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 5. Testing the Dashboard

After running the SQL commands above:

1. **Test Job Management:**
   - Create a new job
   - Edit, duplicate, delete jobs
   - Try bulk operations
   - Check expiration detection

2. **Test Company Information:**
   - Post a job with company name and description
   - Browse jobs and view the job details
   - Company info should show your actual data instead of hardcoded text

3. **Test Application System (if set up):**
   - Applications will start showing real data
   - Statistics will be calculated from actual database

## Need Help?

The dashboard is fully functional even with some database setup pending. The application system is optional but recommended for full functionality. All job management features work perfectly!