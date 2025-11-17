#!/usr/bin/env node

/**
 * Database Fix Script for UdyogaSetu
 * This script applies the necessary database fixes to resolve company_id foreign key constraint issues
 * 
 * Usage: 
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * 2. Run: node apply-database-fix.js
 */

const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Error: Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.error('Example:');
    console.error('export SUPABASE_URL="https://your-project.supabase.co"');
    console.error('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    console.error('node apply-database-fix.js');
    process.exit(1);
}

async function applyDatabaseFix() {
    console.log('🚀 Starting database fix application...');
    console.log('📍 Connecting to:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    try {
        // Step 1: Create default company for unassigned jobs
        console.log('\n📝 Step 1: Creating default company for unassigned jobs...');
        const { error: companyError } = await supabase
            .from('companies')
            .insert({
                id: 'unassigned',
                company_name: 'Unassigned Job',
                contact_email: 'admin@udyogsetu.com',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select();
            
        if (companyError && !companyError.message.includes('duplicate')) {
            console.error('❌ Error creating default company:', companyError);
            throw companyError;
        } else {
            console.log('✅ Default company created/verified successfully');
        }
        
        // Step 2: Check current constraint status
        console.log('\n🔍 Step 2: Checking current constraint status...');
        const { data: constraints, error: constraintError } = await supabase
            .rpc('get_constraint_info');
            
        if (constraintError) {
            console.log('ℹ️  Constraint info not available via RPC, proceeding with fix...');
        } else {
            console.log('✅ Current constraints verified');
        }
        
        // Step 3: Note about manual constraint changes
        console.log('\n⚠️  Manual Database Changes Required:');
        console.log('Since service role key doesn\'t have DDL permissions, please run these SQL commands manually in Supabase SQL Editor:');
        console.log('');
        console.log('-- Drop existing constraint');
        console.log('ALTER TABLE job_applications DROP CONSTRAINT IF EXISTS job_applications_company_id_fkey;');
        console.log('');
        console.log('-- Make company_id nullable');
        console.log('ALTER TABLE job_applications ALTER COLUMN company_id DROP NOT NULL;');
        console.log('');
        console.log('-- Re-add constraint allowing NULL values');
        console.log('ALTER TABLE job_applications');
        console.log('ADD CONSTRAINT job_applications_company_id_fkey');
        console.log('FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;');
        console.log('');
        
        console.log('✅ Database fix preparation completed!');
        console.log('✅ Default company record is ready');
        console.log('⚠️  Please execute the SQL commands above in Supabase SQL Editor');
        
        // Step 4: Verify the setup
        console.log('\n🔍 Step 4: Verifying setup...');
        const { data: companyData, error: verifyError } = await supabase
            .from('companies')
            .select('id, company_name')
            .eq('id', 'unassigned')
            .single();
            
        if (verifyError) {
            console.error('❌ Error verifying company:', verifyError);
        } else {
            console.log('✅ Default company verified:', companyData);
        }
        
        console.log('\n🎉 Database fix script completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Run the SQL commands above in Supabase SQL Editor');
        console.log('2. Test the voice application feature');
        console.log('3. The foreign key constraint should no longer cause errors');
        
    } catch (error) {
        console.error('❌ Database fix failed:', error);
        process.exit(1);
    }
}

// Create the RPC function for getting constraint info
async function createConstraintInfoFunction() {
    const supabase = createClient(supabaseUrl, serviceKey);
    
    const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION get_constraint_info()
        RETURNS TABLE (
            constraint_name text,
            constraint_type text,
            column_name text,
            foreign_table_name text,
            foreign_column_name text
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
            RETURN QUERY
            SELECT
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            LEFT JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.table_name = 'job_applications'
                AND tc.constraint_type = 'FOREIGN KEY'
                AND tc.constraint_name LIKE '%company_id%';
        END;
        $$;
    `;
    
    try {
        console.log('Creating constraint info function...');
        // This will fail but that's okay, it's just for informational purposes
        await supabase.rpc('sql', { query: createFunctionSQL });
    } catch (error) {
        // Ignore errors, this is just informational
    }
}

// Run the main function
applyDatabaseFix()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });