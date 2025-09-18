import { supabase } from './supabase';
import { clerkUserIdToUuid } from './uuidUtils';

// Function to update all existing jobs to use the correct company_id
export const updateJobsWithCorrectCompanyId = async (clerkUserId: string) => {
  try {
    const correctCompanyId = clerkUserIdToUuid(clerkUserId);
    console.log('🔧 Updating all jobs to use correct company_id:', correctCompanyId);
    
    // First, check what jobs currently exist
    const { data: allJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id, title, company_id, created_at');
    
    if (fetchError) {
      console.error('❌ Error fetching jobs:', fetchError);
      return { success: false, error: fetchError.message };
    }
    
    console.log('📋 Current jobs in database:');
    allJobs?.forEach(job => {
      console.log(`   Job: "${job.title}" | Company ID: ${job.company_id} | ${job.company_id === correctCompanyId ? '✅ Correct' : '❌ Wrong'}`);
    });
    
    // Update all jobs to use the correct company_id
    const { data: updateResult, error: updateError } = await supabase
      .from('jobs')
      .update({ company_id: correctCompanyId })
      .neq('company_id', correctCompanyId)
      .select('id, title');
    
    if (updateError) {
      console.error('❌ Error updating jobs:', updateError);
      return { success: false, error: updateError.message };
    }
    
    console.log('✅ Successfully updated jobs:', updateResult);
    console.log(`📊 Updated ${updateResult?.length || 0} jobs to use correct company_id`);
    
    return { 
      success: true, 
      message: `Updated ${updateResult?.length || 0} jobs to use correct company_id`,
      updatedJobs: updateResult
    };
    
  } catch (error) {
    console.error('🚨 Exception updating jobs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to be called from browser console
export const fixMyJobs = async () => {
  // This will be called manually from the browser console
  const clerkUserId = 'user_32YEN1zPK25DszcHomHcC4DYyts'; // Replace with actual user ID
  return await updateJobsWithCorrectCompanyId(clerkUserId);
};