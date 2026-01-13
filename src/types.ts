export type Language = 'hi' | 'kn' | 'en';

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
  status: 'active' | 'draft' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  // Additional fields that exist in the actual database
  total_applications?: number;
  kiosk_enabled?: boolean;
  qr_code_url?: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  resumeUrl?: string;
  coverLetter?: string;
  appliedAt: Date;
  status: 'pending' | 'reviewed' | 'interviewed' | 'accepted' | 'rejected';
  voiceIntroUrl?: string;
  transcription?: string;
  aiScore?: number;
  aiSummary?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  description: string;
  website?: string;
  logo?: string;
  industry: string;
  size: string;
  location: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  skills: string[];
  experience?: string;
  education?: string;
  resumeUrl?: string;
  profilePicture?: string;
  createdAt: Date;
}

export interface VoiceRecording {
  id: string;
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  language: Language;
  transcription?: string;
  candidateId?: string;
  jobId?: string;
  createdAt: Date;
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  [key: string]: Translation;
}