import React, { useState } from 'react';
import { ArrowLeft, Plus, Eye, Edit, Users, BarChart3, Settings } from 'lucide-react';
import Header from '../components/common/Header';
import { mockJobs, mockApplications } from '../data/mockData';
import { Job, Application } from '../types';

interface EmployerPageProps {
  onNavigate: (page: string) => void;
}

const EmployerPage: React.FC<EmployerPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Mock employer data
  const employerData = {
    companyName: 'Sunrise Textiles',
    activeJobs: 3,
    totalApplications: 45,
    newApplications: 8,
    avgTimeToHire: 12,
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'jobs', label: 'Jobs', icon: Plus },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{employerData.activeJobs}</p>
            </div>
            <div className="w-12 h-12 bg-[#0B63E5]/10 text-[#0B63E5] rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">New Applications (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{employerData.newApplications}</p>
            </div>
            <div className="w-12 h-12 bg-[#FF7A18]/10 text-[#FF7A18] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{employerData.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Avg Time to Hire</p>
              <p className="text-2xl font-bold text-gray-900">{employerData.avgTimeToHire} days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {mockApplications.slice(0, 5).map((application) => (
              <div key={application.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-[#0B63E5]/10 text-[#0B63E5] rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{application.applicantName}</p>
                    <p className="text-sm text-[#6B7280]">
                      Applied for {mockJobs.find(j => j.id === application.jobId)?.title} • {application.method}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    application.status === 'shortlisted' 
                      ? 'bg-[#16A34A]/10 text-[#16A34A]'
                      : 'bg-[#6B7280]/10 text-[#6B7280]'
                  }`}>
                    {application.status}
                  </span>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {application.appliedDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Your Job Postings</h3>
        <button className="bg-[#0B63E5] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0B63E5]/90 transition-colors">
          Post New Job
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Job Title</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Applicants</th>
                <th className="text-left p-4 font-medium text-gray-900">Posted</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockJobs.map((job) => (
                <tr key={job.id} className="border-t border-gray-200">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{job.title}</p>
                      <p className="text-sm text-[#6B7280]">{job.location} • {job.type}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      job.status === 'live'
                        ? 'bg-[#16A34A]/10 text-[#16A34A]'
                        : 'bg-[#6B7280]/10 text-[#6B7280]'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#6B7280]" />
                      <span>{job.applicantCount}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#6B7280]">
                    {job.postedDate.toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-[#0B63E5] hover:text-[#0B63E5]/80">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-[#6B7280] hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Recent Applicants</h3>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Applicant</th>
                <th className="text-left p-4 font-medium text-gray-900">Job</th>
                <th className="text-left p-4 font-medium text-gray-900">Application Method</th>
                <th className="text-left p-4 font-medium text-gray-900">Match Score</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockApplications.map((application) => (
                <tr key={application.id} className="border-t border-gray-200">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{application.applicantName}</p>
                      <p className="text-sm text-[#6B7280]">{application.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-900">
                    {mockJobs.find(j => j.id === application.jobId)?.title}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      application.method === 'voice'
                        ? 'bg-[#FF7A18]/10 text-[#FF7A18]'
                        : 'bg-[#0B63E5]/10 text-[#0B63E5]'
                    }`}>
                      {application.method}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#16A34A] h-2 rounded-full" 
                          style={{ width: `${application.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{application.matchScore}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      application.status === 'shortlisted'
                        ? 'bg-[#16A34A]/10 text-[#16A34A]'
                        : application.status === 'rejected'
                        ? 'bg-[#E02424]/10 text-[#E02424]'
                        : 'bg-[#6B7280]/10 text-[#6B7280]'
                    }`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="bg-[#16A34A] text-white px-3 py-1 rounded text-xs hover:bg-[#16A34A]/90">
                        Accept
                      </button>
                      <button className="bg-[#E02424] text-white px-3 py-1 rounded text-xs hover:bg-[#E02424]/90">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-[#0B63E5] hover:text-[#0B63E5]/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Employer Dashboard
          </h1>
          <p className="text-[#6B7280]">
            Welcome back, {employerData.companyName}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg border border-gray-200 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                        activeTab === tab.id
                          ? 'bg-[#0B63E5] text-white'
                          : 'text-[#6B7280] hover:text-[#0B63E5] hover:bg-[#0B63E5]/5'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'jobs' && renderJobs()}
            {activeTab === 'applicants' && renderApplicants()}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Settings</h3>
                <p className="text-[#6B7280]">Settings panel coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerPage;