// Test the actual application fetch
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔧 Using Supabase URL:', supabaseUrl?.substring(0, 30) + '...');
console.log('🔑 Using Supabase Key:', supabaseKey?.substring(0, 30) + '...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('🧪 Testing application fetch...');
  
  // Get a sample company_id from the jobs table
  const { data: jobs } = await supabase
    .from('jobs')
    .select('company_id')
    .limit(1);
    
  if (!jobs || jobs.length === 0) {
    console.log('❌ No jobs found');
    return;
  }
  
  const companyId = jobs[0].company_id;
  console.log('🏢 Using company ID:', companyId);
  
  // Now try to fetch applications for this company (same as ApplicationService)
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner(
        id,
        title,
        company_id
      )
    `)
    .eq('jobs.company_id', companyId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Found applications:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('📄 Sample with job info:', data[0]);
    }
  }
}

testFetch().then(() => process.exit(0)).catch(console.error);