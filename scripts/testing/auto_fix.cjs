// Automatic fix for company ID mismatch
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function autoFix() {
  console.log('🔧 Auto-fixing company ID issues...');
  
  // Method 1: Create a company record with the existing company_id
  // This is simpler and doesn't require changing job data
  
  // First, get the existing company_id from jobs
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('company_id')
    .limit(1);
  
  if (jobsError || !jobs || jobs.length === 0) {
    console.error('❌ Could not find jobs:', jobsError);
    return;
  }
  
  const existingCompanyId = jobs[0].company_id;
  console.log('🏢 Found company ID in jobs:', existingCompanyId);
  
  // Check if a company record already exists
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('*')
    .eq('id', existingCompanyId)
    .single();
  
  if (existingCompany) {
    console.log('✅ Company record already exists:', existingCompany.company_name);
  } else {
    console.log('📝 Creating company record...');
    
    // Create a company record with the existing ID
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert([{
        id: existingCompanyId,
        clerk_user_id: 'temp_user_id', // Temporary - will be updated
        company_name: 'Your Company',
        company_email: 'contact@yourcompany.com',
        company_description: 'Company created automatically to fix application display',
        industry: 'Technology',
        company_size: '11-50',
        location: 'Remote'
      }])
      .select()
      .single();
    
    if (companyError) {
      console.error('❌ Error creating company:', companyError);
      return;
    }
    
    console.log('✅ Created company record:', newCompany.company_name);
  }
  
  // Now test if applications are fetched correctly
  console.log('🧪 Testing application fetch...');
  const { data: apps, error: appsError } = await supabase
    .from('applications')
    .select(`
      *,
      jobs!inner(
        id,
        title,
        company_id
      )
    `)
    .eq('jobs.company_id', existingCompanyId)
    .order('created_at', { ascending: false });
  
  if (appsError) {
    console.error('❌ Error fetching applications:', appsError);
  } else {
    console.log(`✅ Successfully found ${apps?.length || 0} applications!`);
    if (apps && apps.length > 0) {
      console.log('📄 Sample applications:');
      apps.slice(0, 3).forEach(app => {
        console.log(`  - ${app.applicant_name} applied for ${app.jobs.title}`);
      });
    }
  }
  
  console.log('\n✨ Fix complete! Your dashboard should now show applications.');
  console.log('💡 Note: You may want to update the company details in your dashboard settings.');
}

autoFix().then(() => process.exit(0)).catch(console.error);