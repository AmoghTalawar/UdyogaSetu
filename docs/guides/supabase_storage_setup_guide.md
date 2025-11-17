# Supabase Storage Setup for Voice Applications

## Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **"Create a new bucket"**
4. Set the following:
   - **Bucket name**: `resumes`
   - **Public bucket**: ✅ Check this (allows direct file access)
   - **File size limit**: 10 MB (optional)
   - **Allowed MIME types**: Leave empty for all types

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security policies for the storage bucket.

### Option A: Via Supabase Dashboard (Recommended)
1. Go to **Storage** > **Policies**
2. Find the `resumes` bucket
3. Click **"New Policy"**

**Insert Policy** (Allow uploads):
- Policy name: `Allow resume uploads`
- Operation: `INSERT` 
- Target roles: `authenticated, anon`
- Policy definition: 
```sql
true
```

**Select Policy** (Allow downloads):
- Policy name: `Allow resume downloads`
- Operation: `SELECT`
- Target roles: `authenticated, anon`
- Policy definition:
```sql
true
```

### Option B: Via SQL Editor
Run this in your Supabase SQL Editor:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow uploads to resumes bucket
CREATE POLICY "Allow resume uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- Allow downloads from resumes bucket
CREATE POLICY "Allow resume downloads" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');
```

## Step 3: Test the Setup

After running the SQL fix and setting up storage:

1. **Test voice application** on your website
2. **Check the Storage tab** in Supabase dashboard to see uploaded files
3. **Check the job_applications table** to see the application records
4. **Go to Company Dashboard** to see if applications appear

## Common Issues & Solutions

### Issue: "Bucket not found"
- Make sure the bucket is named exactly `resumes`
- Check that the bucket is created and appears in the Storage tab

### Issue: "Permission denied"
- Ensure storage policies are created
- Check that RLS is enabled on storage.objects
- Verify the policy definitions allow the operations you need

### Issue: "Applications not showing in dashboard"
- Run the complete SQL fix script
- Check that the `resume_file_id` column exists in job_applications table
- Verify the company_id matching between jobs and applications

## Verification Steps

Run these queries in your SQL Editor to verify everything is working:

```sql
-- Check if bucket exists
SELECT name, public FROM storage.buckets WHERE name = 'resumes';

-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'resumes';

-- Check job_applications table structure
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'job_applications' AND column_name = 'resume_file_id';

-- Test RLS on job_applications
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'job_applications';
```

All queries should return results if setup is correct.