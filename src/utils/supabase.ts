import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase configuration
// You need to replace these with your actual Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Storage bucket names
export const RESUME_BUCKET = 'resumes';
export const VOICE_BUCKET = 'voice';
export const FILE_CATEGORIES = {
  RESUME: 'resume',
  VOICE: 'voice_recording',
  COVER_LETTER: 'cover_letter',
  PORTFOLIO: 'portfolio',
  OTHER: 'other'
};

// Application status types
export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  HIRED: 'hired',
};

// Application method types
export const APPLICATION_METHOD = {
  KIOSK_QR: 'kiosk_qr',
  KIOSK_VOICE: 'kiosk_voice',
  ONLINE: 'online',
};

// File upload utility
export interface SupabaseUploadResult {
  success: boolean;
  fileId?: string;
  publicUrl?: string;
  error?: string;
}

export const uploadResumeToSupabase = async (
  uploadId: string,
  file: File
): Promise<SupabaseUploadResult> => {
  try {
    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExt = file.name.split('.').pop();
    const fileName = `${uploadId}_${timestamp}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(RESUME_BUCKET)
      .getPublicUrl(filePath);

    // Store file metadata in database (optional)
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert([
        {
          upload_id: uploadId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          file_category: FILE_CATEGORIES.RESUME,
          public_url: urlData.publicUrl,
          uploaded_at: new Date().toISOString(),
        },
      ]);

    if (dbError) {
      console.warn('Database metadata insert failed:', dbError);
      // Continue anyway since file upload succeeded
    }

    return {
      success: true,
      fileId: uploadData.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Supabase upload exception:', error);
    return {
      success: false,
      error: 'Unexpected upload error',
    };
  }
};

// Check if file exists for upload ID
export const checkSupabaseUpload = async (uploadId: string) => {
  try {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('upload_id', uploadId)
      .order('uploaded_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase check error:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Supabase check exception:', error);
    return null;
  }
};

// Delete old uploads (cleanup utility)
export const cleanupOldUploads = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    // Get files older than 30 minutes
    const { data: oldFiles, error: selectError } = await supabase
      .from('uploaded_files')
      .select('file_path')
      .lt('uploaded_at', thirtyMinutesAgo);

    if (selectError) {
      console.error('Error getting old files:', selectError);
      return;
    }

    if (!oldFiles || oldFiles.length === 0) {
      return;
    }

    // Delete files from storage
    const filePaths = oldFiles.map(f => f.file_path);
    const { error: storageError } = await supabase.storage
      .from(RESUME_BUCKET)
      .remove(filePaths);

    if (storageError) {
      console.error('Error deleting old files from storage:', storageError);
    }

    // Delete records from database
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .delete()
      .lt('uploaded_at', thirtyMinutesAgo);

    if (dbError) {
      console.error('Error deleting old file records:', dbError);
    }

    console.log(`Cleaned up ${oldFiles.length} old uploads`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

// Initialize cleanup interval
let cleanupInterval: NodeJS.Timeout | null = null;

export const startCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  // Run cleanup every 30 minutes
  cleanupInterval = setInterval(cleanupOldUploads, 30 * 60 * 1000);
  
  // Run initial cleanup
  cleanupOldUploads();
};

export const stopCleanupInterval = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// Job application API

// Submit a new job application
export interface ApplicationSubmission {
  job_id: string;
  applicant_name: string;
  applicant_email?: string;
  applicant_phone: string;
  application_method: string;
  resume_url?: string;
  voice_recording_url?: string;
  voice_transcript?: string;
  cover_letter?: string;
  kiosk_id?: string;
  submission_location?: string;
}

export const submitApplication = async (application: ApplicationSubmission) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        ...application,
        status: APPLICATION_STATUS.SUBMITTED,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting application:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception submitting application:', error);
    return { success: false, error: 'Unexpected error during application submission' };
  }
};

// Get applications for employer
export const getEmployerApplications = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*),
        reviewer:company_users(full_name)
      `)
      .eq('job.company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching employer applications:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception fetching employer applications:', error);
    return { success: false, error: 'Unexpected error fetching applications' };
  }
};

// Update application status
export interface ApplicationStatusUpdate {
  application_id: string;
  new_status: string;
  reviewer_id: string;
  reviewer_notes?: string;
  notification_type?: string;
}

export const updateApplicationStatus = async (update: ApplicationStatusUpdate) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .update({
        status: update.new_status,
        reviewed_by: update.reviewer_id,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: update.reviewer_notes,
        notification_type: update.notification_type,
      })
      .eq('id', update.application_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: error.message };
    }

    // If we're approving or rejecting, we should trigger a notification
    if (
      update.new_status === APPLICATION_STATUS.APPROVED || 
      update.new_status === APPLICATION_STATUS.REJECTED
    ) {
      // This would be handled by a database trigger in production
      // Here we'll simulate it with a direct API call
      const notificationType = update.new_status === APPLICATION_STATUS.APPROVED 
        ? 'approval' 
        : 'rejection';
        
      await createNotification({
        application_id: update.application_id,
        notification_type: notificationType,
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception updating application status:', error);
    return { success: false, error: 'Unexpected error updating application status' };
  }
};

// Create notification for an application
export interface NotificationRequest {
  application_id: string;
  notification_type: string;
  custom_message?: string;
}

export const createNotification = async (request: NotificationRequest) => {
  try {
    // First, get the application details to get the phone number
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(title, company:companies(company_name))
      `)
      .eq('id', request.application_id)
      .single();

    if (appError || !application) {
      console.error('Error fetching application for notification:', appError);
      return { success: false, error: appError?.message || 'Application not found' };
    }

    // Generate message based on notification type
    let message = request.custom_message;
    if (!message) {
      const jobTitle = application.job?.title || 'the position';
      const companyName = application.job?.company?.company_name || 'the company';

      if (request.notification_type === 'approval') {
        message = `Congratulations! Your application for ${jobTitle} at ${companyName} has been approved. We will contact you soon for the next steps.`;
      } else if (request.notification_type === 'rejection') {
        message = `Thank you for your interest in ${jobTitle} at ${companyName}. We appreciate your application, but we have decided to move forward with other candidates. We wish you the best in your job search.`;
      } else {
        message = `Update on your application for ${jobTitle} at ${companyName}: Your status has been updated to ${application.status}.`;
      }
    }

    // Create notification record
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        application_id: request.application_id,
        recipient_phone: application.applicant_phone,
        notification_type: request.notification_type,
        message,
        status: 'pending',
        provider: 'twilio', // Default to Twilio
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    // Update the application to mark notification as sent
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
        notification_type: request.notification_type,
      })
      .eq('id', request.application_id);

    if (updateError) {
      console.warn('Error updating application notification status:', updateError);
      // Continue anyway since notification was created
    }

    // In a real implementation, you would call the sendSMS function here
    // sendSMS(application.applicant_phone, message);

    return { success: true, data };
  } catch (error) {
    console.error('Exception creating notification:', error);
    return { success: false, error: 'Unexpected error creating notification' };
  }
};

// Get application status by phone number (for candidates checking status)
export const checkApplicationStatus = async (phone: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(title, company:companies(company_name))
      `)
      .eq('applicant_phone', phone)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error checking application status:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception checking application status:', error);
    return { success: false, error: 'Unexpected error checking application status' };
  }
};
