import { supabase } from './supabase';

export const inspectJobsTable = async () => {
  try {
    // Try to get table structure by querying with limit 0
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Failed to inspect jobs table:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    // If we have data, show the structure
    if (data && data.length > 0) {
      const sampleRecord = data[0];
      console.log('📋 Sample job record structure:');
      Object.keys(sampleRecord).forEach(key => {
        const value = sampleRecord[key];
        const type = Array.isArray(value) ? 'array' : typeof value;
        console.log(`  ${key}: ${type} = ${JSON.stringify(value)}`);
      });
      
      return {
        success: true,
        structure: Object.keys(sampleRecord),
        sample: sampleRecord
      };
    }
    
    // If no data, try to understand why
    console.log('ℹ️ Jobs table exists but is empty');
    return {
      success: true,
      structure: [],
      sample: null,
      message: 'Table exists but is empty'
    };
    
  } catch (error) {
    console.error('🚨 Exception while inspecting table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Expected structure for comparison (matches actual database schema)
export const expectedJobsStructure = [
  'id',
  'company_id',
  'title', 
  'location',
  'job_type',
  'salary_min',
  'salary_max',
  'salary_currency',
  'description',
  'requirements',
  'benefits',
  'experience_level',
  'skills',
  'application_deadline',
  'contact_email',
  'status',
  'total_applications',
  'kiosk_enabled',
  'qr_code_url',
  'created_at',
  'updated_at'
];

export const compareTableStructure = async () => {
  const inspection = await inspectJobsTable();
  
  if (!inspection.success) {
    return inspection;
  }
  
  const actualStructure = inspection.structure || [];
  const missing = expectedJobsStructure.filter(col => !actualStructure.includes(col));
  const extra = actualStructure.filter(col => !expectedJobsStructure.includes(col));
  
  console.log('🔍 Table structure comparison:');
  console.log('Expected columns:', expectedJobsStructure);
  console.log('Actual columns:', actualStructure);
  
  if (missing.length > 0) {
    console.log('❌ Missing columns:', missing);
  }
  
  if (extra.length > 0) {
    console.log('➕ Extra columns:', extra);
  }
  
  if (missing.length === 0 && extra.length === 0) {
    console.log('✅ Table structure matches expected format');
  }
  
  return {
    success: true,
    matches: missing.length === 0 && extra.length === 0,
    missing,
    extra,
    actualStructure,
    expectedStructure: expectedJobsStructure
  };
};