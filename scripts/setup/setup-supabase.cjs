const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uveswbrnojjfdmtilgka.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2ZXN3YnJub2pqZmRtdGlsZ2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODczNjcsImV4cCI6MjA3MzE2MzM2N30.Nq5mG_0Ex3OfSQmUu2TOrHVtqRsLDi_XVmA8qRLzgT8';

console.log('🚀 Setting up Supabase for resume uploads...\n');

async function setupSupabase() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📡 Connecting to Supabase...');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('test')
      .select('*')
      .limit(1);
    
    console.log('✅ Connection successful!');

    // Check if storage bucket exists
    console.log('\n🪣 Checking storage bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.warn('⚠️  Could not list buckets (this is normal with anon key)');
      console.log('   You need to create the "resumes" bucket manually in Supabase dashboard');
    } else {
      const resumesBucket = buckets?.find(bucket => bucket.name === 'resumes');
      if (resumesBucket) {
        console.log('✅ "resumes" bucket already exists');
      } else {
        console.log('❌ "resumes" bucket not found');
        console.log('   Please create it manually in Supabase dashboard');
      }
    }

    // Try to create uploaded_files table
    console.log('\n🗄️  Setting up database table...');
    
    const createTableSQL = `
      -- Table for tracking uploaded files
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        upload_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        public_url TEXT NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(upload_id)
      );
      
      -- Table for tracking job applications with applicant info
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        job_id TEXT NOT NULL,
        applicant_name TEXT NOT NULL,
        applicant_email TEXT NOT NULL,
        applicant_phone TEXT NOT NULL,
        application_method TEXT NOT NULL, -- 'qr' or 'voice'
        resume_url TEXT,
        resume_file_id TEXT,
        voice_language TEXT,
        voice_transcript TEXT,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'submitted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_upload_id ON uploaded_files(upload_id);
      CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at);
      CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_email ON job_applications(applicant_email);
      CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at);
      CREATE INDEX IF NOT EXISTS idx_job_applications_method ON job_applications(application_method);
    `;

    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (tableError) {
      console.warn('⚠️  Could not create table automatically (this is normal with anon key)');
      console.log('   Please create the table manually in Supabase SQL editor:');
      console.log('\n' + createTableSQL);
    } else {
      console.log('✅ uploaded_files table created successfully');
    }

  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

function displayManualSetup() {
  console.log('\n📋 Manual Setup Instructions:');
  console.log('='.repeat(50));
  console.log('\n1. 🪣 Create Storage Bucket:');
  console.log('   - Go to your Supabase dashboard');
  console.log('   - Navigate to Storage');
  console.log('   - Click "New bucket"');
  console.log('   - Name: resumes');
  console.log('   - Make it Public: ✅ (recommended)');
  console.log('   - File size limit: 5242880 (5MB)');
  console.log('   - Allowed MIME types: application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  console.log('\n2. 🗄️  Create Database Table:');
  console.log('   - Go to SQL Editor in Supabase dashboard');
  console.log('   - Run this SQL:');
  console.log(`
-- Table for file uploads
CREATE TABLE uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for job applications
CREATE TABLE job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  application_method TEXT NOT NULL,
  resume_url TEXT,
  resume_file_id TEXT,
  voice_language TEXT,
  voice_transcript TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_uploaded_files_upload_id ON uploaded_files(upload_id);
CREATE INDEX idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_applicant_email ON job_applications(applicant_email);
CREATE INDEX idx_job_applications_applied_at ON job_applications(applied_at);

-- Enable RLS (optional, for security)
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous uploads" ON uploaded_files FOR ALL USING (true);
CREATE POLICY "Allow anonymous applications" ON job_applications FOR ALL USING (true);
  `);

  console.log('\n3. 🔒 Storage Policies:');
  console.log('   - Go to Storage > resumes bucket > Policies');
  console.log('   - Add policy to allow uploads:');
  console.log(`
-- Policy for uploads
CREATE POLICY "Allow anonymous uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- Policy for reading files  
CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');
  `);

  console.log('\n✅ After completing these steps, your upload system will be fully functional!');
}

// Run setup
setupSupabase().then(() => {
  displayManualSetup();
});