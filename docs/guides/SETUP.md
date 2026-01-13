# Job Portal Setup Guide

## 🚀 Complete Professional Job Portal

This is a complete job portal system with:
- **Company Authentication** (Clerk)
- **Job Posting & Management** 
- **Voice & QR Code Applications**
- **Admin Moderation System**
- **Real-time Database** (Supabase)

---

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Supabase account
- Clerk account

---

## 🛠 Installation

### 1. Clone and Install Dependencies

```bash
git clone [your-repo-url]
cd project
npm install
```

### 2. Install Required Packages

```bash
# Authentication
npm install @clerk/clerk-react

# Icons and UI
npm install lucide-react

# Database client (if not already installed)
npm install @supabase/supabase-js
```

---

## ⚙️ Configuration

### 1. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Network Configuration (for mobile access)
REACT_APP_LOCAL_IP=192.168.1.100

# Optional: OpenAI for voice transcription
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Set up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Create a new application
3. Copy your publishable key to `.env`
4. Enable email/password authentication
5. Configure redirect URLs:
   - Sign-in redirect: `/company/dashboard`
   - Sign-up redirect: `/company/dashboard`

### 3. Set up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key to `.env`
4. Run the database schema:

Go to **SQL Editor** in Supabase and run the schema from `src/utils/supabase-schema.sql`:

```sql
-- The complete schema is in src/utils/supabase-schema.sql
-- Copy and paste all contents into the SQL editor and run
```

This will create:
- `jobs` table for job postings
- `applications` table for job applications
- `companies` table for company profiles
- Row Level Security (RLS) policies
- Sample data for testing

---

## 🏃‍♂️ Running the Application

```bash
npm start
```

The application will be available at:
- **Local**: http://localhost:3000
- **Mobile**: http://[your-ip]:3000 (replace with your network IP)

---

## 📱 Features Overview

### 🏠 **Home Page**
- Job browsing for candidates
- Company login portal
- Voice and QR application features

### 🏢 **Company Features**
- **Authentication**: Secure login/signup with Clerk
- **Dashboard**: Overview of jobs, applications, metrics
- **Job Posting**: Professional job creation form
- **Job Moderation**: Built-in moderation queue for approving/rejecting jobs
- **Applicant Management**: View candidates, resumes, voice recordings
- **Analytics**: Hiring performance metrics and moderation stats

### 👥 **Candidate Features**
- **Job Search**: Browse and filter jobs
- **Voice Application**: Record voice answers
- **QR Code Application**: Quick apply via mobile
- **Resume Upload**: Traditional application method

### 🛡️ **Admin Features**
- **Job Moderation**: Approve/reject job postings
- **Content Filtering**: Flag inappropriate content
- **Company Management**: Oversee employer accounts
- **Analytics Dashboard**: Platform-wide metrics

---

## 🔄 Navigation Flow

### For Companies:
1. **Home** → **Company Login** → **Dashboard**
2. **Dashboard** → **Post Job** → **Job Moderation** → **Approve/Reject**
3. **Dashboard** → **View Candidates** → **Hire/Reject**
4. **Dashboard** → **Analytics** → **View Performance Metrics**

### For Job Seekers:
1. **Home** → **Browse Jobs** → **Apply**
2. **Job Details** → **Voice/QR Application** → **Submit**

### For Admins:
1. **Admin Login** → **Moderation Queue**
2. **Review Jobs** → **Approve/Reject** → **Analytics**

---

## 📊 Database Schema

### Jobs Table
```sql
- id (UUID, Primary Key)
- title (Text)
- company (Text) 
- location (Text)
- type (full-time, part-time, contract, remote)
- salary_min, salary_max (Integer)
- description (Text)
- requirements (Text Array)
- benefits (Text Array)
- experience (entry, mid, senior, lead)
- skills (Text Array)
- application_deadline (Date)
- contact_email (Text)
- company_id (Text - Clerk User ID)
- status (active, draft, closed, pending)
- created_at, updated_at (Timestamp)
```

### Applications Table
```sql
- id (UUID, Primary Key)
- job_id (UUID, Foreign Key)
- applicant_name (Text)
- applicant_email (Text)
- applicant_phone (Text)
- resume_url (Text)
- voice_recording_url (Text)
- voice_transcript (Text)
- application_type (qr, voice)
- status (new, reviewed, interview, hired, rejected)
- ai_score (Integer, 0-100)
- created_at, updated_at (Timestamp)
```

---

## 🔐 Security Features

- **Row Level Security**: Users only access their own data
- **Authentication**: Secure JWT tokens via Clerk
- **Input Validation**: Server-side validation for all forms
- **File Upload Security**: Secure resume and audio storage
- **Admin Controls**: Moderation and content filtering

---

## 🎯 Key Components

### Pages:
- `HomePage.tsx` - Landing page with job search
- `CompanyLoginPage.tsx` - Company authentication
- `CompanySignupPage.tsx` - Company registration  
- `CompanyDashboard.tsx` - Company management hub
- `PostJobPage.tsx` - Job creation form
- `CandidateDetailsPage.tsx` - Individual candidate view
- `AdminModerationPage.tsx` - Job approval system
- `JobsPage.tsx` - Public job listings

### Services:
- `jobService.ts` - Database operations for jobs
- `supabase.ts` - Database client configuration

### Components:
- `SupabaseJobCard.tsx` - Job display component
- `MultilingualVoiceRecorder.tsx` - Voice application
- `ApplyModal.tsx` - Application submission

---

## 🚨 Troubleshooting

### Common Issues:

1. **Clerk errors**: Check publishable key is correct
2. **Supabase errors**: Verify URL and anon key
3. **Database errors**: Ensure schema is properly created
4. **Mobile access**: Check network IP configuration

### Debug Steps:

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test database connection in Supabase dashboard
4. Check Clerk authentication in dashboard

---

## 📈 Deployment

### For Production:

1. **Clerk**: Configure production domain in settings
2. **Supabase**: Update RLS policies for production
3. **Environment**: Use production API keys
4. **Build**: `npm run build`
5. **Deploy**: Upload `build/` folder to hosting provider

---

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review component documentation
3. Test with sample data provided in schema
4. Verify all environment variables are correctly set

---

## 🎉 You're Ready!

Your professional job portal is now set up with:
- ✅ Company authentication and management
- ✅ Job posting and application system  
- ✅ Voice and QR code applications
- ✅ Admin moderation tools
- ✅ Real-time database integration
- ✅ Professional UI/UX design

Start by creating a company account and posting your first job!