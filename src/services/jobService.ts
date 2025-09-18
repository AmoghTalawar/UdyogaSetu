import { supabase } from '../utils/supabase';

export interface Job {
  id: string;
  title: string;
  location: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  experience_level: string;
  skills: string[];
  application_deadline?: string;
  contact_email: string;
  company_id: string;
  company_name: string;
  company_about: string;
  status: 'active' | 'draft' | 'closed' | 'pending' | 'under_review' | 'rejected' | 'flagged';
  created_at: string;
  updated_at: string;
  // Additional fields that exist in the actual database
  total_applications?: number;
  kiosk_enabled?: boolean;
  qr_code_url?: string;
  video_url?: string;
  
  // Moderation fields
  moderation_notes?: string;
  moderated_by?: string;
  moderated_at?: string;
  flagged_reason?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Application {
  id: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  voice_recording_url?: string;
  voice_transcript?: string;
  application_type: 'qr' | 'voice';
  status: 'new' | 'reviewed' | 'interview' | 'hired' | 'rejected';
  ai_score?: number;
  created_at: string;
  updated_at: string;
}

export class JobService {
  // Fetch all active jobs for public display
  static async getActiveJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  }

  // Fetch jobs for a specific company
  static async getCompanyJobs(companyId: string): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company jobs:', error);
      return [];
    }
  }

  // Get a single job by ID
  static async getJobById(jobId: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }

  // Create a new job posting
  static async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      return null;
    }
  }

  // Update a job posting
  static async updateJob(jobId: string, updates: Partial<Job>): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating job:', error);
      return null;
    }
  }

  // Delete a job posting
  static async deleteJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      return false;
    }
  }

  // Fetch applications for a specific job
  static async getJobApplications(jobId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  // Fetch all applications for a company's jobs
  static async getCompanyApplications(companyId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs!inner(
            company_id,
            title
          )
        `)
        .eq('jobs.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company applications:', error);
      return [];
    }
  }

  // Submit a new application
  static async submitApplication(applicationData: Omit<Application, 'id' | 'created_at' | 'updated_at'>): Promise<Application | null> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting application:', error);
      return null;
    }
  }

  // Update application status
  static async updateApplicationStatus(applicationId: string, status: Application['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }

  // Get jobs pending moderation (for admin)
  static async getPendingJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['pending', 'under_review', 'flagged'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      return [];
    }
  }

  // Get jobs by moderation status
  static async getJobsByModerationStatus(status: string[]): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('status', status)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching jobs by moderation status:', error);
      return [];
    }
  }

  // Approve a job posting
  static async approveJob(jobId: string, moderatorId?: string, notes?: string): Promise<Job | null> {
    try {
      const updates: any = {
        status: 'active',
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (moderatorId) {
        updates.moderated_by = moderatorId;
      }
      
      if (notes) {
        updates.moderation_notes = notes;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving job:', error);
      return null;
    }
  }

  // Reject a job posting
  static async rejectJob(jobId: string, moderatorId?: string, notes?: string): Promise<Job | null> {
    try {
      const updates: any = {
        status: 'rejected',
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (moderatorId) {
        updates.moderated_by = moderatorId;
      }
      
      if (notes) {
        updates.moderation_notes = notes;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error rejecting job:', error);
      return null;
    }
  }

  // Flag a job for review
  static async flagJob(jobId: string, reason: string, moderatorId?: string): Promise<Job | null> {
    try {
      const updates: any = {
        status: 'flagged',
        flagged_reason: reason,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        priority: 'high'
      };
      
      if (moderatorId) {
        updates.moderated_by = moderatorId;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error flagging job:', error);
      return null;
    }
  }

  // Request edits for a job posting
  static async requestJobEdits(jobId: string, notes: string, moderatorId?: string): Promise<Job | null> {
    try {
      const updates: any = {
        status: 'under_review',
        moderation_notes: notes,
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (moderatorId) {
        updates.moderated_by = moderatorId;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting job edits:', error);
      return null;
    }
  }

  // Update job priority for moderation queue
  static async updateJobPriority(jobId: string, priority: 'low' | 'normal' | 'high' | 'urgent'): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ 
          priority, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', jobId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating job priority:', error);
      return null;
    }
  }

  // Get moderation statistics
  static async getModerationStats(): Promise<{
    total: number;
    pending: number;
    under_review: number;
    flagged: number;
    approved_today: number;
    rejected_today: number;
    avg_review_time: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all jobs for counting
      const { data: allJobs, error: allError } = await supabase
        .from('jobs')
        .select('status, created_at, moderated_at');
      
      if (allError) throw allError;
      
      const jobs = allJobs || [];
      
      const stats = {
        total: jobs.length,
        pending: jobs.filter(j => j.status === 'pending').length,
        under_review: jobs.filter(j => j.status === 'under_review').length,
        flagged: jobs.filter(j => j.status === 'flagged').length,
        approved_today: jobs.filter(j => 
          j.status === 'active' && 
          j.moderated_at && 
          new Date(j.moderated_at) >= today
        ).length,
        rejected_today: jobs.filter(j => 
          j.status === 'rejected' && 
          j.moderated_at && 
          new Date(j.moderated_at) >= today
        ).length,
        avg_review_time: this.calculateAverageReviewTime(jobs)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching moderation stats:', error);
      return {
        total: 0,
        pending: 0,
        under_review: 0,
        flagged: 0,
        approved_today: 0,
        rejected_today: 0,
        avg_review_time: 0
      };
    }
  }

  // Helper function to calculate average review time
  private static calculateAverageReviewTime(jobs: any[]): number {
    const moderatedJobs = jobs.filter(j => 
      j.moderated_at && 
      (j.status === 'active' || j.status === 'rejected')
    );
    
    if (moderatedJobs.length === 0) return 0;
    
    const totalTime = moderatedJobs.reduce((sum, job) => {
      const created = new Date(job.created_at).getTime();
      const moderated = new Date(job.moderated_at).getTime();
      return sum + (moderated - created);
    }, 0);
    
    // Return average time in hours
    return Math.round(totalTime / moderatedJobs.length / (1000 * 60 * 60) * 10) / 10;
  }

  // Bulk approve jobs
  static async bulkApproveJobs(jobIds: string[], moderatorId?: string, notes?: string): Promise<number> {
    try {
      const updates: any = {
        status: 'active',
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (moderatorId) {
        updates.moderated_by = moderatorId;
      }
      
      if (notes) {
        updates.moderation_notes = notes;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .in('id', jobIds)
        .select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error bulk approving jobs:', error);
      return 0;
    }
  }

  // Bulk reject jobs
  static async bulkRejectJobs(jobIds: string[], moderatorId?: string, notes?: string): Promise<number> {
    try {
      const updates: any = {
        status: 'rejected',
        moderated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (moderatorId) {
        updates.moderated_by = moderatorId;
      }
      
      if (notes) {
        updates.moderation_notes = notes;
      }

      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .in('id', jobIds)
        .select('id');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error bulk rejecting jobs:', error);
      return 0;
    }
  }

  // Convert salary range to display string
  static formatSalaryRange(job: Job): string {
    if (job.salary_min && job.salary_max) {
      return `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`;
    } else if (job.salary_min) {
      return `₹${job.salary_min.toLocaleString()}+`;
    } else if (job.salary_max) {
      return `Up to ₹${job.salary_max.toLocaleString()}`;
    }
    return 'Salary not specified';
  }

  // Format job type for display
  static formatJobType(type: string): string {
    switch (type) {
      case 'full-time':
        return 'Full-time';
      case 'part-time':
        return 'Part-time';
      case 'contract':
        return 'Contract';
      case 'remote':
        return 'Remote';
      default:
        return type;
    }
  }

  // Format experience level for display
  static formatExperience(experience: string): string {
    switch (experience) {
      case 'entry':
        return 'Entry Level (0-2 years)';
      case 'mid':
        return 'Mid Level (2-5 years)';
      case 'senior':
        return 'Senior Level (5-10 years)';
      case 'lead':
        return 'Lead/Principal (10+ years)';
      default:
        return experience;
    }
  }

  // Calculate time since posted
  static getTimeAgo(dateString: string): string {
    const now = new Date();
    const posted = new Date(dateString);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return posted.toLocaleDateString();
    }
  }
}