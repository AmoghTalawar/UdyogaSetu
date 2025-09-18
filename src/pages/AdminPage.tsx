import React, { useState } from 'react';
import { ArrowLeft, Shield, Users, BarChart3, FileText, Settings, CheckCircle, XCircle } from 'lucide-react';
import Header from '../components/common/Header';
import { mockJobs, mockEmployers, mockApplications } from '../data/mockData';

interface AdminPageProps {
  onNavigate: (page: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const adminStats = {
    totalJobs: 156,
    pendingApprovals: 8,
    totalApplications: 2341,
    activeEmployers: 45,
    kiosksOnline: 142,
    avgApplicationsPerDay: 87,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'jobs', label: 'Job Moderation', icon: FileText },
    { id: 'employers', label: 'Employers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Global KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalJobs}</p>
            </div>
            <FileText className="w-8 h-8 text-[#0B63E5]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Pending Approvals</p>
              <p className="text-2xl font-bold text-[#FF7A18]">{adminStats.pendingApprovals}</p>
            </div>
            <Shield className="w-8 h-8 text-[#FF7A18]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.totalApplications}</p>
            </div>
            <Users className="w-8 h-8 text-[#16A34A]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Active Employers</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.activeEmployers}</p>
            </div>
            <Users className="w-8 h-8 text-[#0B63E5]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Kiosks Online</p>
              <p className="text-2xl font-bold text-[#16A34A]">{adminStats.kiosksOnline}</p>
            </div>
            <div className="w-8 h-8 bg-[#16A34A]/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-[#16A34A] rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6B7280]">Daily Applications</p>
              <p className="text-2xl font-bold text-gray-900">{adminStats.avgApplicationsPerDay}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Shield className="w-5 h-5 text-[#FF7A18]" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Review Pending Jobs</p>
              <p className="text-sm text-[#6B7280]">{adminStats.pendingApprovals} awaiting approval</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Users className="w-5 h-5 text-[#0B63E5]" />
            <div className="text-left">
              <p className="font-medium text-gray-900">Manage Employers</p>
              <p className="text-sm text-[#6B7280]">Verify and monitor accounts</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <BarChart3 className="w-5 h-5 text-[#16A34A]" />
            <div className="text-left">
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-[#6B7280]">Platform performance metrics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <CheckCircle className="w-5 h-5 text-[#16A34A]" />
                <div>
                  <p className="font-medium text-gray-900">Job approved: Sales Associate at Sunrise Textiles</p>
                  <p className="text-sm text-[#6B7280]">2 hours ago</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <Users className="w-5 h-5 text-[#0B63E5]" />
                <div>
                  <p className="font-medium text-gray-900">New employer registered: Karnataka Manufacturing</p>
                  <p className="text-sm text-[#6B7280]">4 hours ago</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <XCircle className="w-5 h-5 text-[#E02424]" />
                <div>
                  <p className="font-medium text-gray-900">Job rejected: Suspicious posting detected</p>
                  <p className="text-sm text-[#6B7280]">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobModeration = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Job Moderation Queue</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-[#6B7280]">{adminStats.pendingApprovals} jobs pending review</span>
        </div>
      </div>

      <div className="space-y-4">
        {mockJobs.filter(job => job.status === 'pending').map((job) => (
          <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                  <span className="px-2 py-1 bg-[#FF7A18]/10 text-[#FF7A18] text-xs rounded-full">
                    Pending Review
                  </span>
                </div>
                <p className="text-[#6B7280] mb-2">{job.company} • {job.location}</p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-[#F7FAFC] text-[#0B63E5] text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ml-6 flex flex-col space-y-2">
                <button className="bg-[#16A34A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#16A34A]/90">
                  Approve & Publish
                </button>
                <button className="border border-[#FF7A18] text-[#FF7A18] px-4 py-2 rounded-lg text-sm hover:bg-[#FF7A18]/5">
                  Request Changes
                </button>
                <button className="border border-[#E02424] text-[#E02424] px-4 py-2 rounded-lg text-sm hover:bg-[#E02424]/5">
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmployers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Employer Management</h3>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-900">Company</th>
                <th className="text-left p-4 font-medium text-gray-900">Verified</th>
                <th className="text-left p-4 font-medium text-gray-900">Active Jobs</th>
                <th className="text-left p-4 font-medium text-gray-900">Total Applications</th>
                <th className="text-left p-4 font-medium text-gray-900">Joined</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockEmployers.map((employer) => (
                <tr key={employer.id} className="border-t border-gray-200">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{employer.companyName}</p>
                      <p className="text-sm text-[#6B7280]">{employer.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    {employer.verified ? (
                      <span className="flex items-center space-x-1 text-[#16A34A]">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Verified</span>
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-[#FF7A18]/10 text-[#FF7A18] text-xs rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-900">{employer.activeJobs}</td>
                  <td className="p-4 text-gray-900">{employer.totalApplications}</td>
                  <td className="p-4 text-sm text-[#6B7280]">
                    {employer.joinedDate.toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {!employer.verified && (
                        <button className="text-[#16A34A] hover:text-[#16A34A]/80 text-sm">
                          Verify
                        </button>
                      )}
                      <button className="text-[#E02424] hover:text-[#E02424]/80 text-sm">
                        Suspend
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

  const renderAnalytics = () => (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Platform Analytics</h3>
      
      {/* Language Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Language Usage Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0B63E5] mb-2">45%</div>
            <div className="text-sm text-[#6B7280]">English</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FF7A18] mb-2">35%</div>
            <div className="text-sm text-[#6B7280]">Hindi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#16A34A] mb-2">20%</div>
            <div className="text-sm text-[#6B7280]">Kannada</div>
          </div>
        </div>
      </div>

      {/* Application Methods */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Application Methods</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#FF7A18] mb-2">62%</div>
            <div className="text-sm text-[#6B7280]">Voice Applications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#0B63E5] mb-2">38%</div>
            <div className="text-sm text-[#6B7280]">Resume Upload</div>
          </div>
        </div>
      </div>

      {/* Geographical Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Top Cities by Applications</h4>
        <div className="space-y-3">
          {[
            { city: 'Bangalore', applications: 1245, percentage: 35 },
            { city: 'Mysore', applications: 876, percentage: 25 },
            { city: 'Hubli', applications: 654, percentage: 18 },
            { city: 'Mangalore', applications: 432, percentage: 12 },
            { city: 'Dharwad', applications: 321, percentage: 10 },
          ].map((city, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-900">{city.city}</div>
                <div className="text-sm text-[#6B7280]">{city.applications} applications</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#0B63E5] h-2 rounded-full" 
                    style={{ width: `${city.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-[#6B7280] w-8">{city.percentage}%</span>
              </div>
            </div>
          ))}
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
            Admin Dashboard
          </h1>
          <p className="text-[#6B7280]">
            Platform oversight and management
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
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'jobs' && renderJobModeration()}
            {activeTab === 'employers' && renderEmployers()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h3>
                <p className="text-[#6B7280]">System configuration panel coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;