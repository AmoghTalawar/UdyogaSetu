import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../utils/supabase';
import { JobService, Job } from '../services/jobService';
import { 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  Search,
  Filter,
  MoreVertical,
  Briefcase,
  Settings,
  Users,
  TrendingUp,
  Calendar,
  ChevronDown,
  MessageSquare,
  Edit3,
  Trash2,
  CheckSquare,
  RotateCcw,
  Priority,
  ArrowUpDown
} from 'lucide-react';

interface AdminModerationPageProps {
  onNavigate: (page: string) => void;
}

interface ModerationStats {
  total: number;
  pending: number;
  under_review: number;
  flagged: number;
  approved_today: number;
  rejected_today: number;
  avg_review_time: number;
}

interface BulkAction {
  type: 'approve' | 'reject' | 'flag' | 'priority';
  label: string;
  icon: any;
  color: string;
}

const AdminModerationPage: React.FC<AdminModerationPageProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'under_review' | 'flagged' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'priority' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<string>('');
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationNotes, setModerationNotes] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all');

  // Load jobs and statistics
  const loadJobs = async () => {
    try {
      setIsLoading(true);
      let jobData: Job[];
      
      if (filter === 'all') {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: sortOrder === 'asc' });
        jobData = data || [];
      } else {
        jobData = await JobService.getJobsByModerationStatus([filter]);
      }
      
      setJobs(jobData);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const stats = await JobService.getModerationStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadJobs();
    loadStats();
    
    // Set up real-time subscription for job updates
    const subscription = supabase
      .channel('job_moderation')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs'
      }, () => {
        loadJobs();
        loadStats();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [filter, sortBy, sortOrder]);

  // Action handlers
  const handleApprove = async (jobId: string, notes?: string) => {
    try {
      setIsLoading(true);
      await JobService.approveJob(jobId, user?.id, notes);
      await loadJobs();
      await loadStats();
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Failed to approve job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (jobId: string, notes?: string) => {
    try {
      setIsLoading(true);
      await JobService.rejectJob(jobId, user?.id, notes);
      await loadJobs();
      await loadStats();
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Failed to reject job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlag = async (jobId: string, reason: string) => {
    try {
      setIsLoading(true);
      await JobService.flagJob(jobId, reason, user?.id);
      await loadJobs();
      await loadStats();
    } catch (error) {
      console.error('Error flagging job:', error);
      alert('Failed to flag job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEdits = async (jobId: string, notes: string) => {
    try {
      setIsLoading(true);
      await JobService.requestJobEdits(jobId, notes, user?.id);
      await loadJobs();
      await loadStats();
    } catch (error) {
      console.error('Error requesting edits:', error);
      alert('Failed to request edits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (selectedJobs.length === 0 || !bulkActionType) return;
    
    try {
      setIsLoading(true);
      let count = 0;
      
      switch (bulkActionType) {
        case 'approve':
          count = await JobService.bulkApproveJobs(selectedJobs, user?.id, moderationNotes);
          break;
        case 'reject':
          count = await JobService.bulkRejectJobs(selectedJobs, user?.id, moderationNotes);
          break;
        default:
          // Handle individual actions for flagging or priority changes
          for (const jobId of selectedJobs) {
            if (bulkActionType === 'flag') {
              await JobService.flagJob(jobId, flagReason, user?.id);
            }
          }
          count = selectedJobs.length;
          break;
      }
      
      await loadJobs();
      await loadStats();
      setSelectedJobs([]);
      setBulkActionType('');
      setModerationNotes('');
      setFlagReason('');
      alert(`Successfully processed ${count} jobs.`);
    } catch (error) {
      console.error('Error processing bulk action:', error);
      alert('Failed to process bulk action. Please try again.');
    } finally {
      setIsLoading(false);
      setShowModerationModal(false);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };
  
  const formatTimeAgo = (dateString: string) => {
    return JobService.getTimeAgo(dateString);
  };
  
  const formatSalary = (job: Job) => {
    return JobService.formatSalaryRange(job);
  };

  // Filter and sort jobs
  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesPriority && matchesSearch;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
        aValue = priorityOrder[a.priority || 'normal'];
        bValue = priorityOrder[b.priority || 'normal'];
        break;
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  const bulkActions: BulkAction[] = [
    { type: 'approve', label: 'Approve', icon: CheckCircle, color: 'green' },
    { type: 'reject', label: 'Reject', icon: XCircle, color: 'red' },
    { type: 'flag', label: 'Flag', icon: Flag, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Job Portal Admin</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user?.fullName || 'Admin User'}</div>
                  <div className="text-gray-500">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex">
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg">
                <Briefcase className="w-5 h-5" />
                <span>Jobs (Moderation)</span>
              </div>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-left">
                <Building2 className="w-5 h-5" />
                <span>Employers</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-left">
                <Flag className="w-5 h-5" />
                <span>Kiosks</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-left">
                <Eye className="w-5 h-5" />
                <span>Analytics</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-left">
                <Settings className="w-5 h-5" />
                <span>Audit Logs</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-left">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Job Moderation Queue</h2>
              
              {/* Quick Test Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.from('jobs').select('id, title, status, priority, company_name').limit(5);
                      console.log('Quick test - Jobs data:', data);
                      console.log('Quick test - Jobs error:', error);
                      alert(`Found ${data?.length || 0} jobs. Check console for details.`);
                    } catch (err) {
                      console.error('Quick test error:', err);
                      alert(`Error: ${err.message}`);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Quick DB Test
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const testJob = {
                        title: 'Test Job - ' + Date.now(),
                        company_name: 'Test Company',
                        company_about: 'Test company description',
                        location: 'Remote',
                        job_type: 'full-time',
                        description: 'This is a test job posting.',
                        requirements: ['Test requirement'],
                        benefits: ['Test benefit'],
                        experience_level: 'entry',
                        skills: ['Testing'],
                        contact_email: 'test@test.com',
                        company_id: 'test-company',
                        status: 'pending',
                        priority: 'normal',
                        kiosk_enabled: false,
                        total_applications: 0
                      };
                      
                      const { data, error } = await supabase.from('jobs').insert([testJob]).select();
                      if (error) {
                        console.error('Add test job error:', error);
                        alert(`Error: ${error.message}`);
                      } else {
                        console.log('Test job added:', data);
                        alert('Test job added successfully!');
                        loadJobs(); // Refresh the page
                      }
                    } catch (err) {
                      console.error('Add test job error:', err);
                      alert(`Error: ${err.message}`);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Add Test Job
                </button>
              </div>
            </div>
            
          {/* Enhanced Filters and Search */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Jobs</option>
                  <option value="pending">Pending Review</option>
                  <option value="under_review">Under Review</option>
                  <option value="flagged">Flagged</option>
                  <option value="active">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy as any);
                      setSortOrder(newSortOrder as any);
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="created_at-desc">Newest First</option>
                    <option value="created_at-asc">Oldest First</option>
                    <option value="priority-desc">Priority: High to Low</option>
                    <option value="priority-asc">Priority: Low to High</option>
                    <option value="title-asc">Title: A to Z</option>
                    <option value="title-desc">Title: Z to A</option>
                  </select>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {selectedJobs.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedJobs.length} selected
                  </span>
                  {bulkActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.type}
                        onClick={() => {
                          setBulkActionType(action.type);
                          setShowModerationModal(true);
                        }}
                        className={`px-3 py-2 text-sm rounded-lg border ${
                          action.color === 'green' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                          action.color === 'red' ? 'border-red-300 text-red-700 hover:bg-red-50' :
                          'border-orange-300 text-orange-700 hover:bg-orange-50'
                        } flex items-center space-x-1`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Job List */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Header with select all */}
            <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {filteredJobs.length} jobs found
                </span>
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {selectedJobs.length > 0 && `${selectedJobs.length} selected`}
              </div>
            </div>
            
            <div className="divide-y">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleSelectJob(job.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    {/* Job Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                            {job.status === 'under_review' ? 'Under Review' : 
                             job.status === 'active' ? 'Approved' : 
                             job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                          
                          {job.priority && job.priority !== 'normal' && (
                            <div className={`flex items-center space-x-1 ${getPriorityColor(job.priority)}`}>
                              <Priority className="w-3 h-3" />
                              <span className="text-xs font-medium">{job.priority}</span>
                            </div>
                          )}
                          
                          {job.status === 'flagged' && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span className="text-xs text-red-600">Flagged</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company_name || 'Unknown Company'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatSalary(job)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Posted {formatTimeAgo(job.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Moderation Notes */}
                      {job.moderation_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-blue-800">Moderation Notes:</div>
                              <div className="text-sm text-blue-700">{job.moderation_notes}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Flagged Content */}
                      {job.status === 'flagged' && job.flagged_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                          <div className="flex items-start space-x-2">
                            <Flag className="w-4 h-4 text-red-600 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-red-800">Flagged Reason:</div>
                              <div className="text-sm text-red-700">{job.flagged_reason}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {(job.status === 'pending' || job.status === 'under_review' || job.status === 'flagged') && (
                        <>
                          <button
                            onClick={() => {
                              const notes = prompt('Enter notes for edit request:');
                              if (notes) handleRequestEdits(job.id, notes);
                            }}
                            className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                            title="Request Edits"
                            disabled={isLoading}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for flagging:');
                              if (reason) handleFlag(job.id, reason);
                            }}
                            className="p-2 text-orange-600 hover:text-orange-800 rounded-lg hover:bg-orange-50"
                            title="Flag Job"
                            disabled={isLoading}
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              const notes = prompt('Enter rejection notes (optional):');
                              handleReject(job.id, notes || undefined);
                            }}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Reject Job"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              const notes = prompt('Enter approval notes (optional):');
                              handleApprove(job.id, notes || undefined);
                            }}
                            disabled={isLoading}
                            className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                      
                      {job.status === 'rejected' && (
                        <button
                          onClick={() => {
                            const notes = prompt('Enter notes for reactivation:');
                            handleApprove(job.id, notes || undefined);
                          }}
                          disabled={isLoading}
                          className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Reactivate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <div className="space-y-4">
                    <p className="text-lg">All caught up!</p>
                    <p>No jobs pending moderation at this time.</p>
                    
                    {/* Debug Information */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
                      <details>
                        <summary className="cursor-pointer font-medium text-blue-700">Debug Information (Click to expand)</summary>
                        <div className="mt-3 text-sm space-y-2">
                          <p><strong>Filter:</strong> {filter}</p>
                          <p><strong>Total Jobs Loaded:</strong> {jobs.length}</p>
                          <p><strong>Search Term:</strong> {searchTerm || 'None'}</p>
                          <p><strong>Priority Filter:</strong> {priorityFilter}</p>
                          <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
                          
                          {jobs.length > 0 && (
                            <div className="mt-3">
                              <p><strong>Sample Jobs:</strong></p>
                              <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-auto max-h-32">
                                {JSON.stringify(jobs.slice(0, 3).map(j => ({
                                  title: j.title,
                                  status: j.status,
                                  company: j.company_name,
                                  priority: j.priority
                                })), null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-600">If no jobs appear above, you may need to:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
                              <li>Add database moderation columns</li>
                              <li>Add some test jobs to moderate</li>
                              <li>Check database permissions</li>
                            </ul>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Pending Review</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.pending || 0}
                  </div>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-75" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Under Review</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.under_review || 0}
                  </div>
                </div>
                <Eye className="w-8 h-8 text-blue-500 opacity-75" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Flagged</div>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.flagged || 0}
                  </div>
                </div>
                <Flag className="w-8 h-8 text-red-500 opacity-75" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Approved Today</div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.approved_today || 0}
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-75" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Rejected Today</div>
                  <div className="text-2xl font-bold text-gray-600">
                    {stats?.rejected_today || 0}
                  </div>
                </div>
                <XCircle className="w-8 h-8 text-gray-500 opacity-75" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Avg Review Time</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.avg_review_time || 0}h
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-75" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {bulkActionType === 'approve' ? 'Approve Jobs' :
                 bulkActionType === 'reject' ? 'Reject Jobs' :
                 bulkActionType === 'flag' ? 'Flag Jobs' : 'Bulk Action'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                You are about to {bulkActionType} {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''}.
              </p>
              
              {bulkActionType === 'flag' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason for flagging</label>
                  <textarea
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter reason for flagging..."
                    required
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter moderation notes..."
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModerationModal(false);
                    setBulkActionType('');
                    setModerationNotes('');
                    setFlagReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAction}
                  disabled={isLoading || (bulkActionType === 'flag' && !flagReason.trim())}
                  className={`px-4 py-2 rounded-lg text-white disabled:opacity-50 ${
                    bulkActionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                    bulkActionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : 
                   bulkActionType === 'approve' ? 'Approve All' :
                   bulkActionType === 'reject' ? 'Reject All' :
                   'Flag All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedJob.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedJob.status)}`}>
                      {selectedJob.status === 'under_review' ? 'Under Review' : 
                       selectedJob.status === 'active' ? 'Approved' : 
                       selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                    </span>
                    {selectedJob.priority && selectedJob.priority !== 'normal' && (
                      <span className={`text-xs font-medium ${getPriorityColor(selectedJob.priority)}`}>
                        {selectedJob.priority} priority
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <p className="text-gray-900">{selectedJob.company_name || 'Unknown Company'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{selectedJob.location}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <p className="text-gray-900">{JobService.formatJobType(selectedJob.job_type)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                    <p className="text-gray-900">{JobService.formatExperience(selectedJob.experience_level)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <p className="text-gray-900">{formatSalary(selectedJob)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posted</label>
                    <p className="text-gray-900">{formatTimeAgo(selectedJob.created_at)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <div className="text-gray-900 max-h-32 overflow-y-auto text-sm">
                      {selectedJob.description}
                    </div>
                  </div>
                  
                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                      <ul className="text-sm text-gray-900 list-disc list-inside max-h-24 overflow-y-auto">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <div className="flex flex-wrap gap-1">
                        {selectedJob.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
                      <ul className="text-sm text-gray-900 list-disc list-inside max-h-20 overflow-y-auto">
                        {selectedJob.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Moderation Information */}
              {(selectedJob.moderation_notes || selectedJob.flagged_reason) && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Moderation Information</h4>
                  
                  {selectedJob.moderation_notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
                      <div className="text-sm font-medium text-blue-800">Notes:</div>
                      <div className="text-sm text-blue-700">{selectedJob.moderation_notes}</div>
                    </div>
                  )}
                  
                  {selectedJob.flagged_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-red-800">Flagged Reason:</div>
                      <div className="text-sm text-red-700">{selectedJob.flagged_reason}</div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                
                {(selectedJob.status === 'pending' || selectedJob.status === 'under_review' || selectedJob.status === 'flagged') && (
                  <>
                    <button
                      onClick={() => {
                        const notes = prompt('Enter notes for edit request:');
                        if (notes) {
                          handleRequestEdits(selectedJob.id, notes);
                          setSelectedJob(null);
                        }
                      }}
                      className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                    >
                      Request Edits
                    </button>
                    
                    <button
                      onClick={() => {
                        const reason = prompt('Enter reason for flagging:');
                        if (reason) {
                          handleFlag(selectedJob.id, reason);
                          setSelectedJob(null);
                        }
                      }}
                      className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50"
                    >
                      Flag
                    </button>
                    
                    <button
                      onClick={() => {
                        const notes = prompt('Enter rejection notes (optional):');
                        handleReject(selectedJob.id, notes || undefined);
                        setSelectedJob(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                    
                    <button
                      onClick={() => {
                        const notes = prompt('Enter approval notes (optional):');
                        handleApprove(selectedJob.id, notes || undefined);
                        setSelectedJob(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </>
                )}
                
                {selectedJob.status === 'rejected' && (
                  <button
                    onClick={() => {
                      const notes = prompt('Enter notes for reactivation:');
                      handleApprove(selectedJob.id, notes || undefined);
                      setSelectedJob(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModerationPage;