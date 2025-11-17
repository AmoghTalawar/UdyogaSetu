#!/usr/bin/env node

/**
 * Database Structure Inspection Script for UdyogaSetu
 * This script inspects the current database structure to identify issues
 * 
 * Usage: 
 * 1. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 * 2. Run: node inspect-database.js
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
    console.error('node inspect-database.js');
    process.exit(1);
}

async function inspectDatabase() {
    console.log('🔍 Starting database structure inspection...');
    console.log('📍 Connecting to:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, serviceKey);
    
    try {
        // Step 1: Check all tables in the database
        console.log('\n📋 Step 1: Listing all tables...');
        const { data: tables, error: tablesError } = await supabase
            .rpc('get_all_tables');
            
        if (tablesError) {
            console.log('ℹ️  Using direct table queries to list tables...');
            // Query the information_schema directly
            const { data: schemaData, error: schemaError } = await supabase
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public')
                .eq('table_type', 'BASE TABLE');
                
            if (schemaError) {
                console.error('❌ Error getting table list:', schemaError);
            } else {
                console.log('✅ Tables found:', schemaData.map(t => t.table_name).join(', '));
            }
        } else {
            console.log('✅ Tables found:', tables.map(t => t.table_name).join(', '));
        }
        
        // Step 2: Check job_applications table structure
        console.log('\n📋 Step 2: Inspecting job_applications table structure...');
        await inspectTable(supabase, 'job_applications');
        
        // Step 3: Check companies table structure
        console.log('\n📋 Step 3: Inspecting companies table structure...');
        await inspectTable(supabase, 'companies');
        
        // Step 4: Check jobs table structure
        console.log('\n📋 Step 4: Inspecting jobs table structure...');
        await inspectTable(supabase, 'jobs');
        
        // Step 5: Check foreign key constraints
        console.log('\n🔗 Step 5: Inspecting foreign key constraints...');
        await checkForeignKeys(supabase);
        
        // Step 6: Check if there are any existing records
        console.log('\n📊 Step 6: Checking existing data...');
        await checkExistingData(supabase);
        
        console.log('\n✅ Database inspection completed!');
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error);
        process.exit(1);
    }
}

async function inspectTable(supabase, tableName) {
    try {
        // Get table columns
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', tableName)
            .eq('table_schema', 'public')
            .order('ordinal_position');
            
        if (columnsError) {
            console.log(`❌ Error getting columns for ${tableName}:`, columnsError.message);
            return;
        }
        
        console.log(`\n📋 ${tableName} table columns:`);
        columns.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '✅ NULL allowed' : '❌ NOT NULL';
            const defaultVal = col.column_default ? ` (default: ${col.column_default})` : '';
            console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        });
        
        // Get table constraints
        const { data: constraints, error: constraintsError } = await supabase
            .rpc('get_table_constraints', { table_name: tableName });
            
        if (!constraintsError && constraints) {
            console.log(`\n🔒 ${tableName} constraints:`);
            constraints.forEach(constraint => {
                console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
            });
        }
        
    } catch (error) {
        console.error(`❌ Error inspecting table ${tableName}:`, error);
    }
}

async function checkForeignKeys(supabase) {
    try {
        const { data: fkConstraints, error } = await supabase
            .from('information_schema.table_constraints')
            .select(`
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            `)
            .eq('tc.table_schema', 'public')
            .eq('tc.constraint_type', 'FOREIGN KEY')
            .order('tc.constraint_name');
            
        if (error) {
            console.error('❌ Error getting foreign key constraints:', error);
            return;
        }
        
        console.log('\n🔗 Foreign Key Constraints:');
        fkConstraints.forEach(fk => {
            console.log(`  - ${fk.constraint_name}: ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
        });
        
        // Check specifically for job_applications constraints
        const jobAppConstraints = fkConstraints.filter(fk => 
            fk.constraint_name.includes('job_applications')
        );
        
        if (jobAppConstraints.length > 0) {
            console.log('\n⚠️  job_applications specific constraints:');
            jobAppConstraints.forEach(fk => {
                console.log(`  - ${fk.constraint_name}: ${fk.column_name} → ${fk.foreign_table_name}(${fk.foreign_column_name})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking foreign keys:', error);
    }
}

async function checkExistingData(supabase) {
    try {
        // Check companies
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('id, company_name')
            .limit(10);
            
        if (companiesError) {
            console.log('❌ Error checking companies data:', companiesError.message);
        } else {
            console.log('\n📊 Companies data (first 10):');
            console.log(companies.map(c => `  - ${c.id}: ${c.company_name}`).join('\n'));
        }
        
        // Check jobs
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, title, company_id')
            .limit(10);
            
        if (jobsError) {
            console.log('❌ Error checking jobs data:', jobsError.message);
        } else {
            console.log('\n📊 Jobs data (first 10):');
            jobs.forEach(job => {
                console.log(`  - ${job.id}: ${job.title} (company_id: ${job.company_id})`);
            });
        }
        
        // Check job_applications
        const { data: applications, error: applicationsError } = await supabase
            .from('job_applications')
            .select('id, job_id, company_id, applicant_name')
            .limit(10);
            
        if (applicationsError) {
            console.log('❌ Error checking job_applications data:', applicationsError.message);
        } else {
            console.log('\n📊 job_applications data (first 10):');
            applications.forEach(app => {
                console.log(`  - ${app.id}: ${app.applicant_name} (job_id: ${app.job_id}, company_id: ${app.company_id})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error checking existing data:', error);
    }
}

// Run the main function
inspectDatabase()
    .then(() => {
        console.log('\n✅ Inspection completed successfully!');
        console.log('\n📝 Next steps based on findings:');
        console.log('1. Review the table structures above');
        console.log('2. Check the foreign key constraints');
        console.log('3. Verify the existing data relationships');
        console.log('4. Apply appropriate fixes based on the findings');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Inspection failed:', error);
        process.exit(1);
    });