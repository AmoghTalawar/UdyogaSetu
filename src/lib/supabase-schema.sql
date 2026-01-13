-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'remote')),
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  experience TEXT NOT NULL CHECK (experience IN ('entry', 'mid', 'senior', 'lead')),
  skills TEXT[] DEFAULT '{}',
  application_deadline DATE,
  contact_email TEXT NOT NULL,
  company_id TEXT NOT NULL, -- Clerk user ID
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'closed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  voice_recording_url TEXT,
  voice_transcript TEXT,
  application_type TEXT NOT NULL CHECK (application_type IN ('qr', 'voice')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'interview', 'hired', 'rejected')),
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create companies table for additional company information
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL, -- Clerk user ID
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  company_phone TEXT,
  company_website TEXT,
  company_logo_url TEXT,
  company_description TEXT,
  industry TEXT,
  company_size TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_clerk_user_id ON companies(clerk_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
  BEFORE UPDATE ON applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON companies 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Companies can view their own jobs" ON jobs
  FOR SELECT USING (company_id = auth.uid()::text);

CREATE POLICY "Companies can insert their own jobs" ON jobs
  FOR INSERT WITH CHECK (company_id = auth.uid()::text);

CREATE POLICY "Companies can update their own jobs" ON jobs
  FOR UPDATE USING (company_id = auth.uid()::text);

CREATE POLICY "Companies can delete their own jobs" ON jobs
  FOR DELETE USING (company_id = auth.uid()::text);

-- Public can view active jobs
CREATE POLICY "Public can view active jobs" ON jobs
  FOR SELECT USING (status = 'active');

-- Applications policies
CREATE POLICY "Companies can view applications for their jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.company_id = auth.uid()::text
    )
  );

CREATE POLICY "Anyone can insert applications" ON applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Companies can update applications for their jobs" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.company_id = auth.uid()::text
    )
  );

-- Companies policies
CREATE POLICY "Companies can view their own data" ON companies
  FOR SELECT USING (clerk_user_id = auth.uid()::text);

CREATE POLICY "Companies can insert their own data" ON companies
  FOR INSERT WITH CHECK (clerk_user_id = auth.uid()::text);

CREATE POLICY "Companies can update their own data" ON companies
  FOR UPDATE USING (clerk_user_id = auth.uid()::text);

-- Insert some sample data for testing
INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, requirements, benefits, experience, skills, contact_email, company_id, status) VALUES
(
  'Senior Software Engineer',
  'Tech Innovators Inc.',
  'San Francisco, CA',
  'full-time',
  120000,
  180000,
  'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for designing and developing scalable web applications using modern technologies.',
  ARRAY['5+ years of software development experience', 'Strong knowledge of React and Node.js', 'Experience with cloud platforms (AWS/GCP)', 'Excellent problem-solving skills'],
  ARRAY['Competitive salary', 'Health insurance', 'Flexible working hours', 'Stock options', 'Professional development budget'],
  'senior',
  ARRAY['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
  'hr@techinnovators.com',
  'sample_company_1',
  'active'
),
(
  'Product Designer',
  'Creative Design Studio',
  'Remote',
  'full-time',
  90000,
  130000,
  'Join our creative team as a Product Designer where you will create intuitive and beautiful user experiences for our digital products.',
  ARRAY['3+ years of product design experience', 'Proficiency in Figma and Adobe Creative Suite', 'Experience with user research and testing', 'Strong portfolio demonstrating design skills'],
  ARRAY['Remote-first culture', 'Health and dental insurance', 'Equipment allowance', 'Learning stipend', 'Flexible PTO'],
  'mid',
  ARRAY['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'UI/UX Design'],
  'jobs@creativestudio.com',
  'sample_company_2',
  'active'
),
(
  'Marketing Manager',
  'Global Marketing Solutions',
  'New York, NY',
  'full-time',
  80000,
  110000,
  'We are seeking a Marketing Manager to lead our digital marketing initiatives and drive brand awareness across multiple channels.',
  ARRAY['5+ years of marketing experience', 'Experience with digital marketing platforms', 'Strong analytical and communication skills', 'Bachelor\'s degree in Marketing or related field'],
  ARRAY['Comprehensive health benefits', '401(k) matching', 'Professional development opportunities', 'Team building events', 'Commuter benefits'],
  'senior',
  ARRAY['Digital Marketing', 'Google Analytics', 'SEO/SEM', 'Content Marketing', 'Social Media'],
  'careers@globalmarketing.com',
  'sample_company_3',
  'active'
);