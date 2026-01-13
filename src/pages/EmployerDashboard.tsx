import React, { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { 
  getEmployerApplications, 
  updateApplicationStatus,
  APPLICATION_STATUS,
  supabase 
} from '../utils/supabase';
import { ApplicationWithDetails } from '../utils/database.types';
import { startNotificationProcessor, stopNotificationProcessor } from '../services/notificationService';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Filter,
  Download,
  MoreVertical,
  Mic,
  Upload,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

interface EmployerDashboardProps {
  onNavigate: (page: string) => void;
}

type TabType = 'overview' | 'applications' | 'jobs' | 'settings';
type FilterType = 'all' | 'submitted' | 'under_review' | 'shortlisted' | 'approved' | 'rejected';

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  // Load company data and applications
  useEffect(() => {
    if (user) {
      loadCompanyData();
      loadApplications();
      startNotificationProcessor(30000); // Process notifications every 30 seconds
    }

    return () => {
      stopNotificationProcessor();
    };
  }, [user]);

  // Filter applications when filter or search term changes
  useEffect(() => {
    let filtered = applications;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(app => app.status === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.applicant_name.toLowerCase().includes(searchLower) ||
        app.applicant_email?.toLowerCase().includes(searchLower) ||
        app.job?.title.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, filter, searchTerm]);

  const loadCompanyData = async () => {
    try {
      // First check if user has company_users record
      const { data: companyUser, error: userError } = await supabase
        .from('company_users')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('clerk_user_id', user?.id)
        .single();

      if (userError || !companyUser) {
        console.error('Company user not found:', userError);
        // Could create company record here or redirect to setup
        return;
      }

      setCompanyData(companyUser);
    } catch (err) {
      console.error('Error loading company data:', err);
      setError('Failed to load company data');
    }
  };

  const loadApplications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get company ID from company_users table
      const { data: companyUser, error: userError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('clerk_user_id', user.id)
        .single();

      if (userError || !companyUser) {
        throw new Error('Company not found for user');
      }

      const result = await getEmployerApplications(companyUser.company_id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load applications');
      }

      setApplications(result.data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string, notes?: string) => {
    if (!companyData?.id) return;

    try {
      const result = await updateApplicationStatus({
        application_id: applicationId,
        new_status: newStatus,
        reviewer_id: companyData.id,
        reviewer_notes: notes,
        notification_type: newStatus === APPLICATION_STATUS.APPROVED ? 'approval' : 
                          newStatus === APPLICATION_STATUS.REJECTED ? 'rejection' : 
                          'status_update'
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to update status');
      }

      // Refresh applications
      await loadApplications();
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'hired':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'under_review':
      case 'shortlisted':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatApplicationMethod = (method: string) => {
    switch (method) {
      case 'kiosk_qr': return '📱 QR Code';
      case 'kiosk_voice': return '🎤 Voice';
      case 'online': return '💻 Online';
      default: return method;
    }
  };

  // Calculate statistics
  const stats = {
    total: applications.length,
    new: applications.filter(app => app.status === 'submitted').length,
    underReview: applications.filter(app => app.status === 'under_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Employer Dashboard
              </h1>
              {companyData?.company && (
                <span className="text-gray-500">
                  - {companyData.company.name}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Bell className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
              <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600" />
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Briefcase },
              { id: 'applications', label: 'Applications', icon: Users },
              { id: 'jobs', label: 'Jobs', icon: Briefcase },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'applications' && stats.new > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {stats.new}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">New Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.new}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Under Review</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.underReview}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((application) => (
                  <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {application.applicant_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {application.applicant_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied for {application.job?.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatApplicationMethod(application.application_method)} • {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                        </span>
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {applications.length > 5 && (
                <div className="px-6 py-3 bg-gray-50">
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-900"
                  >
                    View all applications →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Applications</option>
                      <option value="submitted">New Submissions</option>
                      <option value="under_review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white shadow overflow-hidden rounded-lg">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {filter === 'all' 
                      ? "You haven't received any applications yet." 
                      : `No applications match the "${filter}" filter.`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-lg font-medium text-blue-600">
                                {application.applicant_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-lg font-medium text-gray-900">
                                {application.applicant_name}
                              </p>
                              {application.ai_score && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Score: {application.ai_score}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                {application.job?.title}
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-4 h-4 mr-1" />
                                {application.applicant_phone}
                              </span>
                              {application.applicant_email && (
                                <span className="flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {application.applicant_email}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Applied {new Date(application.created_at).toLocaleDateString()}
                              </span>
                              <span>{formatApplicationMethod(application.application_method)}</span>
                              {application.submission_location && (
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {application.submission_location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Application Files */}
                          <div className="flex items-center space-x-2">
                            {application.resume_url && (
                              <a
                                href={application.resume_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="View Resume"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            )}
                            {application.voice_recording_url && (
                              <button
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                title="Play Voice Recording"
                              >
                                <Mic className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Status */}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                          </span>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            {application.status === 'submitted' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, APPLICATION_STATUS.APPROVED)}
                                  className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, APPLICATION_STATUS.REJECTED)}
                                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Voice Transcript Preview */}
                      {application.voice_transcript && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Voice transcript: </span>
                            {application.voice_transcript.length > 200 
                              ? `${application.voice_transcript.substring(0, 200)}...` 
                              : application.voice_transcript}
                          </p>
                        </div>
                      )}

                      {/* Reviewer Notes */}
                      {application.reviewer_notes && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Notes: </span>
                            {application.reviewer_notes}
                          </p>
                          {application.reviewed_at && (
                            <p className="text-xs text-yellow-600 mt-1">
                              Reviewed on {new Date(application.reviewed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Job Management</h3>
            <p className="mt-2 text-sm text-gray-500">
              Job posting and management features will be available here.
            </p>
            <button
              onClick={() => onNavigate('post-job')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Post New Job
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Settings</h3>
            <p className="mt-2 text-sm text-gray-500">
              Company settings and preferences will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;