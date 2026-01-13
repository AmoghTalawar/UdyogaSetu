import { supabase } from '../utils/supabase';

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string;
  application_method: 'kiosk_qr' | 'kiosk_voice' | 'online';
  resume_url: string | null;
  voice_recording_url: string | null;
  voice_transcript: string | null;
  cover_letter: string | null;
  kiosk_id: string | null;
  submission_location: string | null;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'approved' | 'rejected' | 'hired';
  ai_score: number | null;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  notification_type: string | null;
  created_at: string;
  updated_at: string;
  
  // Mapped fields for compatibility
  applicant_score?: number | null;  // maps to ai_score
  applied_at?: string;              // maps to created_at
  voice_language?: string | null;   // derived or separate field
  
  // Joined data from jobs table
  job_title?: string;
  job_company?: string;
  
  // For backwards compatibility with frontend
  interview_scheduled_at?: string | null;
  interviewer_notes?: string | null;
}

export interface ApplicationStats {
  total_applications: number;
  new_applications: number;
  reviewed_applications: number;
  interview_applications: number;
  hired_applications: number;
  rejected_applications: number;
  applications_this_week: number;
  applications_this_month: number;
}

export class ApplicationService {
  /**
   * Get all applications for jobs posted by a specific company
   */
  static async getCompanyApplications(companyId: string): Promise<JobApplication[]> {
    try {
      console.log('🔍 Fetching applications for company ID:', companyId);
      
      // First, get jobs for this company
      const { data: companyJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, company_id')
        .eq('company_id', companyId);
      
      if (jobsError) {
        console.error('❌ Error fetching company jobs:', jobsError);
        return [];
      }
      
      if (!companyJobs || companyJobs.length === 0) {
        console.log('📋 No jobs found for company, returning empty applications');
        return [];
      }
      
      const jobIds = companyJobs.map(job => job.id);
      console.log('💼 Found', companyJobs.length, 'jobs for company');
      
      // Get applications from both tables to ensure we capture all applications
      console.log('🔍 Querying both job_applications and applications tables...');

      // Query job_applications table (for voice applications from ApplyModal)
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      // Query applications table (for QR/kiosk applications)
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });

      // Query mobile uploads (applications with application_method = 'mobile')
      const { data: mobileAppsData, error: mobileAppsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('application_method', 'mobile')
        .order('applied_at', { ascending: false });
      
      // Handle errors - if one table fails, continue with the other
      let combinedData: any[] = [];
      let hasErrors = false;

      if (jobAppsError && !jobAppsError.message.includes('does not exist')) {
        console.error('Error from job_applications table:', jobAppsError);
        hasErrors = true;
      } else if (jobAppsData) {
        console.log('✅ Found', jobAppsData.length, 'applications in job_applications table');
        combinedData = [...combinedData, ...jobAppsData];
      }

      if (appsError && !appsError.message.includes('does not exist')) {
        console.error('Error from applications table:', appsError);
        hasErrors = true;
      } else if (appsData) {
        console.log('✅ Found', appsData.length, 'applications in applications table');
        // Map applications table data to match job_applications schema
        const mappedAppsData = appsData.map((app: any) => ({
          ...app,
          applied_at: app.created_at || app.applied_at,
          applicant_score: app.ai_score || app.applicant_score,
        }));
        combinedData = [...combinedData, ...mappedAppsData];
      }

      // Add mobile applications
      if (mobileAppsError && !mobileAppsError.message.includes('does not exist')) {
        console.error('Error from mobile applications query:', mobileAppsError);
        hasErrors = true;
      } else if (mobileAppsData) {
        console.log('✅ Found', mobileAppsData.length, 'mobile applications');
        combinedData = [...combinedData, ...mobileAppsData];
      }
      
      // If both queries failed with real errors (not table missing), throw error
      if (hasErrors && combinedData.length === 0) {
        throw new Error('Failed to fetch applications from both tables');
      }
      
      // Sort combined data by applied_at/created_at
      const data = combinedData.sort((a, b) => {
        const dateA = new Date(a.applied_at || a.created_at);
        const dateB = new Date(b.applied_at || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('✅ Raw applications data:', data?.length || 0, 'records');
      if (data && data.length > 0) {
        console.log('📄 Sample application:', data[0]);
      }

      // Create job lookup map for efficiency
      const jobLookup = {};
      companyJobs.forEach(job => {
        jobLookup[job.id] = job;
      });

      // Transform the data to include job details
      return (data || []).map(app => {
        const job = jobLookup[app.job_id];
        return {
          ...app,
          job_title: job?.title,
          job_company: job?.company_id,
          // Map database field names to interface names
          applicant_score: app.applicant_score,
          applied_at: app.applied_at,
          // Map database status to frontend status for compatibility
          status: app.status === 'under_review' ? 'reviewed' : 
                 app.status === 'shortlisted' ? 'interview_scheduled' :
                 app.status === 'interview_scheduled' ? 'interview_scheduled' :
                 app.status,
          // Fix application_method mapping
          application_method: app.application_method === 'kiosk_qr' ? 'qr' :
                             app.application_method === 'kiosk_voice' ? 'voice' :
                             app.application_method,
          // Map voice recording URL to expected field name
          voice_language: app.voice_language,
          resume_url: app.resume_url,
          voice_transcript: app.voice_transcript
        };
      });
    } catch (error) {
      console.error('ApplicationService.getCompanyApplications error:', error);
      // Return empty array as fallback instead of throwing
      return [];
    }
  }

  /**
   * Get applications for a specific job
   */
  static async getJobApplications(jobId: string): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(
            id,
            title,
            company
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching job applications:', error);
        throw error;
      }

      return (data || []).map(app => ({
        ...app,
        job_title: app.jobs?.title,
        job_company: app.jobs?.company
      }));
    } catch (error) {
      console.error('ApplicationService.getJobApplications error:', error);
      throw error;
    }
  }

  /**
   * Get application statistics for a company
   */
  static async getCompanyApplicationStats(companyId: string): Promise<ApplicationStats> {
    try {
      console.log('📈 Getting stats for company:', companyId);
      
      // Skip database function and go directly to manual calculation
      console.log('📈 Using manual calculation for stats');
      return await this.calculateStatsManually(companyId);
      
    } catch (error) {
      console.error('ApplicationService.getCompanyApplicationStats error:', error);
      // Return zero stats as fallback
      return this.getZeroStats();
    }
  }

  private static getZeroStats(): ApplicationStats {
    return {
      total_applications: 0,
      new_applications: 0,
      reviewed_applications: 0,
      interview_applications: 0,
      hired_applications: 0,
      rejected_applications: 0,
      applications_this_week: 0,
      applications_this_month: 0
    };
  }

  /**
   * Fallback manual stats calculation
   */
  private static async calculateStatsManually(companyId: string): Promise<ApplicationStats> {
    try {
      // First get company jobs
      const { data: companyJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId);
      
      if (jobsError || !companyJobs || companyJobs.length === 0) {
        return this.getZeroStats();
      }
      
      const jobIds = companyJobs.map(job => job.id);
      console.log('📈 Job IDs for stats:', jobIds);
      
      // Get applications from both tables for complete stats
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from('job_applications')
        .select('status, applied_at, applicant_name')
        .in('job_id', jobIds);

      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('status, created_at as applied_at, applicant_name')
        .in('job_id', jobIds);

      // Get mobile applications for stats
      const { data: mobileAppsData, error: mobileAppsError } = await supabase
        .from('job_applications')
        .select('status, applied_at, applicant_name')
        .eq('application_method', 'mobile');

      // Combine data from both tables and mobile applications
      let combinedData: any[] = [];
      if (jobAppsData) combinedData = [...combinedData, ...jobAppsData];
      if (appsData) combinedData = [...combinedData, ...appsData];
      if (mobileAppsData) combinedData = [...combinedData, ...mobileAppsData];
      
      const data = combinedData;
      const error = (jobAppsError && appsError) ? jobAppsError : null;
      
      console.log('📈 Raw applications for stats:', data?.length, 'records');
      console.log('📈 Applications data:', data?.map(app => ({ name: app.applicant_name, status: app.status })));

      if (error) {
        // If table doesn't exist, return zero stats
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('job_applications table does not exist, returning zero stats');
          return this.getZeroStats();
        }
        throw error;
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      console.log('📊 Raw status data for stats:', data?.map(app => ({ name: app.applicant_name || 'Unknown', status: app.status })));
      
      // Count each status type
      const statusCounts = {};
      data?.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      console.log('📉 Status distribution:', statusCounts);
      
      const stats = {
        total_applications: data?.length || 0,
        new_applications: data?.filter(app => app.status === 'submitted').length || 0,
        reviewed_applications: data?.filter(app => app.status === 'reviewed').length || 0,
        interview_applications: data?.filter(app => 
          app.status === 'interview_scheduled' || app.status === 'shortlisted'
        ).length || 0,
        hired_applications: data?.filter(app => app.status === 'hired').length || 0,
        rejected_applications: data?.filter(app => app.status === 'rejected').length || 0,
        applications_this_week: data?.filter(app => 
          new Date(app.applied_at) >= oneWeekAgo
        ).length || 0,
        applications_this_month: data?.filter(app => 
          new Date(app.applied_at) >= oneMonthAgo
        ).length || 0
      };
      
      console.log('📈 Calculated stats:', stats);
      console.log('📈 Individual counts:');
      console.log('   submitted:', data?.filter(app => app.status === 'submitted').length);
      console.log('   reviewed:', data?.filter(app => app.status === 'reviewed').length);
      console.log('   interview_scheduled:', data?.filter(app => app.status === 'interview_scheduled').length);
      console.log('   hired:', data?.filter(app => app.status === 'hired').length);
      console.log('   rejected:', data?.filter(app => app.status === 'rejected').length);

      return stats;
    } catch (error) {
      console.error('Error calculating stats manually:', error);
      // Return zero stats as fallback instead of throwing
      return this.getZeroStats();
    }
  }

  /**
   * Update application status
   */
  static async updateApplicationStatus(
    applicationId: string, 
    status: JobApplication['status'],
    notes?: string
  ): Promise<void> {
    try {
      // Debug authentication state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Auth session:', session ? 'Authenticated' : 'Not authenticated');
      if (sessionError) {
        console.error('🔐 Session error:', sessionError);
      }
      
      console.log('🔄 Attempting update with data for application ID:', applicationId);
      
      // Create updates for job_applications table (different schema)
      const jobAppsUpdates: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // job_applications table uses different column names
      if (status === 'reviewed') {
        jobAppsUpdates.reviewed_at = new Date().toISOString();
      }
      
      // Skip notes for job_applications table as it may not have reviewer_notes column
      // The notes will be handled by applications table if needed
      
      console.log('🔄 Trying job_applications table with:', jobAppsUpdates);
      
      // Try updating in job_applications table first
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from('job_applications')
        .update(jobAppsUpdates)
        .eq('id', applicationId)
        .select();
      
      // If found in job_applications table, we're done
      if (jobAppsData && jobAppsData.length > 0) {
        console.log('✅ Update successful in job_applications table:', jobAppsData);
        return;
      }
      
      // If not found in job_applications table, try applications table with full updates including notes
      console.log('🔄 Not found in job_applications, trying applications table...');
      
      const appsUpdates: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'reviewed') {
        appsUpdates.reviewed_at = new Date().toISOString();
      }
      
      if (notes) {
        appsUpdates.reviewer_notes = notes; // applications table supports reviewer_notes
      }
      
      console.log('🔄 Trying applications table with:', appsUpdates);
      
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .update(appsUpdates)
        .eq('id', applicationId)
        .select();
      
      // Check if update was successful in applications table
      if (appsData && appsData.length > 0) {
        console.log('✅ Update successful in applications table:', appsData);
        return;
      }
      
      // If neither table had the record, log the errors and throw
      if (jobAppsError || appsError) {
        console.error('❌ Detailed error updating application status:');
        console.error('   job_applications error:', jobAppsError);
        console.error('   applications error:', appsError);
        
        // Throw the more relevant error
        const errorToThrow = jobAppsError || appsError;
        console.error('   Error code:', errorToThrow?.code);
        console.error('   Error message:', errorToThrow?.message);
        console.error('   Error details:', errorToThrow?.details);
        console.error('   Error hint:', errorToThrow?.hint);
        throw errorToThrow;
      }
      
      // If we reach here, no records were updated
      throw new Error(`No application found with ID: ${applicationId}`);
      
    } catch (error) {
      console.error('ApplicationService.updateApplicationStatus error:', error);
      throw error;
    }
  }

  /**
   * Delete an application permanently
   */
  static async deleteApplication(applicationId: string): Promise<void> {
    try {
      console.log('🗑️ Attempting to delete application ID:', applicationId);
      
      // Try deleting from job_applications table first
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId)
        .select();
      
      // If found and deleted from job_applications table, we're done
      if (jobAppsData && jobAppsData.length > 0) {
        console.log('✅ Application deleted successfully from job_applications table:', jobAppsData);
        return;
      }
      
      // If not found in job_applications table, try applications table
      console.log('🔄 Not found in job_applications, trying applications table...');
      
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId)
        .select();
      
      // Check if deletion was successful in applications table
      if (appsData && appsData.length > 0) {
        console.log('✅ Application deleted successfully from applications table:', appsData);
        return;
      }
      
      // If neither table had the record, log the errors and throw
      if (jobAppsError || appsError) {
        console.error('❌ Error deleting application:');
        console.error('   job_applications error:', jobAppsError);
        console.error('   applications error:', appsError);
        
        // Throw the more relevant error
        const errorToThrow = jobAppsError || appsError;
        throw errorToThrow;
      }
      
      // If we reach here, no records were deleted
      throw new Error(`No application found with ID: ${applicationId}`);
      
    } catch (error) {
      console.error('ApplicationService.deleteApplication error:', error);
      throw error;
    }
  }

  /**
   * Schedule interview for an application
   */
  static async scheduleInterview(
    applicationId: string, 
    interviewDate: string,
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({
          status: 'interview',
          interview_scheduled_at: interviewDate,
          interviewer_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error scheduling interview:', error);
        throw error;
      }
    } catch (error) {
      console.error('ApplicationService.scheduleInterview error:', error);
      throw error;
    }
  }

  /**
   * Get recent applications for activity feed
   */
  static async getRecentApplications(companyId: string, limit = 10): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!inner(
            id,
            title,
            company
          )
        `)
        .eq('company_id', companyId)
        .order('applied_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent applications:', error);
        throw error;
      }

      return (data || []).map(app => ({
        ...app,
        job_title: app.jobs?.title,
        job_company: app.jobs?.company
      }));
    } catch (error) {
      console.error('ApplicationService.getRecentApplications error:', error);
      throw error;
    }
  }

  /**
   * Count applications for each job posted by a company
   */
  static async getJobApplicationCounts(companyId: string): Promise<{ [jobId: string]: number }> {
    try {
      // First get company jobs
      const { data: companyJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId);
      
      if (jobsError || !companyJobs || companyJobs.length === 0) {
        return {};
      }
      
      const jobIds = companyJobs.map(job => job.id);
      
      // Get application counts from both tables
      const { data: jobAppsData, error: jobAppsError } = await supabase
        .from('job_applications')
        .select('job_id')
        .in('job_id', jobIds);

      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select('job_id')
        .in('job_id', jobIds);

      // Get mobile application counts (these don't have job_id, so they won't be counted per job)
      // Mobile applications are general applications not tied to specific jobs

      // Combine data from both tables
      let combinedData: any[] = [];
      if (jobAppsData) combinedData = [...combinedData, ...jobAppsData];
      if (appsData) combinedData = [...combinedData, ...appsData];
      
      const data = combinedData;
      const error = (jobAppsError && appsError) ? jobAppsError : null;

      if (error) {
        console.error('Error fetching job application counts:', error);
        // If table doesn't exist, return empty counts
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('job_applications table does not exist, returning empty counts');
          return {};
        }
        throw error;
      }

      // Count applications per job
      const counts: { [jobId: string]: number } = {};
      data?.forEach(app => {
        counts[app.job_id] = (counts[app.job_id] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('ApplicationService.getJobApplicationCounts error:', error);
      return {};
    }
  }
}