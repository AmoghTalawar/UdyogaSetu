-- ===============================================
-- SAMPLE DATA FOR KIOSK JOB APPLICATION SYSTEM
-- ===============================================

-- Insert sample companies
INSERT INTO companies (clerk_user_id, company_name, company_email, company_phone, company_website, company_description, industry, company_size, location) VALUES
('user_2example1', 'TechCorp Solutions', 'hr@techcorp.com', '+1-555-0101', 'https://techcorp.com', 'Leading software development company specializing in enterprise solutions', 'Technology', '51-200', 'San Francisco, CA'),
('user_2example2', 'GreenEnergy Inc', 'careers@greenenergy.com', '+1-555-0102', 'https://greenenergy.com', 'Renewable energy solutions provider', 'Energy', '201-1000', 'Austin, TX'),
('user_2example3', 'FinanceFirst Bank', 'jobs@financefirst.com', '+1-555-0103', 'https://financefirst.com', 'Regional bank providing comprehensive financial services', 'Finance', '1000+', 'New York, NY');

-- Insert sample company users
INSERT INTO company_users (company_id, clerk_user_id, email, full_name, role) VALUES
((SELECT id FROM companies WHERE clerk_user_id = 'user_2example1'), 'user_2example1', 'john.doe@techcorp.com', 'John Doe', 'owner'),
((SELECT id FROM companies WHERE clerk_user_id = 'user_2example2'), 'user_2example2', 'sarah.smith@greenenergy.com', 'Sarah Smith', 'owner'),
((SELECT id FROM companies WHERE clerk_user_id = 'user_2example3'), 'user_2example3', 'mike.johnson@financefirst.com', 'Mike Johnson', 'owner');

-- Insert sample kiosks
INSERT INTO kiosks (kiosk_code, location_name, address, city, country, software_version) VALUES
('KIOSK_SF_001', 'Downtown San Francisco Mall', '123 Market St', 'San Francisco', 'USA', '1.0.0'),
('KIOSK_AU_001', 'Austin Tech Center', '456 Congress Ave', 'Austin', 'USA', '1.0.0'),
('KIOSK_NY_001', 'Manhattan Financial District', '789 Wall St', 'New York', 'USA', '1.0.0'),
('KIOSK_SF_002', 'Mission District Plaza', '321 Mission St', 'San Francisco', 'USA', '1.0.0');

-- Insert sample jobs
INSERT INTO jobs (company_id, title, location, job_type, salary_min, salary_max, description, requirements, benefits, experience_level, skills, application_deadline, contact_email, qr_code_url) VALUES
(
    (SELECT id FROM companies WHERE company_name = 'TechCorp Solutions'),
    'Full Stack Developer',
    'San Francisco, CA',
    'full-time',
    80000,
    120000,
    'Join our dynamic team as a Full Stack Developer. You will be responsible for developing and maintaining web applications using modern technologies.',
    ARRAY['Bachelor''s degree in Computer Science or related field', '3+ years of web development experience', 'Proficiency in JavaScript and Python'],
    ARRAY['Health insurance', 'Dental coverage', '401k matching', 'Flexible work hours', 'Remote work options'],
    'mid',
    ARRAY['JavaScript', 'Python', 'React', 'Node.js', 'PostgreSQL'],
    '2024-10-15',
    'hiring@techcorp.com',
    'https://techcorp.com/qr/fullstack-dev'
),
(
    (SELECT id FROM companies WHERE company_name = 'TechCorp Solutions'),
    'Junior Software Engineer',
    'San Francisco, CA',
    'full-time',
    60000,
    80000,
    'Perfect opportunity for recent graduates to start their career in software development. You will work on exciting projects and learn from experienced developers.',
    ARRAY['Bachelor''s degree in Computer Science', 'Strong problem-solving skills', 'Basic programming knowledge'],
    ARRAY['Health insurance', 'Learning budget', 'Mentorship program', 'Gym membership'],
    'entry',
    ARRAY['Java', 'Python', 'Git', 'SQL'],
    '2024-11-01',
    'hiring@techcorp.com',
    'https://techcorp.com/qr/junior-engineer'
),
(
    (SELECT id FROM companies WHERE company_name = 'GreenEnergy Inc'),
    'Solar Installation Technician',
    'Austin, TX',
    'full-time',
    45000,
    65000,
    'Install and maintain solar panel systems for residential and commercial clients. Great opportunity to work in the growing renewable energy sector.',
    ARRAY['High school diploma or equivalent', 'Physical fitness for outdoor work', 'Willingness to work at heights'],
    ARRAY['Health insurance', 'Safety training', 'Career advancement opportunities', 'Company vehicle'],
    'entry',
    ARRAY['Electrical work', 'Safety protocols', 'Customer service'],
    '2024-10-30',
    'jobs@greenenergy.com',
    'https://greenenergy.com/qr/solar-tech'
),
(
    (SELECT id FROM companies WHERE company_name = 'FinanceFirst Bank'),
    'Customer Service Representative',
    'New York, NY',
    'full-time',
    40000,
    55000,
    'Provide excellent customer service to bank clients through phone, email, and in-person interactions. Help customers with their banking needs and financial questions.',
    ARRAY['High school diploma required', 'Previous customer service experience preferred', 'Strong communication skills'],
    ARRAY['Health insurance', 'Paid time off', 'Employee banking benefits', 'Performance bonuses'],
    'entry',
    ARRAY['Customer service', 'Communication', 'Banking software', 'Problem solving'],
    '2024-12-01',
    'hr@financefirst.com',
    'https://financefirst.com/qr/customer-service'
),
(
    (SELECT id FROM companies WHERE company_name = 'FinanceFirst Bank'),
    'Senior Financial Analyst',
    'New York, NY',
    'full-time',
    90000,
    130000,
    'Lead financial analysis and reporting for our commercial banking division. Work with senior management on strategic financial decisions.',
    ARRAY['Bachelor''s degree in Finance or Accounting', 'CPA or CFA preferred', '5+ years of financial analysis experience'],
    ARRAY['Health insurance', '401k with matching', 'Bonus program', 'Professional development budget'],
    'senior',
    ARRAY['Financial modeling', 'Excel', 'SQL', 'PowerBI', 'Risk analysis'],
    '2024-11-15',
    'hr@financefirst.com',
    'https://financefirst.com/qr/financial-analyst'
);

-- Insert sample applications (kiosk submissions)
INSERT INTO applications (job_id, applicant_name, applicant_email, applicant_phone, application_method, resume_url, voice_recording_url, voice_transcript, kiosk_id, submission_location, status) VALUES
(
    (SELECT id FROM jobs WHERE title = 'Full Stack Developer'),
    'Alice Johnson',
    'alice.johnson@email.com',
    '+1-555-1001',
    'kiosk_qr',
    'https://storage.supabase.com/resumes/alice_johnson_resume.pdf',
    NULL,
    NULL,
    'KIOSK_SF_001',
    'Downtown San Francisco Mall',
    'submitted'
),
(
    (SELECT id FROM jobs WHERE title = 'Junior Software Engineer'),
    'Bob Martinez',
    'bob.martinez@email.com',
    '+1-555-1002',
    'kiosk_voice',
    NULL,
    'https://storage.supabase.com/voice/bob_martinez_application.mp3',
    'Hi, my name is Bob Martinez. I just graduated from UC Berkeley with a Computer Science degree. I am very excited about this junior software engineer position. I have experience with Java and Python from my coursework and internships. I am eager to learn and contribute to your team.',
    'KIOSK_SF_002',
    'Mission District Plaza',
    'submitted'
),
(
    (SELECT id FROM jobs WHERE title = 'Solar Installation Technician'),
    'Carlos Rodriguez',
    'carlos.rodriguez@email.com',
    '+1-555-1003',
    'kiosk_qr',
    'https://storage.supabase.com/resumes/carlos_rodriguez_resume.pdf',
    NULL,
    NULL,
    'KIOSK_AU_001',
    'Austin Tech Center',
    'under_review'
),
(
    (SELECT id FROM jobs WHERE title = 'Customer Service Representative'),
    'Diana Chen',
    'diana.chen@email.com',
    '+1-555-1004',
    'kiosk_voice',
    NULL,
    'https://storage.supabase.com/voice/diana_chen_application.mp3',
    'Hello, I am Diana Chen and I am applying for the Customer Service Representative position. I have 3 years of experience in retail customer service and I love helping people solve their problems. I am very patient and have excellent communication skills.',
    'KIOSK_NY_001',
    'Manhattan Financial District',
    'approved'
),
(
    (SELECT id FROM jobs WHERE title = 'Senior Financial Analyst'),
    'Edward Thompson',
    'edward.thompson@email.com',
    '+1-555-1005',
    'kiosk_qr',
    'https://storage.supabase.com/resumes/edward_thompson_resume.pdf',
    NULL,
    NULL,
    'KIOSK_NY_001',
    'Manhattan Financial District',
    'rejected'
);

-- Insert sample uploaded files
INSERT INTO uploaded_files (application_id, file_name, file_path, file_size, file_type, file_category, public_url, uploaded_by_method) VALUES
(
    (SELECT id FROM applications WHERE applicant_name = 'Alice Johnson'),
    'alice_johnson_resume.pdf',
    'resumes/alice_johnson_resume.pdf',
    245760,
    'application/pdf',
    'resume',
    'https://storage.supabase.com/resumes/alice_johnson_resume.pdf',
    'kiosk'
),
(
    (SELECT id FROM applications WHERE applicant_name = 'Bob Martinez'),
    'bob_martinez_application.mp3',
    'voice/bob_martinez_application.mp3',
    1048576,
    'audio/mpeg',
    'voice_recording',
    'https://storage.supabase.com/voice/bob_martinez_application.mp3',
    'kiosk'
),
(
    (SELECT id FROM applications WHERE applicant_name = 'Carlos Rodriguez'),
    'carlos_rodriguez_resume.pdf',
    'resumes/carlos_rodriguez_resume.pdf',
    189440,
    'application/pdf',
    'resume',
    'https://storage.supabase.com/resumes/carlos_rodriguez_resume.pdf',
    'kiosk'
),
(
    (SELECT id FROM applications WHERE applicant_name = 'Diana Chen'),
    'diana_chen_application.mp3',
    'voice/diana_chen_application.mp3',
    2097152,
    'audio/mpeg',
    'voice_recording',
    'https://storage.supabase.com/voice/diana_chen_application.mp3',
    'kiosk'
),
(
    (SELECT id FROM applications WHERE applicant_name = 'Edward Thompson'),
    'edward_thompson_resume.pdf',
    'resumes/edward_thompson_resume.pdf',
    312320,
    'application/pdf',
    'resume',
    'https://storage.supabase.com/resumes/edward_thompson_resume.pdf',
    'kiosk'
);

-- Insert sample notifications
INSERT INTO notifications (application_id, recipient_phone, notification_type, message, status, provider) VALUES
(
    (SELECT id FROM applications WHERE applicant_name = 'Diana Chen'),
    '+1-555-1004',
    'approval',
    'Congratulations Diana! Your application for Customer Service Representative at FinanceFirst Bank has been approved. We will contact you soon for the next steps.',
    'sent',
    'twilio'
),
(
    (SELECT id FROM applications WHERE applicant_name = 'Edward Thompson'),
    '+1-555-1005',
    'rejection',
    'Thank you for your interest in the Senior Financial Analyst position at FinanceFirst Bank. While we were impressed with your qualifications, we have decided to move forward with other candidates. Best of luck in your job search.',
    'sent',
    'twilio'
);

-- Update some applications with review information
UPDATE applications 
SET 
    status = 'approved',
    reviewed_by = (SELECT id FROM company_users WHERE full_name = 'Mike Johnson'),
    reviewed_at = now() - interval '1 day',
    reviewer_notes = 'Excellent customer service background, good fit for our team culture.',
    notification_sent = true,
    notification_sent_at = now() - interval '1 day',
    notification_type = 'approval'
WHERE applicant_name = 'Diana Chen';

UPDATE applications 
SET 
    status = 'rejected',
    reviewed_by = (SELECT id FROM company_users WHERE full_name = 'Mike Johnson'),
    reviewed_at = now() - interval '2 hours',
    reviewer_notes = 'Qualifications do not match our current senior level requirements.',
    notification_sent = true,
    notification_sent_at = now() - interval '2 hours',
    notification_type = 'rejection'
WHERE applicant_name = 'Edward Thompson';

UPDATE applications 
SET 
    status = 'under_review',
    reviewed_by = (SELECT id FROM company_users WHERE full_name = 'Sarah Smith'),
    reviewed_at = now() - interval '6 hours',
    reviewer_notes = 'Reviewing technical background for solar installation experience.'
WHERE applicant_name = 'Carlos Rodriguez';

-- Update kiosk last ping times
UPDATE kiosks SET last_ping = now() - interval '5 minutes';

SELECT 'Sample data inserted successfully!' as status;

-- Display summary of inserted data
SELECT 
    'Summary' as info,
    (SELECT COUNT(*) FROM companies) as companies_count,
    (SELECT COUNT(*) FROM jobs) as jobs_count,
    (SELECT COUNT(*) FROM applications) as applications_count,
    (SELECT COUNT(*) FROM uploaded_files) as files_count,
    (SELECT COUNT(*) FROM notifications) as notifications_count,
    (SELECT COUNT(*) FROM kiosks) as kiosks_count;