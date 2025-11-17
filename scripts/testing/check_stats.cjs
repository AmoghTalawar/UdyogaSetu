// Check current statistics and database state
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
  console.log('📊 Checking current database state and statistics...\n');
  
  // Check current applications
  const { data: apps } = await supabase
    .from('applications')
    .select('applicant_name, status, updated_at')
    .order('updated_at', { ascending: false });
  
  console.log('📋 Current applications in database:');
  apps?.forEach((app, index) => {
    console.log(`  ${index + 1}. ${app.applicant_name} - Status: ${app.status} (${new Date(app.updated_at).toLocaleString()})`);
  });
  
  // Manual statistics calculation (same as the app does)
  const companyId = '62c06e3f-0000-4340-86c3-23406c390000';
  
  // Get company jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id')
    .eq('company_id', companyId);
  
  if (!jobs || jobs.length === 0) {
    console.log('❌ No jobs found for company');
    return;
  }
  
  const jobIds = jobs.map(job => job.id);
  console.log(`\n🏢 Found ${jobs.length} jobs for company ${companyId}`);
  
  // Get applications for these jobs
  const { data: companyApps } = await supabase
    .from('applications')
    .select('status, created_at, applicant_name')
    .in('job_id', jobIds);
  
  if (!companyApps) {
    console.log('❌ No applications found');
    return;
  }
  
  console.log(`\n📊 Found ${companyApps.length} applications for this company:`);
  companyApps.forEach(app => {
    console.log(`   ${app.applicant_name}: ${app.status}`);
  });
  
  // Calculate statistics
  const stats = {
    total_applications: companyApps.length,
    new_applications: companyApps.filter(app => app.status === 'submitted').length,
    reviewed_applications: companyApps.filter(app => app.status === 'reviewed').length,
    interview_applications: companyApps.filter(app => app.status === 'interview_scheduled').length,
    hired_applications: companyApps.filter(app => app.status === 'hired').length,
    rejected_applications: companyApps.filter(app => app.status === 'rejected').length,
  };
  
  console.log('\n📈 Calculated Statistics:');
  console.log(`   📋 Total Applications: ${stats.total_applications}`);
  console.log(`   🆕 New Applications: ${stats.new_applications}`);
  console.log(`   👁️  Reviewed: ${stats.reviewed_applications}`);
  console.log(`   📅 In Interview: ${stats.interview_applications}`);
  console.log(`   ✅ Hired: ${stats.hired_applications}`);
  console.log(`   ❌ Rejected: ${stats.rejected_applications}`);
  
  // Show status distribution
  const statusCount = {};
  companyApps.forEach(app => {
    statusCount[app.status] = (statusCount[app.status] || 0) + 1;
  });
  
  console.log('\n📉 Raw Status Distribution:');
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });
  
  // Expected results
  console.log('\n🎯 Your dashboard should show these numbers:');
  console.log(`   Total Applications: ${stats.total_applications}`);
  console.log(`   New Applications: ${stats.new_applications}`);
  console.log(`   In Interview: ${stats.interview_applications}`);
  console.log(`   Hired: ${stats.hired_applications}`);
  console.log(`   Rejected: ${stats.rejected_applications}`);
}

checkStats().then(() => process.exit(0)).catch(console.error);