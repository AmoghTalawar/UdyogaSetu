# UdyogaSetu - Project Structure

## 📂 Clean & Organized Directory Structure

```
UdyogaSetu/
│
├── 📄 README.md                    # Main project documentation
├── 📄 .env                         # Environment variables (configured)
├── 📄 .env.example                 # Environment template
├── 📄 package.json                 # Dependencies and scripts
├── 📄 vite.config.ts              # Vite configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 eslint.config.js            # ESLint configuration
├── 📄 vercel.json                 # Vercel deployment config
├── 📄 index.html                  # Entry HTML file
├── 🖼️  Udyoga setu.png            # Project logo
│
├── 📁 src/                         # Source Code
│   ├── components/                # React components
│   ├── pages/                     # Page components
│   ├── utils/                     # Utility functions
│   ├── services/                  # API services
│   ├── types/                     # TypeScript types
│   ├── contexts/                  # React contexts
│   ├── hooks/                     # Custom hooks
│   ├── assets/                    # Images, fonts, etc.
│   ├── styles/                    # Global styles
│   ├── App.tsx                    # Main App component
│   └── main.tsx                   # Entry point
│
├── 📁 public/                      # Static Assets
│   └── [images, icons, etc.]
│
├── 📁 database/                    # Database Files
│   ├── setup/                     # Initial Setup Scripts
│   │   ├── supabase_schema.sql           # Complete DB schema
│   │   ├── supabase_functions.sql        # Database functions
│   │   ├── create_videos_bucket.sql      # Video storage setup
│   │   ├── sample_data.sql               # Sample data
│   │   └── [other setup files]
│   │
│   └── fixes/                     # Fix Scripts
│       ├── fix_foreign_key_constraint.sql  # Foreign key fix
│       ├── fix_jobs_table.sql              # Jobs table updates
│       ├── fix_all_permissions.sql         # RLS policies
│       └── [other fix scripts]
│
├── 📁 scripts/                     # Utility Scripts
│   ├── setup/                     # Setup Scripts
│   │   ├── setup-supabase.cjs            # Supabase automation
│   │   ├── setup-mobile.cjs              # Mobile config
│   │   └── upload-server.cjs             # Upload server
│   │
│   └── testing/                   # Testing Scripts
│       ├── test_fetch.cjs                # API testing
│       ├── test_video_functionality.cjs  # Video testing
│       └── [other test scripts]
│
├── 📁 docs/                        # Documentation
│   ├── guides/                    # Setup & Usage Guides
│   │   ├── QUICK_FIX_GUIDE.md           # Quick fixes
│   │   ├── SUPABASE_SETUP.md            # Supabase setup
│   │   ├── DATABASE_SETUP.md            # Database config
│   │   ├── IMPLEMENTATION_GUIDE.md      # Implementation
│   │   ├── VOICE_APPLICATION_GUIDE.md   # Voice features
│   │   └── [other guides]
│   │
│   └── testing/                   # Testing Documentation
│       ├── JOB_MODERATION_TESTING_GUIDE.md
│       └── QR_UPLOAD_TESTING.md
│
└── 📁 database_updates/            # Database Migration History
    └── [migration files]
```

## 🎯 Key Directories Explained

### `/src` - Source Code
All application source code including components, pages, utilities, and services.

### `/database` - Database Management
- **`/setup`**: Initial database schema and setup scripts
- **`/fixes`**: SQL scripts to fix specific issues

### `/scripts` - Automation & Testing
- **`/setup`**: Automated setup and configuration scripts
- **`/testing`**: Testing and debugging utilities

### `/docs` - Documentation
- **`/guides`**: Comprehensive setup and usage documentation
- **`/testing`**: Testing procedures and guides

### `/public` - Static Assets
Images, icons, and other static files served directly.

## 📋 Important Files

### Configuration Files (Root)
- **`.env`** - Environment variables (DO NOT commit)
- **`.env.example`** - Template for environment variables
- **`package.json`** - Project dependencies and scripts
- **`vite.config.ts`** - Build tool configuration
- **`tsconfig.json`** - TypeScript compiler options
- **`tailwind.config.js`** - CSS framework configuration

### Key Documentation
- **`README.md`** - Main project documentation
- **`docs/guides/QUICK_FIX_GUIDE.md`** - Quick problem solving
- **`docs/guides/SUPABASE_SETUP.md`** - Database setup

### Essential Database Scripts
- **`database/setup/supabase_schema.sql`** - Complete schema
- **`database/fixes/fix_foreign_key_constraint.sql`** - Fix FK issues

## 🚀 Quick Navigation

### To Start Development:
1. Check `README.md`
2. Configure `.env` from `.env.example`
3. Run database setup from `database/setup/`
4. Start with `npm run dev`

### To Fix Issues:
1. Check `docs/guides/QUICK_FIX_GUIDE.md`
2. Run relevant scripts from `database/fixes/`
3. Review specific guides in `docs/guides/`

### To Test Features:
1. Use scripts from `scripts/testing/`
2. Follow guides in `docs/testing/`

## 🧹 Maintenance

### Adding New Features:
- Source code → `src/`
- Database changes → `database/fixes/` or `database_updates/`
- Documentation → `docs/guides/`
- Tests → `scripts/testing/`

### Keeping Clean:
- All test files → `scripts/testing/`
- All SQL fixes → `database/fixes/`
- All docs → `docs/`
- No loose files in root (except configs)

## 📊 File Count Summary

```
Root Level:        15 files (configs only)
Source Code:       src/ directory
Database:          ~20 SQL files (organized)
Scripts:           ~13 utility scripts (organized)
Documentation:     ~9 guide files (organized)
```

---

**Status:** ✅ Clean & Well-Organized  
**Last Organized:** 2025-11-17  
**Structure Version:** 1.0