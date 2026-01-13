export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  description: string;
  requirements: string[];
  responsibilities: string[];
  postedDate: Date;
  status: 'draft' | 'pending' | 'live' | 'filled' | 'paused';
  skills: string[];
  experience: string;
  applicantCount: number;
}

export interface Application {
  id: string;
  jobId: string;
  applicantName: string;
  phone: string;
  email?: string;
  resumeUrl?: string;
  voiceTranscript?: string;
  skills: string[];
  status: 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedDate: Date;
  method: 'upload' | 'voice';
  matchScore: number;
}

export interface Employer {
  id: string;
  companyName: string;
  email: string;
  verified: boolean;
  activeJobs: number;
  totalApplications: number;
  joinedDate: Date;
}

export type Language = 'en' | 'hi' | 'kn';

export interface User {
  id: string;
  role: 'admin' | 'employer' | 'job-seeker';
  name: string;
  email?: string;
}