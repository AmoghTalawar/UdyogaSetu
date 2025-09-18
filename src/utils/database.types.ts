// Database types for TypeScript support
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          created_at?: string;
        };
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          clerk_user_id: string;
          email: string;
          full_name: string;
          role: 'owner' | 'admin' | 'member' | 'viewer';
          permissions: any;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          clerk_user_id: string;
          email: string;
          full_name: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          permissions?: any;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          clerk_user_id?: string;
          email?: string;
          full_name?: string;
          role?: 'owner' | 'admin' | 'member' | 'viewer';
          permissions?: any;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          location: string;
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          description: string;
          requirements: string[];
          benefits: string[];
          experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
          skills: string[];
          application_deadline: string | null;
          contact_email: string;
          status: 'active' | 'paused' | 'closed' | 'draft';
          total_applications: number;
          kiosk_enabled: boolean;
          qr_code_url: string | null;
          video_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          location: string;
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          description: string;
          requirements?: string[];
          benefits?: string[];
          experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
          skills?: string[];
          application_deadline?: string | null;
          contact_email: string;
          status?: 'active' | 'paused' | 'closed' | 'draft';
          total_applications?: number;
          kiosk_enabled?: boolean;
          qr_code_url?: string | null;
          video_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          location?: string;
          job_type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary';
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          description?: string;
          requirements?: string[];
          benefits?: string[];
          experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'executive';
          skills?: string[];
          application_deadline?: string | null;
          contact_email?: string;
          status?: 'active' | 'paused' | 'closed' | 'draft';
          total_applications?: number;
          kiosk_enabled?: boolean;
          qr_code_url?: string | null;
          video_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
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
        };
        Insert: {
          id?: string;
          job_id: string;
          applicant_name: string;
          applicant_email?: string | null;
          applicant_phone: string;
          application_method: 'kiosk_qr' | 'kiosk_voice' | 'online';
          resume_url?: string | null;
          voice_recording_url?: string | null;
          voice_transcript?: string | null;
          cover_letter?: string | null;
          kiosk_id?: string | null;
          submission_location?: string | null;
          status?: 'submitted' | 'under_review' | 'shortlisted' | 'approved' | 'rejected' | 'hired';
          ai_score?: number | null;
          reviewer_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          notification_sent?: boolean;
          notification_sent_at?: string | null;
          notification_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          applicant_name?: string;
          applicant_email?: string | null;
          applicant_phone?: string;
          application_method?: 'kiosk_qr' | 'kiosk_voice' | 'online';
          resume_url?: string | null;
          voice_recording_url?: string | null;
          voice_transcript?: string | null;
          cover_letter?: string | null;
          kiosk_id?: string | null;
          submission_location?: string | null;
          status?: 'submitted' | 'under_review' | 'shortlisted' | 'approved' | 'rejected' | 'hired';
          ai_score?: number | null;
          reviewer_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          notification_sent?: boolean;
          notification_sent_at?: string | null;
          notification_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      uploaded_files: {
        Row: {
          id: string;
          application_id: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          file_category: 'resume' | 'voice_recording' | 'cover_letter' | 'portfolio' | 'other';
          public_url: string;
          is_processed: boolean;
          uploaded_by_method: 'kiosk' | 'web' | 'mobile';
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          application_id?: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          file_type: string;
          file_category: 'resume' | 'voice_recording' | 'cover_letter' | 'portfolio' | 'other';
          public_url: string;
          is_processed?: boolean;
          uploaded_by_method?: 'kiosk' | 'web' | 'mobile';
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          file_type?: string;
          file_category?: 'resume' | 'voice_recording' | 'cover_letter' | 'portfolio' | 'other';
          public_url?: string;
          is_processed?: boolean;
          uploaded_by_method?: 'kiosk' | 'web' | 'mobile';
          uploaded_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          application_id: string;
          recipient_phone: string;
          notification_type: 'approval' | 'rejection' | 'status_update' | 'reminder';
          message: string;
          status: 'pending' | 'sent' | 'failed' | 'delivered';
          provider: 'twilio' | 'whatsapp' | 'sms';
          provider_message_id: string | null;
          error_message: string | null;
          sent_at: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          recipient_phone: string;
          notification_type: 'approval' | 'rejection' | 'status_update' | 'reminder';
          message: string;
          status?: 'pending' | 'sent' | 'failed' | 'delivered';
          provider?: 'twilio' | 'whatsapp' | 'sms';
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          recipient_phone?: string;
          notification_type?: 'approval' | 'rejection' | 'status_update' | 'reminder';
          message?: string;
          status?: 'pending' | 'sent' | 'failed' | 'delivered';
          provider?: 'twilio' | 'whatsapp' | 'sms';
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
      };
      kiosks: {
        Row: {
          id: string;
          kiosk_code: string;
          location_name: string;
          address: string | null;
          city: string | null;
          country: string | null;
          is_active: boolean;
          last_ping: string | null;
          software_version: string | null;
          hardware_info: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kiosk_code: string;
          location_name: string;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          is_active?: boolean;
          last_ping?: string | null;
          software_version?: string | null;
          hardware_info?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kiosk_code?: string;
          location_name?: string;
          address?: string | null;
          city?: string | null;
          country?: string | null;
          is_active?: boolean;
          last_ping?: string | null;
          software_version?: string | null;
          hardware_info?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper types for application workflow
export type ApplicationWithDetails = Database['public']['Tables']['applications']['Row'] & {
  job?: Database['public']['Tables']['jobs']['Row'] & {
    company?: Database['public']['Tables']['companies']['Row'];
  };
  reviewer?: {
    full_name: string;
  };
};

export type JobWithCompany = Database['public']['Tables']['jobs']['Row'] & {
  company?: Database['public']['Tables']['companies']['Row'];
};