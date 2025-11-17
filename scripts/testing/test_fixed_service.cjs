// Test the fixed ApplicationService
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// UUID conversion function (same as in the app)
function clerkUserIdToUuid(clerkUserId) {
  let hash = 0;
  for (let i = 0; i < clerkUserId.length; i++) {
    const char = clerkUserId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  
  let hash2 = 0;
  for (let i = clerkUserId.length - 1; i >= 0; i--) {
    const char = clerkUserId.charCodeAt(i);
    hash2 = ((hash2 << 3) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  const positiveHash2 = Math.abs(hash2).toString(16).padStart(8, '0');
  
  return [
    positiveHash.substring(0, 8),
    positiveHash.substring(8, 12) || '0000',
    '4' + positiveHash2.substring(1, 4),
    '8' + positiveHash2.substring(4, 7),
    positiveHash2.substring(0, 12).padEnd(12, '0')
  ].join('-');
}

// Simulate the fixed getCompanyApplications method
async function getCompanyApplications(companyId) {
  console.log('🔍 Testing fixed method with company ID:', companyId);
  
  // First, get jobs for this company
  const { data: companyJobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id, title, company_id')
    .eq('company_id', companyId);
  
  if (jobsError) {
    console.error('❌ Error fetching company jobs:', jobsError);
    return [];
  }
  
  if (!companyJobs || companyJobs.length === 0) {
    console.log('📋 No jobs found for company');
    return [];
  }
  
  const jobIds = companyJobs.map(job => job.id);
  console.log('💼 Found', companyJobs.length, 'jobs for company');
  
  // Now get applications for these jobs
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .in('job_id', jobIds)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching applications:', error);
    return [];
  }
  
  console.log('✅ Found', data?.length || 0, 'applications');
  
  // Create job lookup
  const jobLookup = {};
  companyJobs.forEach(job => {
    jobLookup[job.id] = job;
  });
  
  // Transform data
  return (data || []).map(app => {
    const job = jobLookup[app.job_id];
    return {
      ...app,
      job_title: job?.title,
      job_company: job?.company_id,
      applicant_score: app.ai_score,
      applied_at: app.created_at,
      application_method: app.application_method === 'kiosk_qr' ? 'qr' :
                         app.application_method === 'kiosk_voice' ? 'voice' :
                         app.application_method,
      voice_language: app.voice_transcript ? 'en' : null
    };
  });
}

async function testFixed() {
  console.log('🧪 Testing fixed ApplicationService...');
  
  // Test with the known company ID
  const existingCompanyId = '62c06e3f-0000-4340-86c3-23406c390000';
  const applications = await getCompanyApplications(existingCompanyId);
  
  if (applications.length > 0) {
    console.log('\n✅ SUCCESS! Found applications:');
    applications.forEach(app => {
      console.log(`  📄 ${app.applicant_name} - ${app.job_title} (${app.status})`);
    });
  } else {
    console.log('\n❌ No applications found');
  }
  
  // Also test with a sample Clerk user ID conversion
  const testClerkId = 'user_2pQEJHgJ57DQpRfPq3ZCUKPHjMz';
  const convertedId = clerkUserIdToUuid(testClerkId);
  console.log('\n🔄 Test with converted Clerk ID:');
  console.log('Clerk ID:', testClerkId);
  console.log('Converted:', convertedId);
  
  const appsForConverted = await getCompanyApplications(convertedId);
  console.log('Applications found:', appsForConverted.length);
}

testFixed().then(() => process.exit(0)).catch(console.error);