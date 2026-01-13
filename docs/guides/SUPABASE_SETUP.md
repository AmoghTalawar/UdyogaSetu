# Supabase Database Setup Guide

This guide will help you set up the required database tables in Supabase for your job portal application.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in Supabase
3. Get your project URL and anon key from Settings > API

## Step 1: Update Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
# Replace with your actual Supabase project URL and keys
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Create Database Tables

In your Supabase dashboard, go to SQL Editor and run these SQL commands:

### Jobs Table
```sql
-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'remote')),
    salary_min INTEGER,
    salary_max INTEGER,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    experience VARCHAR(50) NOT NULL,
    skills TEXT[] DEFAULT '{}',
    application_deadline DATE,
    contact_email VARCHAR(255) NOT NULL,
    company_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'closed', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
```

### Applications Table
```sql
-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    resume_url TEXT,
    voice_recording_url TEXT,
    voice_transcript TEXT,
    application_type VARCHAR(50) NOT NULL CHECK (application_type IN ('qr', 'voice', 'upload')),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'interview', 'hired', 'rejected')),
    ai_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
```

### File Uploads Table
```sql
-- Create uploaded_files table for resume storage
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    upload_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    public_url TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_uploaded_files_upload_id ON uploaded_files(upload_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at);
```

## Step 3: Set Up Row Level Security (RLS)

Enable RLS and create policies for secure access:

```sql
-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Jobs table policies
-- Allow public to read active jobs
CREATE POLICY "Public can view active jobs" ON jobs
    FOR SELECT USING (status = 'active');

-- Allow authenticated users to insert jobs
CREATE POLICY "Authenticated users can insert jobs" ON jobs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own jobs
CREATE POLICY "Users can update own jobs" ON jobs
    FOR UPDATE USING (auth.uid()::text = company_id);

-- Applications table policies
-- Allow public to insert applications
CREATE POLICY "Public can submit applications" ON applications
    FOR INSERT WITH CHECK (true);

-- Allow job owners to view applications for their jobs
CREATE POLICY "Job owners can view applications" ON applications
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT company_id FROM jobs WHERE jobs.id = applications.job_id
        )
    );

-- File uploads policies
-- Allow public to insert files
CREATE POLICY "Public can upload files" ON uploaded_files
    FOR INSERT WITH CHECK (true);

-- Allow public to view files (for resume access)
CREATE POLICY "Public can view files" ON uploaded_files
    FOR SELECT USING (true);
```

## Step 4: Create Storage Bucket

In Supabase Storage, create a bucket named `resumes`:

1. Go to Storage in your Supabase dashboard
2. Click "New bucket"
3. Name it `resumes`
4. Make it public
5. Save

## Step 5: Test the Setup

1. Restart your development server: `npm run dev`
2. Try posting a job through the application
3. Check the Supabase dashboard to see if data appears in the tables

## Troubleshooting

### Common Issues:

1. **"relation 'jobs' does not exist"**
   - Make sure you ran the SQL commands to create tables
   - Check that you're connected to the correct Supabase project

2. **"JWT expired" or authentication errors**
   - Check that your Supabase anon key is correct
   - Verify your project URL is correct

3. **"Permission denied"**
   - Make sure RLS policies are set up correctly
   - Check that your user has the right permissions

4. **Job posting works but data doesn't appear**
   - Check the browser console for errors
   - Verify your table structure matches the expected fields

### Still Having Issues?

If you're still experiencing problems:

1. Check the browser console for detailed error messages
2. Verify your environment variables are loaded correctly
3. Test your Supabase connection in the Supabase dashboard
4. Make sure all required fields are filled in the job form

## Demo Mode

If you don't want to set up Supabase right now, the application will automatically detect missing configuration and run in demo mode, logging job data to the console instead of saving to the database.