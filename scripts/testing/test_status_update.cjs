// Test status updates and statistics
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatusUpdates() {
  console.log('🧪 Testing status updates and statistics...');
  
  // First, let's see what applications exist
  const { data: apps, error: appsError } = await supabase
    .from('applications')
    .select('id, applicant_name, status, job_id')
    .order('created_at', { ascending: false });
  
  if (appsError) {
    console.error('❌ Error fetching applications:', appsError);
    return;
  }
  
  console.log('\n📋 Current applications:');
  apps.forEach((app, index) => {
    console.log(`  ${index + 1}. ${app.applicant_name} - Status: ${app.status}`);
  });
  
  if (apps.length === 0) {
    console.log('❌ No applications found');
    return;
  }
  
  // Test updating one application status
  const testApp = apps[0];
  console.log(`\n🔄 Testing status update for: ${testApp.applicant_name}`);
  console.log(`   Current status: ${testApp.status}`);
  
  // Update to 'reviewed' status
  const { error: updateError } = await supabase
    .from('applications')
    .update({
      status: 'reviewed',
      reviewed_at: new Date().toISOString(),
      reviewer_notes: 'Test update from debug script',
      updated_at: new Date().toISOString()
    })
    .eq('id', testApp.id);
  
  if (updateError) {
    console.error('❌ Error updating status:', updateError);
  } else {
    console.log('✅ Successfully updated status to "reviewed"');
  }
  
  // Check the updated status
  const { data: updatedApp } = await supabase
    .from('applications')
    .select('applicant_name, status, reviewer_notes')
    .eq('id', testApp.id)
    .single();
  
  if (updatedApp) {
    console.log(`✅ Verified update: ${updatedApp.applicant_name} - Status: ${updatedApp.status}`);
    console.log(`   Notes: ${updatedApp.reviewer_notes}`);
  }
  
  // Now test statistics calculation
  console.log('\n📊 Testing statistics calculation...');
  
  // Get company jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, company_id');
  
  if (jobs && jobs.length > 0) {
    const companyId = jobs[0].company_id;
    console.log(`🏢 Using company ID: ${companyId}`);
    
    // Get job IDs for this company
    const companyJobs = jobs.filter(job => job.company_id === companyId);
    const jobIds = companyJobs.map(job => job.id);
    
    console.log(`📝 Found ${companyJobs.length} jobs for this company`);
    
    // Get applications for these jobs
    const { data: companyApps } = await supabase
      .from('applications')
      .select('status, created_at')
      .in('job_id', jobIds);
    
    if (companyApps) {
      console.log(`📋 Found ${companyApps.length} applications for company`);
      
      // Calculate statistics
      const stats = {
        total_applications: companyApps.length,
        submitted: companyApps.filter(app => app.status === 'submitted').length,
        reviewed: companyApps.filter(app => app.status === 'reviewed').length,
        interview_scheduled: companyApps.filter(app => app.status === 'interview_scheduled').length,
        hired: companyApps.filter(app => app.status === 'hired').length,
        rejected: companyApps.filter(app => app.status === 'rejected').length,
      };
      
      console.log('\n📈 Statistics:');
      console.log(`   Total: ${stats.total_applications}`);
      console.log(`   New (submitted): ${stats.submitted}`);
      console.log(`   Reviewed: ${stats.reviewed}`);
      console.log(`   Interview Scheduled: ${stats.interview_scheduled}`);
      console.log(`   Hired: ${stats.hired}`);
      console.log(`   Rejected: ${stats.rejected}`);
      
      // Show raw status distribution
      const statusCount = {};
      companyApps.forEach(app => {
        statusCount[app.status] = (statusCount[app.status] || 0) + 1;
      });
      
      console.log('\n📊 Raw status distribution:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }
  }
  
  console.log('\n✨ Test completed!');
}

testStatusUpdates().then(() => process.exit(0)).catch(console.error);