# QR Code Upload System - Testing Guide

## Overview
This system allows users to upload resume files via QR code scanning on their mobile phones, with Supabase storage integration, eliminating the need for default resumes.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Mobile Access
Run the setup script to auto-detect your local IP and create configuration:
```bash
npm run setup-mobile
```

This will:
- Auto-detect your computer's local network IP
- Create a `.env` file with network configuration
- Display setup instructions for Supabase

### 3. Set up Supabase (Recommended)
1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. In your project dashboard:
   - Go to Storage and create a bucket named `resumes`
   - Make the bucket public if you want direct file access
   - Go to Settings > API and copy your project URL and anon key
3. Update your `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Start Both Servers
Run both the frontend and upload server simultaneously:
```bash
npm run dev:full
```

This will start:
- Vite dev server on `http://0.0.0.0:5173` (accessible from mobile)
- Upload server on `http://localhost:3001` (fallback API)

### 3. Alternative: Start Servers Separately
If you prefer to run them separately:

Terminal 1 (Frontend):
```bash
npm run dev
```

Terminal 2 (Backend):
```bash
npm run upload-server
```

## Testing the Complete Flow

### Step 1: Access the Job Application
1. Open `http://localhost:5173` in your browser
2. Navigate to the Jobs page
3. Click "Apply" on any job listing
4. This opens the Apply Modal

### Step 2: Initiate QR Upload
1. In the Apply Modal, click the "QR Upload" tab
2. A QR code will be generated
3. Note the upload URL displayed (e.g., `http://localhost:5173/mobile-upload/abc123xyz`)

### Step 3: Upload via Mobile (or Simulate)
You have two options:

#### Option A: Real Mobile Testing (Recommended)
1. **Ensure your phone is on the same WiFi network as your computer**
2. Scan the QR code with your phone's camera
3. Your phone should open a URL like: `http://192.168.x.x:5173/mobile-upload/abc123xyz`
4. Upload a resume file (PDF, DOC, DOCX up to 5MB)

#### Option B: Desktop Simulation
1. Copy the upload URL from the QR code section
2. Open a new browser tab/window  
3. Paste the URL (e.g., `http://192.168.226.1:5173/mobile-upload/abc123xyz`)
4. Upload a resume file

### Step 4: Verify File Reception
1. Return to the original tab with the Apply Modal
2. Within 2-5 seconds, you should see:
   - Status change to "Resume uploaded successfully!"
   - File name displayed
   - "Use This File" button appears

### Step 5: Complete Application
1. Click "Use This File" 
2. Fill in the required applicant information (name, phone)
3. Click "Submit Application"
4. Verify the application includes the uploaded file (not a default resume)

## Troubleshooting

### QR Code Not Working?
- Ensure both servers are running
- Check browser console for errors
- Verify the upload URL is accessible

### File Upload Failing?
- Check if the upload server is running on port 3001
- Verify file size is under 5MB
- Ensure file type is PDF, DOC, or DOCX

### Mobile Access Issues?
- **Can't access the URL on mobile?**
  - Ensure your phone is on the same WiFi network
  - Check that Windows Firewall isn't blocking port 5173
  - Try accessing `http://YOUR_IP:5173` directly in mobile browser
  - Run `npm run setup-mobile` again to verify IP detection

### Connection Issues?
- Make sure both your IP on port 5173 and `localhost:3001` are accessible
- Check for CORS errors in browser console
- Try refreshing the page and generating a new QR code
- Verify Supabase credentials in `.env` file

## Key Features Fixed

1. **Supabase Storage**: Primary storage using Supabase for reliable, scalable file management
2. **Mobile Network Access**: QR codes generate network-accessible URLs for real mobile device testing
3. **No Default Resume**: Application submission validates that a real file exists
4. **QR Code Integration**: Properly connects mobile upload with the main application
5. **Multi-layer Fallback**: Supabase → Local Server → IndexedDB for maximum reliability
6. **Auto Network Detection**: Automatically detects your local IP for mobile access

## Technical Details

### File Storage Strategy
- **Primary**: Supabase Storage with automatic file management
- **Fallback 1**: Local HTTP server with file upload API
- **Fallback 2**: Browser IndexedDB for offline functionality
- **Cleanup**: Automatic cleanup of expired uploads (30 minutes)
- **Metadata**: Optional database tracking of uploaded files

### Security Features
- CORS protection
- File size limits (5MB)
- File type validation
- Upload ID expiration
- Automatic cleanup of old files

### API Endpoints
- **Supabase Storage API** - Primary file upload and retrieval
- `POST /api/upload` - Local server file upload (fallback)
- `GET /api/check/:uploadId` - Check upload status (fallback)
- `GET /api/health` - Server health check

## Expected Behavior

✅ **What should work:**
- QR code generation and scanning
- File upload via mobile URL
- Real-time status updates
- File validation and storage
- Application submission with actual uploaded files

❌ **What was fixed:**
- Default resume being used instead of uploaded files
- QR code not connecting to actual file uploads
- No validation of uploaded files
- Missing file storage system
- Broken mobile upload routing