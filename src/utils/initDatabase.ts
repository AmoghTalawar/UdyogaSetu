import { supabase } from './supabase';

export const initializeDatabase = async () => {
  try {
    console.log('Checking if job_applications table exists...');
    
    // Try to query the table first
    const { data, error } = await supabase
      .from('job_applications')
      .select('id')
      .limit(1);
    
    if (error && error.message.includes('relation "job_applications" does not exist')) {
      console.log('job_applications table does not exist. You need to run the SQL migration.');
      console.log('Please run the SQL commands from src/utils/database-schema.sql in your Supabase SQL editor.');
      return false;
    } else if (error) {
      console.error('Error checking job_applications table:', error);
      return false;
    } else {
      console.log('job_applications table exists and is accessible.');
      return true;
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Function to create some sample data for testing
export const createSampleApplications = async (companyId: string, jobId: string) => {
  try {
    const sampleApplications = [
      {
        job_id: jobId,
        applicant_name: 'Rahul Sharma',
        applicant_email: 'rahul.sharma@email.com',
        applicant_phone: '+91 9876543210',
        application_method: 'voice',
        voice_language: 'en-US',
        voice_transcript: 'Hello, I am Rahul Sharma. I have 3 years of experience in software development...',
        company_id: companyId,
        applicant_score: 88,
        status: 'submitted',
        applied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        job_id: jobId,
        applicant_name: 'Priya Patel',
        applicant_email: 'priya.patel@email.com',
        applicant_phone: '+91 9876543211',
        application_method: 'qr',
        company_id: companyId,
        applicant_score: 92,
        status: 'reviewed',
        applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
      {
        job_id: jobId,
        applicant_name: 'Amit Kumar',
        applicant_email: null,
        applicant_phone: '+91 9876543212',
        application_method: 'voice',
        voice_language: 'hi-IN',
        voice_transcript: 'नमस्ते, मैं अमित कुमार हूं। मेरे पास डेटा साइंस में 2 साल का अनुभव है...',
        company_id: companyId,
        applicant_score: 85,
        status: 'interview',
        applied_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      }
    ];

    const { data, error } = await supabase
      .from('job_applications')
      .insert(sampleApplications)
      .select();

    if (error) {
      console.error('Error creating sample applications:', error);
      return false;
    }

    console.log('Sample applications created:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('Error in createSampleApplications:', error);
    return false;
  }
};