import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { JobService } from '../../services/jobService';

const JobModerationDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const checkDatabase = async () => {
    setIsLoading(true);
    try {
      // Check jobs table
      const { data: allJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .limit(10);

      console.log('All jobs:', allJobs);
      console.log('Jobs error:', jobsError);

      // Check if moderation columns exist
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'jobs' })
        .single();

      // Get stats
      let stats = null;
      try {
        stats = await JobService.getModerationStats();
      } catch (statsError) {
        console.error('Stats error:', statsError);
      }

      setDebugInfo({
        totalJobs: allJobs?.length || 0,
        jobs: allJobs,
        jobsError: jobsError?.message,
        columnsError: columnsError?.message,
        stats,
        hasColumns: {
          moderation_notes: allJobs?.[0]?.hasOwnProperty('moderation_notes'),
          priority: allJobs?.[0]?.hasOwnProperty('priority'),
          flagged_reason: allJobs?.[0]?.hasOwnProperty('flagged_reason')
        }
      });

    } catch (error) {
      console.error('Debug check error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const addTestJobs = async () => {
    setIsLoading(true);
    try {
      const testJobs = [
        {
          title: 'Senior React Developer',
          company_name: 'Tech Startup Inc',
          company_about: 'A growing tech company focused on innovative solutions',
          location: 'San Francisco, CA',
          job_type: 'full-time',
          salary_min: 80000,
          salary_max: 120000,
          salary_currency: 'USD',
          description: 'We are looking for a senior React developer to join our team.',
          requirements: ['React', 'TypeScript', '3+ years experience'],
          benefits: ['Health insurance', 'Remote work'],
          experience_level: 'senior',
          skills: ['React', 'TypeScript', 'Node.js'],
          contact_email: 'hr@techstartup.com',
          company_id: 'test-company-1',
          status: 'pending',
          priority: 'normal',
          kiosk_enabled: true,
          total_applications: 0
        },
        {
          title: 'Marketing Manager',
          company_name: 'Marketing Solutions LLC',
          company_about: 'Full-service marketing agency',
          location: 'New York, NY',
          job_type: 'full-time',
          salary_min: 60000,
          salary_max: 90000,
          salary_currency: 'USD',
          description: 'Looking for an experienced marketing manager.',
          requirements: ['Marketing degree', '2+ years experience'],
          benefits: ['Health insurance', '401k'],
          experience_level: 'mid',
          skills: ['Digital Marketing', 'Analytics', 'Content Creation'],
          contact_email: 'jobs@marketingsolutions.com',
          company_id: 'test-company-2',
          status: 'flagged',
          priority: 'high',
          flagged_reason: 'Potentially misleading requirements',
          kiosk_enabled: true,
          total_applications: 0
        },
        {
          title: 'Data Analyst',
          company_name: 'Data Corp',
          company_about: 'Data analytics company',
          location: 'Remote',
          job_type: 'contract',
          salary_min: 50000,
          salary_max: 70000,
          salary_currency: 'USD',
          description: 'Contract data analyst position.',
          requirements: ['SQL', 'Python', 'Statistics'],
          benefits: ['Flexible hours'],
          experience_level: 'entry',
          skills: ['SQL', 'Python', 'Excel'],
          contact_email: 'hiring@datacorp.com',
          company_id: 'test-company-3',
          status: 'under_review',
          priority: 'normal',
          moderation_notes: 'Reviewing salary range',
          kiosk_enabled: false,
          total_applications: 0
        }
      ];

      const { data, error } = await supabase
        .from('jobs')
        .insert(testJobs)
        .select();

      if (error) {
        console.error('Error inserting test jobs:', error);
        alert(`Error adding test jobs: ${error.message}`);
      } else {
        console.log('Test jobs added:', data);
        alert(`Successfully added ${data?.length || 0} test jobs!`);
        checkDatabase(); // Refresh the debug info
      }

    } catch (error) {
      console.error('Test job creation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllJobs = async () => {
    if (!confirm('Are you sure you want to delete ALL jobs? This cannot be undone!')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('All jobs deleted!');
        checkDatabase(); // Refresh the debug info
      }
    } catch (error) {
      console.error('Error clearing jobs:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Moderation Debug Panel</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-3">
          <button
            onClick={checkDatabase}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check Database'}
          </button>
          
          <button
            onClick={addTestJobs}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Test Jobs'}
          </button>
          
          <button
            onClick={clearAllJobs}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Clearing...' : 'Clear All Jobs'}
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Database Info:</h3>
          <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {debugInfo.jobs && debugInfo.jobs.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Sample Jobs:</h3>
            {debugInfo.jobs.slice(0, 3).map((job: any, index: number) => (
              <div key={index} className="bg-white p-3 rounded border mb-2">
                <div className="font-medium">{job.title}</div>
                <div className="text-sm text-gray-600">
                  Status: {job.status} | Company: {job.company_name} | Priority: {job.priority || 'normal'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobModerationDebug;