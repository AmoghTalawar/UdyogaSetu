# Udyoga Setu - Job Application Kiosk System

A modern job application platform with kiosk support, voice applications, and QR code scanning capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Supabase account
- Clerk account (for authentication)

### Installation

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```
   - Add your Clerk credentials:
     ```env
     VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
     ```

3. **Setup Database**
   - Go to your Supabase SQL Editor
   - Run the setup script: `database/setup/supabase_schema.sql`
   - Run the fix script: `database/fixes/fix_foreign_key_constraint.sql`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
UdyogaSetu/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions
│   ├── services/          # API services
│   └── types/             # TypeScript types
├── public/                # Static assets
├── database/              # Database files
│   ├── setup/            # Initial database setup
│   └── fixes/            # Database fix scripts
├── scripts/               # Utility scripts
│   ├── setup/            # Setup scripts
│   └── testing/          # Testing scripts
├── docs/                  # Documentation
│   ├── guides/           # Setup and usage guides
│   └── testing/          # Testing documentation
└── [config files]         # Configuration files

```

## 🔧 Configuration Files

- **`.env`** - Environment variables (create from `.env.example`)
- **`vite.config.ts`** - Vite configuration
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.js`** - Tailwind CSS configuration
- **`eslint.config.js`** - ESLint configuration

## 📚 Documentation

All documentation is organized in the `docs/` directory:

### Setup Guides (`docs/guides/`)
- **QUICK_FIX_GUIDE.md** - Quick fixes for common issues
- **SUPABASE_SETUP.md** - Complete Supabase setup guide
- **DATABASE_SETUP.md** - Database configuration
- **IMPLEMENTATION_GUIDE.md** - Implementation details
- **VOICE_APPLICATION_GUIDE.md** - Voice application setup

### Testing Guides (`docs/testing/`)
- **JOB_MODERATION_TESTING_GUIDE.md** - Job moderation testing
- **QR_UPLOAD_TESTING.md** - QR code upload testing

## 🗄️ Database

### Setup Scripts (`database/setup/`)
- **supabase_schema.sql** - Complete database schema
- **supabase_functions.sql** - Database functions
- **create_videos_bucket.sql** - Video storage setup
- **sample_data.sql** - Sample data for testing

### Fix Scripts (`database/fixes/`)
- **fix_foreign_key_constraint.sql** - Fix foreign key issues
- **fix_jobs_table.sql** - Update jobs table structure
- **fix_all_permissions.sql** - Fix RLS policies

## 🛠️ Scripts

### Setup Scripts (`scripts/setup/`)
- **setup-supabase.cjs** - Automated Supabase setup
- **setup-mobile.cjs** - Mobile configuration

### Testing Scripts (`scripts/testing/`)
- Various testing utilities for debugging

## 🐛 Troubleshooting

### Common Issues

1. **Invalid Supabase URL**
   - Ensure `.env` file exists with valid credentials
   - Check `docs/guides/QUICK_FIX_GUIDE.md`

2. **Foreign Key Constraint Error**
   - Run `database/fixes/fix_foreign_key_constraint.sql`
   - See `docs/guides/QUICK_FIX_GUIDE.md` for details

3. **Environment Variables Not Loading**
   - Restart development server
   - Verify `.env` file is in project root
   - Check variable names start with `VITE_`

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🔐 Environment Variables

Required variables in `.env`:

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key

# Optional
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-token
```

## 🚀 Features

- ✅ Job posting and management
- ✅ Kiosk application support
- ✅ QR code scanning
- ✅ Voice applications
- ✅ Resume upload
- ✅ Application tracking
- ✅ SMS/WhatsApp notifications
- ✅ Company dashboard
- ✅ Application moderation

## 🤝 Contributing

1. Keep the organized directory structure
2. Place new SQL scripts in appropriate `database/` folders
3. Add documentation to `docs/guides/`
4. Test scripts go in `scripts/testing/`

## 📝 License

[Your License Here]

## 🆘 Support

For issues and questions:
1. Check `docs/guides/QUICK_FIX_GUIDE.md`
2. Review relevant documentation in `docs/`
3. Check browser console for errors
4. Verify Supabase dashboard logs

---

**Last Updated:** 2025-11-17  
**Version:** 1.0.0