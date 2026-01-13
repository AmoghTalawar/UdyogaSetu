// Fix company IDs in jobs table to match current user
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// UUID conversion function
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

async function fixCompanyIds() {
  console.log('🔧 Fixing company IDs in jobs table...');
  
  // You need to replace this with your actual Clerk user ID
  // You can find this in your browser's developer tools when logged into the dashboard
  const yourClerkUserId = 'user_2pQEJHgJ57DQpRfPq3ZCUKPHjMz'; // Replace with your actual Clerk user ID
  const correctCompanyId = clerkUserIdToUuid(yourClerkUserId);
  
  console.log('👤 Your Clerk User ID:', yourClerkUserId);
  console.log('🏢 Correct Company UUID:', correctCompanyId);
  
  // Update all jobs to use the correct company_id
  const { data, error } = await supabase
    .from('jobs')
    .update({ company_id: correctCompanyId })
    .neq('company_id', correctCompanyId)
    .select('id, title');
  
  if (error) {
    console.error('❌ Error updating jobs:', error);
    return;
  }
  
  console.log(`✅ Updated ${data?.length || 0} jobs with correct company ID`);
  if (data && data.length > 0) {
    console.log('📝 Updated jobs:');
    data.forEach(job => console.log(`  - ${job.title} (${job.id})`));
  }
  
  // Verify the fix by testing application fetch
  console.log('\n🧪 Testing application fetch with corrected company ID...');
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
    .eq('jobs.company_id', correctCompanyId)
    .order('created_at', { ascending: false });
  
  if (appsError) {
    console.error('❌ Error fetching applications:', appsError);
  } else {
    console.log(`✅ Now finding ${apps?.length || 0} applications for your company!`);
    if (apps && apps.length > 0) {
      console.log('📄 Sample application:');
      console.log(`  - ${apps[0].applicant_name} applied for ${apps[0].jobs.title}`);
    }
  }
  
  console.log('\n✨ Fix complete! Your dashboard should now show applications.');
}

fixCompanyIds().then(() => process.exit(0)).catch(console.error);