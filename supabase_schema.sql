-- ===============================================
-- COMPLETE SUPABASE SCHEMA FOR KIOSK JOB APPLICATION SYSTEM
-- ===============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 1. CORE TABLES
-- ===============================================

-- Companies table (employers)
CREATE TABLE companies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id text UNIQUE NOT NULL, -- Clerk authentication ID
    company_name text NOT NULL,
    company_email text NOT NULL,
    company_phone text,
    company_website text,
    company_logo_url text,
    company_description text,
    industry text,
    company_size text CHECK (company_size IN ('1-10', '11-50', '51-200', '201-1000', '1000+')),
    location text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Jobs table (job postings)
CREATE TABLE jobs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    title text NOT NULL,
    location text NOT NULL,
    job_type text NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'temporary')),
    salary_min integer,
    salary_max integer CHECK (salary_max >= salary_min),
    salary_currency text DEFAULT 'USD',
    description text NOT NULL,
    requirements text[] DEFAULT '{}',
    benefits text[] DEFAULT '{}',
    experience_level text NOT NULL CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'executive')),
    skills text[] DEFAULT '{}',
    application_deadline date,
    contact_email text NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'draft')),
    total_applications integer DEFAULT 0,
    kiosk_enabled boolean DEFAULT true, -- Whether this job accepts kiosk applications
    qr_code_url text, -- URL for the QR code to apply for this job
    video_url text, -- URL for the job video
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Applications table (candidate submissions)
CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id uuid NOT NULL,
    -- Candidate information
    applicant_name text NOT NULL,
    applicant_email text,
    applicant_phone text NOT NULL, -- Required for notifications
    -- Application method and data
    application_method text NOT NULL CHECK (application_method IN ('kiosk_qr', 'kiosk_voice', 'online')),
    resume_url text, -- Link to resume file in storage
    voice_recording_url text, -- Link to voice recording in storage
    voice_transcript text, -- Transcribed voice content
    cover_letter text,
    -- Kiosk specific data
    kiosk_id text, -- ID of the kiosk used for application
    submission_location text, -- Location where application was submitted
    -- Status and scoring
    status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'approved', 'rejected', 'hired')),
    ai_score integer CHECK (ai_score >= 0 AND ai_score <= 100),
    reviewer_notes text,
    reviewed_by uuid, -- Company user who reviewed
    reviewed_at timestamptz,
    -- Notification tracking
    notification_sent boolean DEFAULT false,
    notification_sent_at timestamptz,
    notification_type text, -- 'approval' or 'rejection'
    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ===============================================
-- 2. SUPPORTING TABLES
-- ===============================================

-- Uploaded files table (resumes, voice recordings, etc.)
CREATE TABLE uploaded_files (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id uuid, -- Can be null for general uploads
    file_name text NOT NULL,
    file_path text NOT NULL, -- Storage path
    file_size integer NOT NULL,
    file_type text NOT NULL, -- MIME type
    file_category text NOT NULL CHECK (file_category IN ('resume', 'voice_recording', 'cover_letter', 'portfolio', 'other')),
    public_url text NOT NULL, -- Public accessible URL
    is_processed boolean DEFAULT false, -- For AI processing status
    uploaded_by_method text DEFAULT 'kiosk' CHECK (uploaded_by_method IN ('kiosk', 'web', 'mobile')),
    uploaded_at timestamptz DEFAULT now()
);

-- Notifications table (track all notifications sent)
CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id uuid NOT NULL,
    recipient_phone text NOT NULL,
    notification_type text NOT NULL CHECK (notification_type IN ('approval', 'rejection', 'status_update', 'reminder')),
    message text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    provider text DEFAULT 'twilio' CHECK (provider IN ('twilio', 'whatsapp', 'sms')),
    provider_message_id text, -- External provider's message ID
    error_message text,
    sent_at timestamptz,
    delivered_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Application status history (track status changes)
CREATE TABLE application_status_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id uuid NOT NULL,
    old_status text,
    new_status text NOT NULL,
    changed_by uuid, -- Company user who made the change
    change_reason text,
    notes text,
    created_at timestamptz DEFAULT now()
);

-- Kiosks table (track kiosk locations and status)
CREATE TABLE kiosks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    kiosk_code text UNIQUE NOT NULL, -- Unique identifier for each kiosk
    location_name text NOT NULL,
    address text,
    city text,
    country text,
    is_active boolean DEFAULT true,
    last_ping timestamptz, -- Last time kiosk checked in
    software_version text,
    hardware_info jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Company users table (for multiple users per company)
CREATE TABLE company_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id uuid NOT NULL,
    clerk_user_id text UNIQUE NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions jsonb DEFAULT '{}', -- Flexible permissions structure
    is_active boolean DEFAULT true,
    last_login timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ===============================================
-- 3. ADD FOREIGN KEY CONSTRAINTS
-- ===============================================

-- Jobs foreign keys
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_company_id 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Applications foreign keys
ALTER TABLE applications 
ADD CONSTRAINT fk_applications_job_id 
FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE applications 
ADD CONSTRAINT fk_applications_reviewed_by 
FOREIGN KEY (reviewed_by) REFERENCES company_users(id) ON DELETE SET NULL;

-- Uploaded files foreign keys
ALTER TABLE uploaded_files 
ADD CONSTRAINT fk_uploaded_files_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- Notifications foreign keys
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

-- Application status history foreign keys
ALTER TABLE application_status_history 
ADD CONSTRAINT fk_status_history_application_id 
FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

ALTER TABLE application_status_history 
ADD CONSTRAINT fk_status_history_changed_by 
FOREIGN KEY (changed_by) REFERENCES company_users(id) ON DELETE SET NULL;

-- Company users foreign keys
ALTER TABLE company_users 
ADD CONSTRAINT fk_company_users_company_id 
FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- ===============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Companies indexes
CREATE INDEX idx_companies_clerk_user_id ON companies(clerk_user_id);
CREATE INDEX idx_companies_is_active ON companies(is_active);

-- Jobs indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_kiosk_enabled ON jobs(kiosk_enabled);
CREATE INDEX idx_jobs_application_deadline ON jobs(application_deadline);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Applications indexes
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_phone ON applications(applicant_phone);
CREATE INDEX idx_applications_created_at ON applications(created_at);
CREATE INDEX idx_applications_reviewed_by ON applications(reviewed_by);
CREATE INDEX idx_applications_kiosk_id ON applications(kiosk_id);

-- Uploaded files indexes
CREATE INDEX idx_uploaded_files_application_id ON uploaded_files(application_id);
CREATE INDEX idx_uploaded_files_category ON uploaded_files(file_category);
CREATE INDEX idx_uploaded_files_uploaded_at ON uploaded_files(uploaded_at);

-- Notifications indexes
CREATE INDEX idx_notifications_application_id ON notifications(application_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_phone ON notifications(recipient_phone);

-- Application status history indexes
CREATE INDEX idx_status_history_application_id ON application_status_history(application_id);
CREATE INDEX idx_status_history_created_at ON application_status_history(created_at);

-- Company users indexes
CREATE INDEX idx_company_users_company_id ON company_users(company_id);
CREATE INDEX idx_company_users_clerk_user_id ON company_users(clerk_user_id);

-- ===============================================
-- 5. CREATE FUNCTIONS AND TRIGGERS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_companies_updated_at 
BEFORE UPDATE ON companies 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON jobs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
BEFORE UPDATE ON applications 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kiosks_updated_at 
BEFORE UPDATE ON kiosks 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at 
BEFORE UPDATE ON company_users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track application status changes
CREATE OR REPLACE FUNCTION track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history (
            application_id,
            old_status,
            new_status,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            NEW.reviewed_by,
            NEW.reviewer_notes
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically track status changes
CREATE TRIGGER track_application_status_changes
AFTER UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION track_application_status_change();

-- Function to update job application count
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs 
        SET total_applications = total_applications + 1 
        WHERE id = NEW.job_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs 
        SET total_applications = total_applications - 1 
        WHERE id = OLD.job_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers to maintain job application count
CREATE TRIGGER update_job_count_on_insert
AFTER INSERT ON applications
FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

CREATE TRIGGER update_job_count_on_delete
AFTER DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- ===============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosks ENABLE ROW LEVEL SECURITY;

-- Companies: Users can only access their own company data
CREATE POLICY "Users can access own company" ON companies
FOR ALL USING (
    clerk_user_id = auth.jwt() ->> 'sub' OR
    EXISTS (
        SELECT 1 FROM company_users 
        WHERE company_users.company_id = companies.id 
        AND company_users.clerk_user_id = auth.jwt() ->> 'sub'
        AND company_users.is_active = true
    )
);

-- Jobs: Company users can manage their jobs, public can read active jobs
CREATE POLICY "Company users can manage jobs" ON jobs
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM companies c
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE c.id = jobs.company_id 
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

CREATE POLICY "Public can read active jobs" ON jobs
FOR SELECT USING (status = 'active' AND kiosk_enabled = true);

-- Applications: Company users can view applications for their jobs
CREATE POLICY "Company users can view applications" ON applications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM jobs j
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE j.id = applications.job_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

-- Allow kiosk applications (anonymous users can create applications)
CREATE POLICY "Anonymous can create applications" ON applications
FOR INSERT WITH CHECK (true);

-- Company users can update applications for their jobs
CREATE POLICY "Company users can update applications" ON applications
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM jobs j
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE j.id = applications.job_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

-- Uploaded files: Access based on application ownership
CREATE POLICY "Access files based on application" ON uploaded_files
FOR ALL USING (
    application_id IS NULL OR -- Public files
    EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE a.id = uploaded_files.application_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

-- Allow anonymous file uploads for kiosk
CREATE POLICY "Anonymous can upload files" ON uploaded_files
FOR INSERT WITH CHECK (true);

-- Notifications: Company users can view notifications for their applications
CREATE POLICY "Company users can view notifications" ON notifications
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE a.id = notifications.application_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

-- Application status history: Same as applications
CREATE POLICY "Company users can view status history" ON application_status_history
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE a.id = application_status_history.application_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

-- Company users: Users can only access their company's users
CREATE POLICY "Access company users" ON company_users
FOR ALL USING (
    clerk_user_id = auth.jwt() ->> 'sub' OR
    EXISTS (
        SELECT 1 FROM companies c 
        WHERE c.id = company_users.company_id 
        AND c.clerk_user_id = auth.jwt() ->> 'sub'
    ) OR
    EXISTS (
        SELECT 1 FROM company_users cu2
        WHERE cu2.company_id = company_users.company_id
        AND cu2.clerk_user_id = auth.jwt() ->> 'sub'
        AND cu2.is_active = true
        AND cu2.role IN ('owner', 'admin')
    )
);

-- Kiosks: Public read access, admin write access
CREATE POLICY "Public can read active kiosks" ON kiosks
FOR SELECT USING (is_active = true);

-- ===============================================
-- 7. HELPFUL VIEWS
-- ===============================================

-- View for complete application details
CREATE VIEW application_details AS
SELECT 
    a.*,
    j.title as job_title,
    j.location as job_location,
    c.company_name,
    c.company_email,
    cu.full_name as reviewer_name,
    CASE 
        WHEN a.status = 'submitted' THEN 'New Application'
        WHEN a.status = 'under_review' THEN 'Under Review'
        WHEN a.status = 'shortlisted' THEN 'Shortlisted'
        WHEN a.status = 'approved' THEN 'Approved'
        WHEN a.status = 'rejected' THEN 'Rejected'
        WHEN a.status = 'hired' THEN 'Hired'
    END as status_display
FROM applications a
JOIN jobs j ON a.job_id = j.id
JOIN companies c ON j.company_id = c.id
LEFT JOIN company_users cu ON a.reviewed_by = cu.id;

-- View for job statistics
CREATE VIEW job_statistics AS
SELECT 
    j.*,
    c.company_name,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'submitted' THEN 1 END) as pending_applications,
    COUNT(CASE WHEN a.status = 'approved' THEN 1 END) as approved_applications,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_applications
FROM jobs j
JOIN companies c ON j.company_id = c.id
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, c.company_name;

-- ===============================================
-- SCHEMA CREATION COMPLETE!
-- ===============================================

-- Sample data will be inserted in a separate script
SELECT 'Database schema created successfully!' as status;