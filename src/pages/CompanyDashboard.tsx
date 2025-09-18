import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { supabase } from '../utils/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Job, JobService } from '../services/jobService';
import { ApplicationService, JobApplication, ApplicationStats } from '../services/applicationService';
import { clerkUserIdToUuid } from '../utils/uuidUtils';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { 
  Building2, 
  Plus, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  Download,
  UserPlus,
  Search,
  Bell,
  Settings,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Copy,
  ExternalLink,
  Filter,
  MoreVertical,
  RefreshCw,
  Archive,
  PlayCircle,
  PauseCircle,
  Star,
  TrendingDown,
  Calendar as CalendarIcon,
  FileText,
  Mail,
  Phone,
  Globe
} from 'lucide-react';

interface CompanyDashboardProps {
  onNavigate: (page: string) => void;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  applicants: number;
  posted: string;
  status: 'active' | 'draft' | 'closed';
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  score: number;
  appliedFor: string;
  appliedDate: string;
  status: 'new' | 'reviewed' | 'interview' | 'hired' | 'rejected';
  avatar: string;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for user's posted jobs
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  
  // State for applications
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [applicationStats, setApplicationStats] = useState<ApplicationStats | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [jobApplicationCounts, setJobApplicationCounts] = useState<{ [jobId: string]: number }>({});
  
  // Application filtering state
  const [selectedJobFilter, setSelectedJobFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  
  // Real-time subscription state
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [isConnectedToRealtime, setIsConnectedToRealtime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  // Modal and confirmation states
  const [showConfirmModal, setShowConfirmModal] = useState<{
    type: 'hire' | 'reject' | 'interview' | 'delete';
    applicationId: string;
    applicantName: string;
  } | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<{
    applicationId: string;
    applicantName: string;
    currentNotes?: string;
  } | null>(null);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Enhanced job management state
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [jobFilter, setJobFilter] = useState('all'); // all, active, draft, closed, expired
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [sortBy, setSortBy] = useState('created_at'); // created_at, title, status, applications
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expiredJobs, setExpiredJobs] = useState<Job[]>([]);

  // Fetch user's posted jobs
  // Define utility functions first
  const isJobExpired = (job: Job) => {
    if (!job.application_deadline) return false;
    return new Date(job.application_deadline) < new Date();
  };

  const getJobMetrics = (job: Job) => {
    const applications = jobApplicationCounts[job.id] || 0;
    const isExpired = isJobExpired(job);
    const daysSincePosted = Math.floor(
      (new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return {
      applications,
      isExpired,
      daysSincePosted,
      avgApplicationsPerDay: daysSincePosted > 0 ? Math.round((applications / daysSincePosted) * 10) / 10 : 0
    };
  };

  // Filter applications based on job and status
  const getFilteredApplications = () => {
    let filtered = [...applications];
    
    // Apply job filter
    if (selectedJobFilter) {
      filtered = filtered.filter(app => app.job_id === selectedJobFilter);
    }
    
    // Apply status filter
    if (selectedStatusFilter) {
      filtered = filtered.filter(app => app.status === selectedStatusFilter);
    }
    
    return filtered;
  };

  // Refresh applications data (for real-time updates)
  const refreshApplicationData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const companyId = clerkUserIdToUuid(user.id);
      console.log('🔄 Refreshing application data...');
      
      // Fetch fresh data
      const [applicationsData, statsData, countsData] = await Promise.all([
        ApplicationService.getCompanyApplications(companyId),
        ApplicationService.getCompanyApplicationStats(companyId),
        ApplicationService.getJobApplicationCounts(companyId)
      ]);
      
      setApplications(applicationsData || []);
      
      // Calculate stats directly from the applications data as a fallback
      const directStats = {
        total_applications: (applicationsData || []).length,
        new_applications: (applicationsData || []).filter(app => app.status === 'submitted').length,
        reviewed_applications: (applicationsData || []).filter(app => app.status === 'reviewed').length,
        interview_applications: (applicationsData || []).filter(app => app.status === 'interview_scheduled').length,
        hired_applications: (applicationsData || []).filter(app => app.status === 'hired').length,
        rejected_applications: (applicationsData || []).filter(app => app.status === 'rejected').length,
        applications_this_week: (applicationsData || []).length,
        applications_this_month: (applicationsData || []).length
      };
      
      const finalStats = statsData || directStats;
      
      console.log('📈 Direct stats from applications data:', directStats);
      console.log('📈 Service stats:', statsData);
      console.log('📈 Final stats being set:', finalStats);
      
      setApplicationStats(finalStats);
      setJobApplicationCounts(countsData || {});
      setLastUpdated(new Date());
      
      console.log('✅ Real-time refresh completed');
    } catch (error) {
      console.error('❌ Error refreshing application data:', error);
    }
  }, [user?.id]);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const companyId = clerkUserIdToUuid(user.id);
      console.log('📡 Setting up real-time subscription for company:', companyId);
      
      // Get company job IDs for filtering
      const { data: companyJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId);
      
      if (!companyJobs || companyJobs.length === 0) {
        console.log('No jobs found for real-time subscription');
        return;
      }
      
      const jobIds = companyJobs.map(job => job.id);
      
      // Create a channel for real-time updates - listen to both tables
      const channel = supabase
        .channel(`company_applications_${companyId}`)
        // Listen to applications table (QR/kiosk applications)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'applications',
            filter: `job_id=in.(${jobIds.join(',')})`
          },
          (payload) => {
            console.log('🔴 Real-time applications table update:', payload);
            handleRealtimeUpdate(payload);
          }
        )
        // Listen to job_applications table (voice applications)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public', 
            table: 'job_applications',
            filter: `job_id=in.(${jobIds.join(',')})`
          },
          (payload) => {
            console.log('🔴 Real-time job_applications table update:', payload);
            handleRealtimeUpdate(payload);
          }
        )
        .on('presence', { event: 'sync' }, () => {
          console.log('👥 Real-time presence synced');
        })
        .subscribe((status) => {
          console.log('📡 Real-time subscription status:', status);
          setIsConnectedToRealtime(status === 'SUBSCRIBED');
        });
      
      setRealtimeChannel(channel);
      
    } catch (error) {
      console.error('❌ Error setting up real-time subscription:', error);
    }
  }, [user?.id, refreshApplicationData]);

  // Handle real-time updates from both tables
  const handleRealtimeUpdate = useCallback((payload: any) => {
    // Show notifications and update counters
    if (payload.eventType === 'INSERT') {
      const applicantName = payload.new?.applicant_name || 'Someone';
      setRealtimeNotification(`🎉 New application from ${applicantName}`);
      setNewApplicationsCount(prev => prev + 1);
      console.log('📨 New application received!');
      
      // Play notification sound (if supported)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJXfH8N2QQAoUXrTp66hVFApGn+DyvGsbAzOG0/LaeDIGJXnN8OOYTwoPaL3s7aFSAg==');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore errors if audio fails
      } catch (e) {}
      
      // Clear notification after 5 seconds
      setTimeout(() => setRealtimeNotification(null), 5000);
    } else if (payload.eventType === 'UPDATE') {
      const applicantName = payload.new?.applicant_name || 'Application';
      const oldStatus = payload.old?.status;
      const newStatus = payload.new?.status;
      
      if (oldStatus !== newStatus) {
        setRealtimeNotification(`📝 ${applicantName} moved to ${newStatus}`);
        console.log('📝 Status change:', oldStatus, '->', newStatus);
      } else {
        setRealtimeNotification(`📝 ${applicantName} updated`);
      }
      console.log('📝 Application updated!');
      
      setTimeout(() => setRealtimeNotification(null), 3000);
    }
    
    // Always refresh the data when there's any update
    if (autoRefreshEnabled) {
      console.log('🔄 Auto-refreshing data after real-time update...');
      refreshApplicationData();
    }
  }, [autoRefreshEnabled, refreshApplicationData]);

  // Action handlers for application management
  const handleMarkReviewed = async (applicationId: string, applicantName: string) => {
    try {
      console.log('🔄 Updating status to reviewed for:', applicantName, applicationId);
      setProcessingAction(applicationId);
      
      await ApplicationService.updateApplicationStatus(applicationId, 'reviewed');
      console.log('✅ Status update successful');
      
      setRealtimeNotification(`✓ ${applicantName} marked as reviewed`);
      setTimeout(() => setRealtimeNotification(null), 3000);
      
      // Force refresh of both applications and stats
      setTimeout(async () => {
        console.log('🔄 Force refreshing after status update...');
        await refreshApplicationData();
        
        // Also force stats refresh
        const companyId = clerkUserIdToUuid(user?.id || '');
        const freshStats = await ApplicationService.getCompanyApplicationStats(companyId);
        console.log('📈 Fresh stats after update:', freshStats);
        setApplicationStats(freshStats);
      }, 1000); // Wait a bit longer
      
    } catch (error) {
      console.error('❌ Error marking as reviewed:', error);
      setRealtimeNotification(`❌ Failed to update ${applicantName}: ${error.message}`);
      setTimeout(() => setRealtimeNotification(null), 5000);
    } finally {
      setTimeout(() => setProcessingAction(null), 1000); // Keep processing state a bit longer
    }
  };

  const handleScheduleInterview = (applicationId: string, applicantName: string) => {
    setShowNotesModal({ 
      applicationId, 
      applicantName, 
      currentNotes: interviewNotes 
    });
  };

  const confirmScheduleInterview = async () => {
    if (!showNotesModal) return;
    
    try {
      setProcessingAction(showNotesModal.applicationId);
      await ApplicationService.updateApplicationStatus(
        showNotesModal.applicationId, 
        'interview_scheduled',
        interviewNotes || 'Interview scheduled'
      );
      setRealtimeNotification(`📅 Interview scheduled for ${showNotesModal.applicantName}`);
      setTimeout(() => setRealtimeNotification(null), 3000);
      
      // TODO: Send email/SMS notification to applicant
      console.log('📧 TODO: Send interview notification to applicant');
      
      setShowNotesModal(null);
      setInterviewNotes('');
      await refreshApplicationData();
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setRealtimeNotification(`❌ Failed to schedule interview`);
      setTimeout(() => setRealtimeNotification(null), 3000);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleHire = (applicationId: string, applicantName: string) => {
    setShowConfirmModal({ type: 'hire', applicationId, applicantName });
  };

  const confirmHire = async () => {
    if (!showConfirmModal) return;
    
    try {
      setProcessingAction(showConfirmModal.applicationId);
      await ApplicationService.updateApplicationStatus(
        showConfirmModal.applicationId, 
        'hired',
        'Congratulations! You have been selected for the position.'
      );
      setRealtimeNotification(`🎉 ${showConfirmModal.applicantName} has been hired!`);
      setTimeout(() => setRealtimeNotification(null), 5000);
      
      // TODO: Send congratulations email/SMS
      console.log('📧 TODO: Send hiring confirmation to applicant');
      
      setShowConfirmModal(null);
      
      // Force refresh both applications and stats with delay for DB consistency
      setTimeout(async () => {
        await refreshApplicationData();
        const companyId = clerkUserIdToUuid(user?.id || '');
        const freshStats = await ApplicationService.getCompanyApplicationStats(companyId);
        console.log('📈 Fresh stats after hire:', freshStats);
        setApplicationStats(freshStats);
      }, 500); // Small delay to ensure DB write has completed
    } catch (error) {
      console.error('Error hiring applicant:', error);
      setRealtimeNotification(`❌ Failed to hire ${showConfirmModal.applicantName}`);
      setTimeout(() => setRealtimeNotification(null), 3000);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = (applicationId: string, applicantName: string) => {
    setShowConfirmModal({ type: 'reject', applicationId, applicantName });
  };

  const handleDeleteApplication = (applicationId: string, applicantName: string) => {
    setShowConfirmModal({ type: 'delete', applicationId, applicantName });
  };

  const confirmReject = async () => {
    if (!showConfirmModal) return;
    
    try {
      setProcessingAction(showConfirmModal.applicationId);
      const rejectionMessage = rejectionReason || 'Thank you for your interest. We have decided to move forward with other candidates.';
      
      await ApplicationService.updateApplicationStatus(
        showConfirmModal.applicationId, 
        'rejected',
        rejectionMessage
      );
      setRealtimeNotification(`❌ ${showConfirmModal.applicantName} application rejected`);
      setTimeout(() => setRealtimeNotification(null), 3000);
      
      // TODO: Send rejection email/SMS
      console.log('📧 TODO: Send rejection notification to applicant');
      
      setShowConfirmModal(null);
      setRejectionReason('');
      
      // Force refresh both applications and stats with delay for DB consistency
      setTimeout(async () => {
        await refreshApplicationData();
        const companyId = clerkUserIdToUuid(user?.id || '');
        const freshStats = await ApplicationService.getCompanyApplicationStats(companyId);
        console.log('📈 Fresh stats after reject:', freshStats);
        setApplicationStats(freshStats);
      }, 500); // Small delay to ensure DB write has completed
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      setRealtimeNotification(`❌ Failed to reject application`);
      setTimeout(() => setRealtimeNotification(null), 3000);
    } finally {
      setProcessingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!showConfirmModal) return;
    
    try {
      setProcessingAction(showConfirmModal.applicationId);
      
      await ApplicationService.deleteApplication(showConfirmModal.applicationId);
      
      setRealtimeNotification(`🗑️ ${showConfirmModal.applicantName} application deleted`);
      setTimeout(() => setRealtimeNotification(null), 3000);
      
      setShowConfirmModal(null);
      
      // Force refresh both applications and stats with delay for DB consistency
      setTimeout(async () => {
        await refreshApplicationData();
        const companyId = clerkUserIdToUuid(user?.id || '');
        const freshStats = await ApplicationService.getCompanyApplicationStats(companyId);
        console.log('📈 Fresh stats after delete:', freshStats);
        setApplicationStats(freshStats);
      }, 500); // Small delay to ensure DB write has completed
      
    } catch (error) {
      console.error('Error deleting application:', error);
      setRealtimeNotification(`❌ Failed to delete application`);
      setTimeout(() => setRealtimeNotification(null), 3000);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewResume = (resumeUrl: string, applicantName: string) => {
    if (!resumeUrl) {
      setRealtimeNotification(`❌ No resume available for ${applicantName}`);
      setTimeout(() => setRealtimeNotification(null), 3000);
      return;
    }
    
    // Open resume in new tab
    window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    
    // Track resume view (for analytics)
    console.log('📄 Resume viewed for:', applicantName);
  };

  const handleContactApplicant = (email: string, phone: string, applicantName: string, jobTitle: string, method: 'email' | 'call') => {
    if (method === 'email') {
      if (!email) {
        setRealtimeNotification(`❌ No email available for ${applicantName}`);
        setTimeout(() => setRealtimeNotification(null), 3000);
        return;
      }
      
      const subject = `Re: Your application for ${jobTitle}`;
      const body = `Dear ${applicantName},\n\nThank you for your interest in the ${jobTitle} position. We would like to discuss your application further.\n\nBest regards,\nHiring Team`;
      
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } else if (method === 'call') {
      if (!phone) {
        setRealtimeNotification(`❌ No phone number available for ${applicantName}`);
        setTimeout(() => setRealtimeNotification(null), 3000);
        return;
      }
      
      // Open phone dialer
      window.open(`tel:${phone}`);
    }
    
    // Track contact attempt
    console.log(`📞 Contact attempt via ${method} for:`, applicantName);
  };

  // Export applications to CSV
  const exportApplicationsToCSV = () => {
    const filteredApps = getFilteredApplications();
    
    if (filteredApps.length === 0) {
      alert('No applications to export');
      return;
    }
    
    // CSV headers
    const headers = [
      'Applicant Name',
      'Email',
      'Phone',
      'Job Title',
      'Application Method',
      'AI Score',
      'Status',
      'Applied Date',
      'Voice Language',
      'Voice Transcript'
    ];
    
    // Convert applications to CSV rows
    const csvRows = filteredApps.map(app => [
      app.applicant_name,
      app.applicant_email || '',
      app.applicant_phone,
      app.job_title,
      app.application_method,
      app.applicant_score || '',
      app.status,
      new Date(app.applied_at).toLocaleDateString(),
      app.voice_language || '',
      app.voice_transcript ? app.voice_transcript.replace(/"/g, '""') : '' // Escape quotes
    ]);
    
    // Create CSV content
    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchUserJobs = async () => {
    if (!user?.id) return;
    
    setLoadingJobs(true);
    try {
      // Convert Clerk user ID to UUID format
      const companyId = clerkUserIdToUuid(user.id);
      console.log('🔍 Fetching jobs for user:', user.id);
      console.log('🔍 Converted company ID:', companyId);
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }
      
      console.log('✅ Raw jobs data from database:', data);
      console.log('📊 Number of jobs found:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.log('📝 No jobs found in database, this is normal if no jobs have been posted yet');
        setUserJobs([]);
        setExpiredJobs([]);
        return;
      }
      
      // Transform data to match Job interface
      const transformedJobs: Job[] = data.map(job => {
        console.log('🔄 Processing job:', job.title, job);
        
        const transformedJob = {
          id: job.id,
          title: job.title,
          company: job.company_name || job.company || 'Company Name',
          company_name: job.company_name || job.company || 'Company Name',
          company_about: job.company_about || 'Company description',
          location: job.location,
          job_type: job.job_type,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_currency: job.salary_currency,
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          experience_level: job.experience_level,
          skills: job.skills,
          application_deadline: job.application_deadline,
          contact_email: job.contact_email,
          company_id: job.company_id,
          status: job.status,
          created_at: job.created_at,
          updated_at: job.updated_at,
          kiosk_enabled: job.kiosk_enabled,
          total_applications: job.total_applications,
          qr_code_url: job.qr_code_url,
          salary: job.salary_min && job.salary_max 
            ? `₹${job.salary_min?.toLocaleString()} - ₹${job.salary_max?.toLocaleString()}`
            : job.salary_min 
            ? `₹${job.salary_min?.toLocaleString()}+`
            : 'Salary not specified',
          applicants: jobApplicationCounts[job.id] || 0,
          posted: new Date(job.created_at).toLocaleDateString(),
          // Add metrics
          isExpired: job.application_deadline ? new Date(job.application_deadline) < new Date() : false,
          daysSincePosted: Math.floor((new Date().getTime() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          avgApplicationsPerDay: 0 // Will be calculated later
        };
        
        // Calculate average applications per day
        const applications = jobApplicationCounts[job.id] || 0;
        transformedJob.avgApplicationsPerDay = transformedJob.daysSincePosted > 0 
          ? Math.round((applications / transformedJob.daysSincePosted) * 10) / 10 
          : 0;
        
        return transformedJob;
      });
      
      console.log('✅ Transformed jobs:', transformedJobs);
      setUserJobs(transformedJobs);
      setExpiredJobs(transformedJobs.filter(job => isJobExpired(job)));
      
    } catch (error) {
      console.error('❌ Error fetching user jobs:', error);
      console.log('🔧 This could be due to:');
      console.log('   - Database connection issues');
      console.log('   - Missing company_name/company_about columns (run fix_jobs_table.sql)');
      console.log('   - RLS policies blocking access');
      console.log('   - No jobs posted yet');
      
      // Only show sample job if it's actually a database error
      if (error.message && !error.message.includes('company_name')) {
        setUserJobs([{
          id: 'sample-1',
          title: 'Database Connection Issue - Please check setup',
          company: 'System Message',
          company_name: 'System Message',
          location: 'Check DATABASE_SETUP.md',
          job_type: 'full-time',
          salary: 'N/A',
          applicants: 0,
          posted: 'System',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as any]);
      } else {
        // For other errors, just show empty state
        setUserJobs([]);
      }
      
    } finally {
      setLoadingJobs(false);
    }
  };

  
  useEffect(() => {
    fetchUserJobs();
  }, [user?.id, jobApplicationCounts]);

  // Fetch application data
  useEffect(() => {
    const fetchApplicationData = async () => {
      if (!user?.id) return;
      
      setLoadingApplications(true);
      try {
        // Convert Clerk user ID to UUID format
        const companyId = clerkUserIdToUuid(user.id);
        console.log('📋 Starting application fetch...');
        console.log('👤 User ID:', user.id);
        console.log('🏢 Company ID:', companyId);
        
        // Show this in the UI temporarily for debugging
        if (typeof window !== 'undefined') {
          console.log('📢 DEBUG INFO (check console):');
          console.log('Your Clerk User ID:', user.id);
          console.log('Generated Company UUID:', companyId);
        }
        
        // Fetch applications and stats in parallel
        const [applicationsData, statsData, countsData] = await Promise.all([
          ApplicationService.getCompanyApplications(companyId),
          ApplicationService.getCompanyApplicationStats(companyId),
          ApplicationService.getJobApplicationCounts(companyId)
        ]);
        
        // Handle potentially undefined responses
        setApplications(applicationsData || []);
        setApplicationStats(statsData || {
          total_applications: 0,
          new_applications: 0,
          reviewed_applications: 0,
          interview_applications: 0,
          hired_applications: 0,
          rejected_applications: 0,
          applications_this_week: 0,
          applications_this_month: 0
        });
        setJobApplicationCounts(countsData || {});
        
        console.log('Loaded applications:', (applicationsData || []).length);
        console.log('Application stats from service:', statsData);
        
        // Force a manual stats calculation if the service returns zero stats
        if (!statsData || statsData.total_applications === 0) {
          console.log('🔄 Service returned empty stats, forcing manual refresh...');
          setTimeout(async () => {
            const manualStats = await ApplicationService.getCompanyApplicationStats(companyId);
            console.log('📈 Manual stats result:', manualStats);
            setApplicationStats(manualStats);
          }, 1000);
        }
      } catch (error) {
        console.error('Error loading application data:', error);
        console.log('This is normal if you haven\'t set up the application system yet.');
        
        // Set empty state on error
        setApplications([]);
        setApplicationStats({
          total_applications: 0,
          new_applications: 0,
          reviewed_applications: 0,
          interview_applications: 0,
          hired_applications: 0,
          rejected_applications: 0,
          applications_this_week: 0,
          applications_this_month: 0
        });
        setJobApplicationCounts({});
      } finally {
        setLoadingApplications(false);
      }
    };
    
    fetchApplicationData();
  }, [user?.id]);

  // Setup and cleanup real-time subscription
  useEffect(() => {
    if (activeTab === 'applicants' && user?.id) {
      setupRealtimeSubscription();
    }
    
    // Cleanup function
    return () => {
      if (realtimeChannel) {
        console.log('📡 Cleaning up real-time subscription');
        supabase.removeChannel(realtimeChannel);
        setRealtimeChannel(null);
        setIsConnectedToRealtime(false);
      }
    };
  }, [activeTab, user?.id, setupRealtimeSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  // Periodic refresh when auto-refresh is enabled (every 30 seconds)
  useEffect(() => {
    if (!autoRefreshEnabled || activeTab !== 'applicants') return;
    
    const interval = setInterval(() => {
      console.log('🔄 Periodic refresh triggered');
      refreshApplicationData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefreshEnabled, activeTab, refreshApplicationData]);

  // Focus-based refresh (refresh when user returns to tab)
  useEffect(() => {
    if (activeTab !== 'applicants') return;
    
    const handleFocus = () => {
      console.log('🔄 Window focus refresh');
      refreshApplicationData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab, refreshApplicationData]);

  // Filter and sort jobs based on current settings
  const getFilteredJobs = () => {
    let filtered = [...userJobs];
    
    // Apply status filter
    if (jobFilter === 'active') {
      filtered = filtered.filter(job => job.status === 'active');
    } else if (jobFilter === 'draft') {
      filtered = filtered.filter(job => job.status === 'draft');
    } else if (jobFilter === 'closed') {
      filtered = filtered.filter(job => job.status === 'closed');
    } else if (jobFilter === 'expired') {
      filtered = filtered.filter(job => isJobExpired(job));
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'applications':
          aValue = jobApplicationCounts[a.id] || 0;
          bValue = jobApplicationCounts[b.id] || 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return filtered;
  };
  
  const filteredJobs = getFilteredJobs();
  
  const stats = {
    activeJobs: userJobs.filter(job => job.status === 'active').length,
    draftJobs: userJobs.filter(job => job.status === 'draft').length,
    closedJobs: userJobs.filter(job => job.status === 'closed').length,
    expiredJobs: userJobs.filter(job => isJobExpired(job)).length,
    totalJobs: userJobs.length,
    newApplications: applicationStats?.new_applications || 0,
    totalApplications: applicationStats?.total_applications || 0,
    totalHires: applicationStats?.hired_applications || 0,
    applicationsThisWeek: applicationStats?.applications_this_week || 0,
    applicationsThisMonth: applicationStats?.applications_this_month || 0,
    avgTimeToInterview: 5, // TODO: Calculate this from interview data
    conversionRate: applicationStats?.total_applications ? 
      Math.round((applicationStats.hired_applications / applicationStats.total_applications) * 100) : 0
  };

  // Generate recent activity from application data
  const recentActivity = applications.slice(0, 5).map(app => {
    const timeDiff = new Date().getTime() - new Date(app.applied_at).getTime();
    const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);
    
    let timeStr = '';
    if (daysAgo > 0) {
      timeStr = `${daysAgo}d ago`;
    } else if (hoursAgo > 0) {
      timeStr = `${hoursAgo}h ago`;
    } else {
      timeStr = 'Just now';
    }
    
    return {
      id: app.id,
      type: 'application',
      message: `New applicant: ${app.applicant_name}`,
      detail: `Applied for ${app.job_title} via ${app.application_method === 'voice' ? 'Voice' : 'QR Code'}`,
      time: timeStr,
      icon: Users
    };
  });

  const handleSignOut = () => {
    signOut();
    onNavigate('home');
  };

  // Enhanced job management functions
  const handleDeleteJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      const success = await JobService.deleteJob(jobId);
      if (success) {
        setUserJobs(prev => prev.filter(job => job.id !== jobId));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateJob = async (job: Job) => {
    try {
      const duplicatedJob = {
        ...job,
        title: `${job.title} (Copy)`,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      delete duplicatedJob.id;
      
      const result = await JobService.createJob(duplicatedJob);
      if (result) {
        // Refresh jobs list
        fetchUserJobs();
      }
    } catch (error) {
      console.error('Error duplicating job:', error);
      alert('Failed to duplicate job. Please try again.');
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      const result = await JobService.updateJob(jobId, { status: newStatus });
      if (result) {
        setUserJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Failed to update job status. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const deletePromises = Array.from(selectedJobs).map(jobId => 
        JobService.deleteJob(jobId)
      );
      await Promise.all(deletePromises);
      setUserJobs(prev => prev.filter(job => !selectedJobs.has(job.id)));
      setSelectedJobs(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk deleting jobs:', error);
      alert('Failed to delete some jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    setIsLoading(true);
    try {
      const updatePromises = Array.from(selectedJobs).map(jobId => 
        JobService.updateJob(jobId, { status })
      );
      await Promise.all(updatePromises);
      setUserJobs(prev => prev.map(job => 
        selectedJobs.has(job.id) ? { ...job, status } : job
      ));
      setSelectedJobs(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error bulk updating job status:', error);
      alert('Failed to update some jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch pending jobs for moderation
  const fetchPendingJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setPendingJobs(data || []);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
    }
  };

  // Handle job approval
  const handleApproveJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'active' })
        .eq('id', jobId);

      if (error) throw error;
      
      // Remove from pending jobs
      setPendingJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error approving job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle job rejection
  const handleRejectJob = async (jobId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'rejected' })
        .eq('id', jobId);

      if (error) throw error;
      
      // Remove from pending jobs
      setPendingJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error rejecting job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending jobs when moderation tab is active
  React.useEffect(() => {
    if (activeTab === 'moderation') {
      fetchPendingJobs();
    }
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-orange-100 text-orange-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      // Backwards compatibility
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute 
      onNavigate={onNavigate}
      title="Company Dashboard Access"
      subtitle="Please sign in to access your company dashboard"
    >
      <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/udyoga-setu-logo.png" 
                  alt="Udyoga Setu" 
                  className="w-8 h-8 logo-stable"
                  width="32"
                  height="32"
                  style={{width: '32px', height: '32px', maxWidth: '32px', maxHeight: '32px'}}
                />
                <span className="text-xl font-bold text-gray-900">
                  Udyoga Setu
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="flex items-center space-x-3">
                <img
                  src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.fullName || 'John Doe'}</div>
                  <div className="text-gray-500">Employer</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'jobs' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Jobs</span>
              </button>
              
              <button
                onClick={() => setActiveTab('applicants')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'applicants' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Applicants</span>
              </button>
              
              <button
                onClick={() => setActiveTab('moderation')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'moderation' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Flag className="w-5 h-5" />
                <span>Job Moderation</span>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                  activeTab === 'account' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Account</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex space-x-3">
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download applicants CSV</span>
                  </button>
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Invite team member</span>
                  </button>
                  <button
                    onClick={() => onNavigate('post-job')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post a job</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-blue-100 text-sm mb-1">Active Jobs</div>
                      <div className="text-3xl font-bold">{stats.activeJobs}</div>
                      <div className="text-blue-200 text-sm mt-1">
                        {stats.draftJobs} drafts, {stats.expiredJobs} expired
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-green-100 text-sm mb-1">Total Applications</div>
                      <div className="text-3xl font-bold">{stats.totalApplications}</div>
                      <div className="text-green-200 text-sm mt-1">
                        {stats.newApplications} new this week
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-purple-100 text-sm mb-1">Success Rate</div>
                      <div className="text-3xl font-bold">{stats.conversionRate}%</div>
                      <div className="text-purple-200 text-sm mt-1">
                        {stats.totalHires} hires total
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-orange-100 text-sm mb-1">This Month</div>
                      <div className="text-3xl font-bold">{stats.applicationsThisMonth}</div>
                      <div className="text-orange-200 text-sm mt-1">
                        {stats.applicationsThisWeek} this week
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expired Jobs Warning */}
              {stats.expiredJobs > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        You have {stats.expiredJobs} expired job{stats.expiredJobs > 1 ? 's' : ''} that may need attention.
                        <button 
                          onClick={() => {
                            setActiveTab('jobs');
                            setJobFilter('expired');
                          }}
                          className="ml-2 font-medium underline hover:no-underline"
                        >
                          View expired jobs
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Performance</h3>
                  <div className="space-y-4">
                    {userJobs.filter(job => job.status === 'active').slice(0, 5).map(job => {
                      const metrics = getJobMetrics(job);
                      return (
                        <div key={job.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">
                              Posted {metrics.daysSincePosted} days ago
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600">{metrics.applications}</div>
                            <div className="text-xs text-gray-500">applications</div>
                          </div>
                        </div>
                      );
                    })}
                    {userJobs.filter(job => job.status === 'active').length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No active jobs to display</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => onNavigate('post-job')}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Post New Job</div>
                        <div className="text-sm text-gray-500">Create a new job posting</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('applicants')}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Review Applications</div>
                        <div className="text-sm text-gray-500">{stats.newApplications} new applications</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab('jobs');
                        setJobFilter('draft');
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Edit className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Manage Drafts</div>
                        <div className="text-sm text-gray-500">{stats.draftJobs} draft jobs</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                </div>
                <div className="divide-y">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="p-6 flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{activity.message}</div>
                          <div className="text-sm text-gray-500">{activity.detail}</div>
                        </div>
                        <div className="text-sm text-gray-500">{activity.time}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              {/* Jobs Header */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
                  <p className="text-gray-600 mt-1">
                    Manage your job postings and track their performance
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchUserJobs}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    disabled={loadingJobs}
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingJobs ? 'animate-spin' : ''}`} />
                    <span>{loadingJobs ? 'Loading...' : 'Refresh Jobs'}</span>
                  </button>
                  
                  <button
                    onClick={() => onNavigate('post-job')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post New Job</span>
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.activeJobs}</div>
                      <div className="text-sm text-gray-600">Active Jobs</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <PauseCircle className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.draftJobs}</div>
                      <div className="text-sm text-gray-600">Draft Jobs</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.expiredJobs}</div>
                      <div className="text-sm text-gray-600">Expired Jobs</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
                      <div className="text-sm text-gray-600">Total Applications</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filters and Controls */}
              <div className="bg-white rounded-lg shadow-sm border mb-6">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      {/* Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Status Filter */}
                      <select
                        value={jobFilter}
                        onChange={(e) => setJobFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Jobs ({userJobs.length})</option>
                        <option value="active">Active ({stats.activeJobs})</option>
                        <option value="draft">Draft ({stats.draftJobs})</option>
                        <option value="closed">Closed ({stats.closedJobs})</option>
                        <option value="expired">Expired ({stats.expiredJobs})</option>
                      </select>
                      
                      {/* Sort Options */}
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [field, order] = e.target.value.split('-');
                          setSortBy(field);
                          setSortOrder(order as 'asc' | 'desc');
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="created_at-desc">Newest First</option>
                        <option value="created_at-asc">Oldest First</option>
                        <option value="title-asc">Title A-Z</option>
                        <option value="title-desc">Title Z-A</option>
                        <option value="applications-desc">Most Applications</option>
                        <option value="applications-asc">Least Applications</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {/* Bulk Actions */}
                      {selectedJobs.size > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {selectedJobs.size} selected
                          </span>
                          <button
                            onClick={() => handleBulkStatusChange('active')}
                            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleBulkStatusChange('draft')}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200"
                          >
                            Draft
                          </button>
                          <button
                            onClick={handleBulkDelete}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      
                      {/* View Mode Toggle */}
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jobs List/Grid */}
              {loadingJobs ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your jobs...</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  {userJobs.length === 0 ? (
                    <>
                      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                      <p className="text-gray-500 mb-4">Get started by posting your first job opening.</p>
                      <button
                        onClick={() => onNavigate('post-job')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Post Your First Job</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs match your filters</h3>
                      <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setJobFilter('all');
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear filters
                      </button>
                    </>
                  )}
                </div>
              ) : viewMode === 'list' ? (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="divide-y">
                    {filteredJobs.map((job) => {
                      const metrics = getJobMetrics(job);
                      return (
                        <div key={job.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <input
                                type="checkbox"
                                checked={selectedJobs.has(job.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(selectedJobs);
                                  if (e.target.checked) {
                                    newSelected.add(job.id);
                                  } else {
                                    newSelected.delete(job.id);
                                  }
                                  setSelectedJobs(newSelected);
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                    {job.status}
                                  </span>
                                  {metrics.isExpired && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                      Expired
                                    </span>
                                  )}
                                  {job.status === 'active' && metrics.applications === 0 && metrics.daysSincePosted > 7 && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                      No applications
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span>{job.salary}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Posted {metrics.daysSincePosted}d ago</span>
                                  </div>
                                  {job.application_deadline && (
                                    <div className="flex items-center space-x-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm">
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <Users className="w-4 h-4" />
                                    <span>{metrics.applications} applications</span>
                                  </div>
                                  {metrics.avgApplicationsPerDay > 0 && (
                                    <div className="flex items-center space-x-1 text-green-600">
                                      <TrendingUp className="w-4 h-4" />
                                      <span>{metrics.avgApplicationsPerDay}/day avg</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {/* Job Actions */}
                              <button
                                onClick={() => onNavigate('browse-jobs')}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="View public listing"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDuplicateJob(job)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                title="Duplicate job"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleToggleJobStatus(job.id, job.status)}
                                className={`p-2 rounded ${
                                  job.status === 'active' 
                                    ? 'text-yellow-600 hover:bg-yellow-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={job.status === 'active' ? 'Pause job' : 'Activate job'}
                              >
                                {job.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                              </button>
                              
                              <button
                                onClick={() => console.log('Edit job', job.id)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit job"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => setShowDeleteConfirm(job.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete job"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => {
                    const metrics = getJobMetrics(job);
                    return (
                      <div key={job.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <input
                                  type="checkbox"
                                  checked={selectedJobs.has(job.id)}
                                  onChange={(e) => {
                                    const newSelected = new Set(selectedJobs);
                                    if (e.target.checked) {
                                      newSelected.add(job.id);
                                    } else {
                                      newSelected.delete(job.id);
                                    }
                                    setSelectedJobs(newSelected);
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                                  {job.status}
                                </span>
                                {metrics.isExpired && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                    Expired
                                  </span>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                              <div className="space-y-1 text-sm text-gray-500 mb-4">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span>{job.salary}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Posted {metrics.daysSincePosted}d ago</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{metrics.applications}</div>
                              <div className="text-xs text-gray-500">Applications</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-gray-900">{metrics.avgApplicationsPerDay}</div>
                              <div className="text-xs text-gray-500">Per day</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleJobStatus(job.id, job.status)}
                              className={`flex-1 px-3 py-2 text-sm rounded ${
                                job.status === 'active' 
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {job.status === 'active' ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(job.id)}
                              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                    <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteConfirm(null)}></div>
                    
                    <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                      <div className="sm:flex sm:items-start">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Delete Job Posting
                          </h3>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Are you sure you want to delete this job? This action cannot be undone and will also remove all associated applications.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={() => handleDeleteJob(showDeleteConfirm)}
                          disabled={isLoading}
                          className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {isLoading ? 'Deleting...' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applicants' && (
            <div>
              {/* Real-time notification toast */}
              {realtimeNotification && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in-right">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-medium">{realtimeNotification}</span>
                    <button 
                      onClick={() => setRealtimeNotification(null)}
                      className="ml-2 text-white hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">Job Applications</h1>
                  
                  {/* Real-time status indicator */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        isConnectedToRealtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      <span className="text-xs font-medium text-gray-700">
                        {isConnectedToRealtime ? 'Live Updates' : 'Offline'}
                      </span>
                      {newApplicationsCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          +{newApplicationsCount}
                        </span>
                      )}
                    </div>
                    
                    {lastUpdated && (
                      <span className="text-xs text-gray-500">
                        Last updated {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Auto-refresh toggle */}
                  <button 
                    onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      autoRefreshEnabled 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={autoRefreshEnabled ? 'Disable auto-refresh' : 'Enable auto-refresh'}
                  >
                    {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  </button>
                  
                  {/* Clear new applications counter */}
                  {newApplicationsCount > 0 && (
                    <button 
                      onClick={() => setNewApplicationsCount(0)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      title="Clear new application counter"
                    >
                      Clear ({newApplicationsCount})
                    </button>
                  )}
                  
                  {/* Manual statistics refresh */}
                  <button 
                    onClick={async () => {
                      console.log('🔄 Manual stats refresh triggered');
                      const companyId = clerkUserIdToUuid(user?.id || '');
                      const freshStats = await ApplicationService.getCompanyApplicationStats(companyId);
                      console.log('📈 Fresh manual stats:', freshStats);
                      setApplicationStats(freshStats);
                      await refreshApplicationData();
                    }}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                    title="Refresh statistics"
                  >
                    Refresh Stats
                  </button>
                  
                  
                  {/* Manual refresh button */}
                  <button 
                    onClick={refreshApplicationData}
                    disabled={loadingApplications}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh applications"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingApplications ? 'animate-spin' : ''}`} />
                  </button>
                  <select 
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All jobs</option>
                    {userJobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All statuses</option>
                    <option value="submitted">New</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="interview_scheduled">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button 
                    onClick={exportApplicationsToCSV}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter Results Counter */}
              {(selectedJobFilter || selectedStatusFilter) && (
                <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Showing {getFilteredApplications().length} of {applications.length} applications
                    </span>
                    {selectedJobFilter && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Job: {userJobs.find(job => job.id === selectedJobFilter)?.title || 'Unknown'}
                      </span>
                    )}
                    {selectedStatusFilter && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Status: {selectedStatusFilter.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedJobFilter('');
                      setSelectedStatusFilter('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Application Stats */}
              {/* Debug current stats */}
              {console.log('📈 Current applicationStats in render:', applicationStats)}
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-blue-600">{applicationStats?.total_applications || 0}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-orange-600">{applicationStats?.new_applications || 0}</div>
                  <div className="text-sm text-gray-600">New Applications</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-purple-600">{applicationStats?.interview_applications || 0}</div>
                  <div className="text-sm text-gray-600">In Interview</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-green-600">{applicationStats?.hired_applications || 0}</div>
                  <div className="text-sm text-gray-600">Hired</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="text-2xl font-bold text-red-600">{applicationStats?.rejected_applications || 0}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>

              {loadingApplications ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading applications...</p>
                </div>
              ) : (() => {
                const filteredApplications = getFilteredApplications();
                return filteredApplications.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {applications.length === 0 ? 'No applications yet' : 'No applications match your filters'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {applications.length === 0 
                        ? 'Applications will appear here when job seekers apply to your posted jobs.'
                        : 'Try adjusting your job or status filters to see more applications.'}
                    </p>
                    {applications.length === 0 && (
                      <button
                        onClick={() => onNavigate('post-job')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Post Your First Job</span>
                      </button>
                    )}
                    {applications.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedJobFilter('');
                          setSelectedStatusFilter('');
                        }}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 inline-flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Clear Filters</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="divide-y">
                      {filteredApplications.map((application) => {
                      const timeDiff = new Date().getTime() - new Date(application.applied_at).getTime();
                      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
                      const daysAgo = Math.floor(hoursAgo / 24);
                      
                      let appliedTimeStr = '';
                      if (daysAgo > 0) {
                        appliedTimeStr = `${daysAgo}d ago`;
                      } else if (hoursAgo > 0) {
                        appliedTimeStr = `${hoursAgo}h ago`;
                      } else {
                        appliedTimeStr = 'Just now';
                      }
                      
                      return (
                        <div key={application.id} className="p-6 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {application.applicant_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="font-semibold text-gray-900 text-lg">{application.applicant_name}</h3>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)} ${
                                    processingAction === application.id ? 'animate-pulse' : ''
                                  }`}>
                                    {processingAction === application.id ? (
                                      <span className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                        <span>UPDATING...</span>
                                      </span>
                                    ) : (
                                      application.status.replace('_', ' ').toUpperCase()
                                    )}
                                  </span>
                                  {application.application_method === 'voice' && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                      🎤 Voice Application
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                  Applied for <span className="font-medium">{application.job_title}</span>
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{application.applicant_phone}</span>
                                  </div>
                                  {application.applicant_email && (
                                    <div className="flex items-center space-x-1">
                                      <Mail className="w-4 h-4" />
                                      <span>{application.applicant_email}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{appliedTimeStr}</span>
                                  </div>
                                  {application.voice_language && (
                                    <div className="flex items-center space-x-1">
                                      <Globe className="w-4 h-4" />
                                      <span>{application.voice_language}</span>
                                    </div>
                                  )}
                                </div>
                                
                                
                                {/* Voice Transcript Preview */}
                                {application.voice_transcript && (
                                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Voice Application Summary:</h4>
                                    <p className="text-sm text-gray-700 line-clamp-3">
                                      {application.voice_transcript.length > 150 
                                        ? `${application.voice_transcript.substring(0, 150)}...` 
                                        : application.voice_transcript}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                  {application.resume_url && (
                                    <button 
                                      onClick={() => handleViewResume(application.resume_url, application.applicant_name)}
                                      className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span>View Resume</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  )}
                                  
                                  {application.status === 'submitted' && (
                                    <>
                                      <button 
                                        onClick={() => handleMarkReviewed(application.id, application.applicant_name)}
                                        disabled={processingAction === application.id}
                                        className="inline-flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                                      >
                                        {processingAction === application.id ? (
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Eye className="w-4 h-4" />
                                        )}
                                        <span>Mark Reviewed</span>
                                      </button>
                                      <button 
                                        onClick={() => handleScheduleInterview(application.id, application.applicant_name)}
                                        disabled={processingAction === application.id}
                                        className="inline-flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 text-sm rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
                                      >
                                        {processingAction === application.id ? (
                                          <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Calendar className="w-4 h-4" />
                                        )}
                                        <span>Schedule Interview</span>
                                      </button>
                                    </>
                                  )}
                                  
                                  {(application.status === 'reviewed' || application.status === 'interview_scheduled') && (
                                    <>
                                      <button 
                                        onClick={() => handleHire(application.id, application.applicant_name)}
                                        disabled={processingAction === application.id}
                                        className="inline-flex items-center space-x-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Hire</span>
                                      </button>
                                    </>
                                  )}
                                  
                                  {application.status !== 'rejected' && application.status !== 'hired' && (
                                    <button 
                                      onClick={() => handleReject(application.id, application.applicant_name)}
                                      disabled={processingAction === application.id}
                                      className="inline-flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>Reject</span>
                                    </button>
                                  )}
                                  
                                  {/* Contact buttons */}
                                  <button 
                                    onClick={() => handleContactApplicant(
                                      application.applicant_email || '', 
                                      application.applicant_phone, 
                                      application.applicant_name, 
                                      application.job_title || 'the position', 
                                      'email'
                                    )}
                                    className="inline-flex items-center space-x-1 px-3 py-2 bg-indigo-100 text-indigo-700 text-sm rounded hover:bg-indigo-200 transition-colors"
                                  >
                                    <Mail className="w-4 h-4" />
                                    <span>Email</span>
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleContactApplicant(
                                      application.applicant_email || '', 
                                      application.applicant_phone, 
                                      application.applicant_name, 
                                      application.job_title || 'the position', 
                                      'call'
                                    )}
                                    className="inline-flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                                  >
                                    <Phone className="w-4 h-4" />
                                    <span>Call</span>
                                  </button>
                                  
                                  {/* Delete Button */}
                                  <button 
                                    onClick={() => handleDeleteApplication(application.id, application.applicant_name)}
                                    disabled={processingAction === application.id}
                                    className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                );
              })()}
              
              {/* Confirmation Modal */}
              {showConfirmModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowConfirmModal(null)}></div>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                      <div>
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                          showConfirmModal.type === 'hire' ? 'bg-green-100' : 
                          showConfirmModal.type === 'delete' ? 'bg-red-100' : 'bg-red-100'
                        }`}>
                          {showConfirmModal.type === 'hire' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : showConfirmModal.type === 'delete' ? (
                            <Trash2 className="h-6 w-6 text-red-600" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600" />
                          )}
                        </div>
                        
                        <div className="mt-3 text-center sm:mt-5">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {showConfirmModal.type === 'hire' ? 'Hire Applicant' : 
                             showConfirmModal.type === 'delete' ? 'Delete Application' : 'Reject Application'}
                          </h3>
                          
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              {showConfirmModal.type === 'delete' ? (
                                <>
                                  Are you sure you want to permanently delete the application from <strong>{showConfirmModal.applicantName}</strong>?
                                  <span className="block mt-2 text-red-600 font-medium">This action cannot be undone.</span>
                                </>
                              ) : (
                                <>
                                  Are you sure you want to {showConfirmModal.type} <strong>{showConfirmModal.applicantName}</strong>?
                                  {showConfirmModal.type === 'hire' && ' This will send them a congratulations message.'}
                                  {showConfirmModal.type === 'reject' && ' This will notify them that their application was not successful.'}
                                </>
                              )}
                            </p>
                          </div>
                          
                          {showConfirmModal.type === 'reject' && showConfirmModal.type !== 'delete' && (
                            <div className="mt-4">
                              <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Optional: Add a reason for rejection..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={showConfirmModal.type === 'hire' ? confirmHire : 
                                   showConfirmModal.type === 'delete' ? confirmDelete : confirmReject}
                          disabled={processingAction === showConfirmModal.applicationId}
                          className={`inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white rounded-md shadow-sm sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 ${
                            showConfirmModal.type === 'hire' 
                              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                          {processingAction === showConfirmModal.applicationId ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            showConfirmModal.type === 'hire' ? 'Yes, Hire' : 
                            showConfirmModal.type === 'delete' ? 'Yes, Delete' : 'Yes, Reject'
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowConfirmModal(null);
                            setRejectionReason('');
                          }}
                          className="mt-3 inline-flex justify-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Interview Notes Modal */}
              {showNotesModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowNotesModal(null)}></div>
                    
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                      <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                          <Calendar className="h-6 w-6 text-yellow-600" />
                        </div>
                        
                        <div className="mt-3 text-center sm:mt-5">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Schedule Interview
                          </h3>
                          
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Schedule an interview with <strong>{showNotesModal.applicantName}</strong>
                            </p>
                          </div>
                          
                          <div className="mt-4">
                            <textarea
                              value={interviewNotes}
                              onChange={(e) => setInterviewNotes(e.target.value)}
                              placeholder="Add interview notes, date/time, or instructions..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          onClick={confirmScheduleInterview}
                          disabled={processingAction === showNotesModal.applicationId}
                          className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-yellow-600 border border-transparent rounded-md shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {processingAction === showNotesModal.applicationId ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            'Schedule Interview'
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowNotesModal(null);
                            setInterviewNotes('');
                          }}
                          className="mt-3 inline-flex justify-center w-full px-4 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'moderation' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Job Moderation Queue</h1>
                <button
                  onClick={fetchPendingJobs}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {pendingJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-500">No jobs pending moderation at this time.</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="divide-y">
                    {pendingJobs.map((job) => (
                      <div key={job.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                Pending Review
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center space-x-1">
                                <Building2 className="w-4 h-4" />
                                <span>{job.company}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{job.salary_min && job.salary_max ? `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}` : 'Salary not specified'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                              {job.description}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {job.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {job.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{job.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => handleRejectJob(job.id)}
                              disabled={isLoading}
                              className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveJob(job.id)}
                              disabled={isLoading}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
              
              {/* Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="text-sm text-gray-600 mb-1">Jobs Approved</div>
                  <div className="text-3xl font-bold text-green-600">24</div>
                  <div className="text-sm text-green-600 mt-1">+12% from last month</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="text-sm text-gray-600 mb-1">Jobs Rejected</div>
                  <div className="text-3xl font-bold text-red-600">3</div>
                  <div className="text-sm text-red-600 mt-1">-8% from last month</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="text-sm text-gray-600 mb-1">Avg Review Time</div>
                  <div className="text-3xl font-bold text-blue-600">2.4</div>
                  <div className="text-sm text-blue-600 mt-1">hours</div>
                </div>
              </div>

              {/* Charts Placeholder */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Approval Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                    <p>Analytics charts will be displayed here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <p className="text-gray-500">Account settings coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default CompanyDashboard;
