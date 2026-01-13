import { supabase } from './supabase';
import { clerkUserIdToUuid } from './uuidUtils';

export const testSupabaseConnection = async () => {
  try {
    // Test basic connection with valid syntax
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message,
        suggestion: getErrorSuggestion(error.message)
      };
    }
    
    console.log('Supabase connection test successful:', data);
    return {
      success: true,
      message: 'Connected to Supabase successfully!'
    };
    
  } catch (error) {
    console.error('Supabase connection exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error',
      suggestion: 'Check your Supabase URL and API key in the .env file'
    };
  }
};

// Test job insertion with detailed diagnostics
export const testJobInsertion = async (userId: string) => {
  try {
    console.log('🧪 Testing job insertion with user ID:', userId);
    
    console.log('🔄 Bypassing company creation in test due to RLS issues');
    
    // Try to find existing company to use
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('id')
      .limit(1);
    
    let companyId = existingCompanies && existingCompanies.length > 0 
      ? existingCompanies[0].id 
      : null;
      
    if (companyId) {
      console.log('✅ Using existing company for test:', companyId);
    } else {
      console.log('⚠️ No existing company found via query');
      // Use known existing company_id from database sample data
      companyId = 'fd180f52-a408-4fa6-9335-b172c7b0f825';
      console.log('🔧 Using known existing company_id as fallback:', companyId);
    }
    
    // Test data with correct field names
    const testJob = {
      title: 'Test Job - ' + new Date().toISOString(),
      location: 'Test Location',
      job_type: 'full-time',
      salary_min: 50000,
      salary_max: 80000,
      salary_currency: 'USD',
      description: 'This is a test job posting to verify database connectivity.',
      requirements: ['Test requirement'],
      benefits: ['Test benefit'],
      experience_level: 'entry',
      skills: ['Testing'],
      application_deadline: null,
      contact_email: 'test@example.com',
      company_id: companyId,
      company_name: 'Test Company Name',
      company_about: 'This is a test company description for database testing.',
      status: 'active',
      kiosk_enabled: true,
      total_applications: 0
    };
    
    console.log('📝 Test job data:', testJob);
    
    // Attempt insertion
    const { data, error } = await supabase
      .from('jobs')
      .insert([testJob])
      .select();
    
    if (error) {
      console.error('❌ Job insertion test failed:', error);
      return {
        success: false,
        error: error.message,
        suggestion: getInsertionErrorSuggestion(error.message),
        details: error
      };
    }
    
    console.log('✅ Job insertion test successful:', data);
    
    // Clean up test job and company
    if (data && data[0]) {
      await supabase
        .from('jobs')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Test job cleaned up');
      
      // Also clean up test company if no other jobs exist for it
      const { data: otherJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId)
        .limit(1);
      
      if (!otherJobs || otherJobs.length === 0) {
        await supabase
          .from('companies')
          .delete()
          .eq('id', companyId);
        console.log('🧹 Test company cleaned up');
      }
    }
    
    return {
      success: true,
      message: 'Job insertion test successful!',
      data
    };
    
  } catch (error) {
    console.error('🚨 Job insertion test exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown insertion error',
      suggestion: 'Check console for detailed error information'
    };
  }
};

const getInsertionErrorSuggestion = (errorMessage: string): string => {
  if (errorMessage.includes('new row violates row-level security policy')) {
    return 'Row Level Security (RLS) policy is blocking the insert. You may need to disable RLS or create proper policies for authenticated users.';
  }
  
  if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
    return 'Column name mismatch. Check that your table columns match the expected names in the code.';
  }
  
  if (errorMessage.includes('permission denied')) {
    return 'Permission denied. Check your RLS policies and make sure the user has insert permissions.';
  }
  
  if (errorMessage.includes('authentication required')) {
    return 'Authentication required. Make sure you\'re signed in with Clerk and the user ID is being passed correctly.';
  }
  
  if (errorMessage.includes('not null violation')) {
    return 'Required field is missing. Check that all required columns have values.';
  }
  
  return 'Check the detailed error in the console for more information.';
};

const getErrorSuggestion = (errorMessage: string): string => {
  if (errorMessage.includes('relation "jobs" does not exist')) {
    return 'The jobs table does not exist. Please run the SQL commands from SUPABASE_SETUP.md to create the required tables.';
  }
  
  if (errorMessage.includes('Invalid API key') || errorMessage.includes('JWT')) {
    return 'Your Supabase API key might be incorrect or expired. Check your project settings.';
  }
  
  if (errorMessage.includes('permission denied') || errorMessage.includes('RLS')) {
    return 'Row Level Security policies might be blocking access. Check your RLS policies in Supabase.';
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network connection issue. Check your internet connection and Supabase project URL.';
  }
  
  return 'Check the SUPABASE_SETUP.md file for setup instructions.';
};

// Test function for console debugging
export const runSupabaseTest = async () => {
  console.log('🔧 Testing Supabase connection...');
  const result = await testSupabaseConnection();
  
  if (result.success) {
    console.log('✅', result.message);
  } else {
    console.error('❌ Supabase test failed:', result.error);
    console.log('💡 Suggestion:', result.suggestion);
  }
  
  return result;
};