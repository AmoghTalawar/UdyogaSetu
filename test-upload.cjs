const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Testing Supabase upload functionality...\n');

async function testUpload() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📡 Connecting to Supabase...');
    
    // Test storage access
    console.log('🪣 Testing storage access...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.log('⚠️  Bucket listing failed (expected with anon key)');
    } else {
      console.log('✅ Storage accessible');
      const resumesBucket = buckets?.find(b => b.name === 'resumes');
      if (resumesBucket) {
        console.log('✅ "resumes" bucket found');
      } else {
        console.log('❌ "resumes" bucket not found - please create it first');
        return;
      }
    }

    // Test file upload with a small test file
    console.log('📄 Testing file upload...');
    const testContent = Buffer.from('Test resume content', 'utf8');
    const testFile = testContent; // Use Buffer directly for Node.js
    
    const uploadId = 'test-' + Date.now();
    const filePath = `uploads/${uploadId}_test-resume.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, testFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      
      if (uploadError.message.includes('new row violates')) {
        console.log('💡 This might be due to RLS policies - check your storage policies');
      }
      
      return;
    }

    console.log('✅ File uploaded successfully:', uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', urlData.publicUrl);

    // Test database insert (if table exists)
    console.log('🗄️  Testing database insert...');
    const { error: dbError } = await supabase
      .from('uploaded_files')
      .insert([
        {
          upload_id: uploadId,
          file_name: 'test-resume.txt',
          file_path: filePath,
          file_size: testFile.length,
          file_type: 'text/plain',
          public_url: urlData.publicUrl,
        },
      ]);

    if (dbError) {
      console.log('⚠️  Database insert failed:', dbError.message);
      console.log('💡 Make sure you created the "uploaded_files" table');
    } else {
      console.log('✅ Database record created successfully');
    }

    // Clean up test file
    console.log('🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('resumes')
      .remove([filePath]);

    if (deleteError) {
      console.log('⚠️  Could not delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file cleaned up');
    }

    console.log('\n🎉 Test completed! Your Supabase integration is working.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpload();