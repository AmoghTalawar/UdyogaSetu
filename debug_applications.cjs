// Debug script to check applications data
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  console.log('📝 Make sure your .env file contains:');
  console.log('   REACT_APP_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   REACT_APP_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApplications() {
  console.log('🔍 Starting database debug...');
  
  // Check if applications table exists
  console.log('\n📋 Checking applications table...');
  const { data: applications, error: appsError } = await supabase
    .from('applications')
    .select('*')
    .limit(5);
  
  if (appsError) {
    console.error('❌ Error fetching applications:', appsError);
  } else {
    console.log('✅ Applications found:', applications?.length || 0);
    if (applications && applications.length > 0) {
      console.log('📄 Sample application:', applications[0]);
    }
  }
  
  // Check companies table
  console.log('\n🏢 Checking companies table...');
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .limit(5);
  
  if (companiesError) {
    console.error('❌ Error fetching companies:', companiesError);
  } else {
    console.log('✅ Companies found:', companies?.length || 0);
    if (companies && companies.length > 0) {
      console.log('📄 Sample company:', companies[0]);
    }
  }
  
  // Check jobs table
  console.log('\n💼 Checking jobs table...');
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*')
    .limit(5);
  
  if (jobsError) {
    console.error('❌ Error fetching jobs:', jobsError);
  } else {
    console.log('✅ Jobs found:', jobs?.length || 0);
    if (jobs && jobs.length > 0) {
      console.log('📄 Sample job:', jobs[0]);
    }
  }
  
  // Try to fetch applications with job details (like the app does)
  if (companies && companies.length > 0) {
    const sampleCompanyId = companies[0].id;
    console.log('\n🔗 Testing application fetch with company ID:', sampleCompanyId);
    
    const { data: joinedApps, error: joinError } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!inner(
          id,
          title,
          company_id
        )
      `)
      .eq('jobs.company_id', sampleCompanyId)
      .order('created_at', { ascending: false });
    
    if (joinError) {
      console.error('❌ Error fetching applications with join:', joinError);
    } else {
      console.log('✅ Applications with job details:', joinedApps?.length || 0);
      if (joinedApps && joinedApps.length > 0) {
        console.log('📄 Sample joined application:', joinedApps[0]);
      }
    }
  }
  
  console.log('\n🏁 Debug complete!');
}

// Run the debug function
debugApplications().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug script error:', error);
  process.exit(1);
});
