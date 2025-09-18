import { supabase } from './supabase';

export const addCompanyColumnsToDatabase = async () => {
  try {
    console.log('🔧 Attempting to add company columns to jobs table...');
    
    // Try to add the columns using raw SQL
    const { data, error } = await supabase.rpc('add_company_columns', {});
    
    if (error) {
      console.error('❌ Failed to add columns via RPC, trying direct SQL:', error);
      
      // Fallback: Try using raw SQL query
      const { error: sqlError } = await supabase
        .from('jobs')
        .select('company_name, company_about')
        .limit(1);
        
      if (sqlError && sqlError.message.includes('does not exist')) {
        console.log('✅ Confirmed: company columns do not exist in the jobs table');
        console.log('🔧 Please add these columns manually in Supabase dashboard:');
        console.log('   1. Go to your Supabase project dashboard');
        console.log('   2. Navigate to Table Editor > jobs table');
        console.log('   3. Add column: company_name (type: text)');
        console.log('   4. Add column: company_about (type: text)');
        
        return {
          success: false,
          error: 'Missing columns',
          suggestion: 'Add company_name and company_about columns to the jobs table'
        };
      }
    }
    
    console.log('✅ Company columns check completed');
    return { success: true };
    
  } catch (error) {
    console.error('🚨 Error checking/adding company columns:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Check database connection and permissions'
    };
  }
};

// Function to test if the columns exist by trying to select them
export const testCompanyColumnsExist = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, company_name, company_about')
      .limit(1);
    
    if (error) {
      if (error.message.includes('does not exist')) {
        return { exist: false, error: error.message };
      }
      throw error;
    }
    
    return { exist: true, data };
  } catch (error) {
    return { 
      exist: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};