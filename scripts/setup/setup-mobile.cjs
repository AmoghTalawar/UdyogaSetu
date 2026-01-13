const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let localIP = null;

  // Look for the first non-internal IPv4 address
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        // Prefer addresses in common private ranges
        if (address.address.startsWith('192.168.') || 
            address.address.startsWith('10.') ||
            address.address.startsWith('172.')) {
          localIP = address.address;
          break;
        }
      }
    }
    if (localIP) break;
  }

  return localIP;
}

function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('📄 .env file already exists');
    
    // Read existing content
    const existingContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if VITE_LOCAL_IP is already set
    if (!existingContent.includes('VITE_LOCAL_IP=')) {
      const localIP = getLocalIP();
      if (localIP) {
        const newLine = `\n# Auto-detected local IP for mobile access\nVITE_LOCAL_IP=${localIP}\n`;
        fs.appendFileSync(envPath, newLine);
        console.log(`✅ Added VITE_LOCAL_IP=${localIP} to existing .env file`);
      }
    }
    return;
  }

  // Create new .env file
  const localIP = getLocalIP();
  
  let envContent = '';
  
  // Copy from example if it exists
  if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf8');
  }
  
  // Replace or add the local IP
  if (localIP) {
    if (envContent.includes('VITE_LOCAL_IP=')) {
      envContent = envContent.replace(/VITE_LOCAL_IP=.*/, `VITE_LOCAL_IP=${localIP}`);
    } else {
      envContent += `\n# Auto-detected local IP for mobile access\nVITE_LOCAL_IP=${localIP}\n`;
    }
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Created .env file with local IP: ${localIP}`);
}

function displayInstructions() {
  const localIP = getLocalIP();
  
  console.log('\n🚀 Mobile Upload Setup Complete!\n');
  console.log('📱 To test on mobile devices:');
  console.log('   1. Make sure your phone is on the same WiFi network');
  console.log(`   2. Your computer's IP address is: ${localIP}`);
  console.log(`   3. QR codes will generate URLs like: http://${localIP}:5173/mobile-upload/xyz`);
  console.log('\n⚙️  To set up Supabase:');
  console.log('   1. Create a Supabase project at https://supabase.com');
  console.log('   2. Create a storage bucket named "resumes"');
  console.log('   3. Add your Supabase URL and anon key to the .env file');
  console.log('   4. Optionally create an "uploaded_files" table for metadata tracking');
  console.log('\n🔥 Start the development servers:');
  console.log('   npm run dev:full');
  console.log('\n📋 Supabase Table Schema (optional):');
  console.log(`
CREATE TABLE uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  public_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies as needed
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
  `);
}

// Run setup
console.log('🔧 Setting up mobile upload configuration...\n');

try {
  createEnvFile();
  displayInstructions();
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}