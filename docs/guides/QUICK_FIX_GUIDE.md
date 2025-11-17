# Quick Fix Guide for UdyogaSetu Issues

## Issues Found and Solutions

### Issue 1: Invalid Supabase URL ✅ FIXED
**Error:** `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL`

**Solution:** Created `.env` file with proper structure.

**Action Required:**
1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```
3. Get these values from: https://supabase.com/dashboard → Your Project → Settings → API

---

### Issue 2: Foreign Key Constraint Violation ⚠️ NEEDS FIX
**Error:** `insert or update on table "jobs" violates foreign key constraint "fk_jobs_company_id"`

**Root Cause:** The `jobs` table requires a `company_id` that exists in the `companies` table, but no company record is being created when users sign up.

**Solution Options:**

#### **Option A: Quick Fix (Recommended for Development)**
Run this SQL in your Supabase SQL Editor:

```sql
-- Remove the foreign key constraint
ALTER TABLE jobs 
DROP CONSTRAINT IF EXISTS fk_jobs_company_id;

-- Add missing columns
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_about TEXT;
```

This allows you to post jobs immediately without company records.

#### **Option B: Automatic Company Creation (Better for Production)**
Run the complete script from `fix_foreign_key_constraint.sql` in your Supabase SQL Editor. This will:
1. Drop the constraint
2. Create a trigger that automatically creates company records when jobs are posted
3. Add missing columns

#### **Option C: Manual Company Creation**
Create a company record for your user before posting jobs:

```sql
-- Replace the values with your actual user data
INSERT INTO companies (
    id,
    clerk_user_id,
    company_name,
    company_email,
    is_active
) VALUES (
    'your-uuid-here',  -- Use the UUID from clerkUserIdToUuid(user.id)
    'your-clerk-user-id',  -- Your Clerk user ID
    'Your Company Name',
    'your-email@example.com',
    true
);
```

---

## Step-by-Step Fix Instructions

### Step 1: Update Environment Variables
1. Open `.env` file in the project root
2. Add your Supabase credentials (see Issue 1 above)
3. Save the file

### Step 2: Fix Database Schema
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Choose **Option A** (Quick Fix) or **Option B** (Automatic) from above
5. Copy and paste the SQL code
6. Click **Run** or press `Ctrl+Enter`
7. Verify success message appears

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test Job Posting
1. Navigate to the Post Job page
2. Fill in all required fields
3. Click "Post Job"
4. Check browser console for any errors

---

## Verification Checklist

- [ ] `.env` file exists with valid Supabase credentials
- [ ] Supabase URL starts with `https://` and ends with `.supabase.co`
- [ ] Supabase anon key is a long string (not placeholder text)
- [ ] Foreign key constraint removed or trigger created
- [ ] Development server restarted
- [ ] Can successfully post a job without errors

---

## Additional Database Setup (If Needed)

If you haven't set up the database tables yet, run these in order:

1. **Create all tables:**
   ```bash
   # In Supabase SQL Editor, run:
   supabase_schema.sql
   ```

2. **Fix jobs table:**
   ```bash
   # Then run:
   fix_jobs_table.sql
   ```

3. **Fix foreign key:**
   ```bash
   # Finally run:
   fix_foreign_key_constraint.sql
   ```

---

## Troubleshooting

### Still getting foreign key errors?
- Verify the constraint was actually dropped:
  ```sql
  SELECT constraint_name 
  FROM information_schema.table_constraints 
  WHERE table_name = 'jobs' AND constraint_type = 'FOREIGN KEY';
  ```
- If constraint still exists, manually drop it:
  ```sql
  ALTER TABLE jobs DROP CONSTRAINT fk_jobs_company_id;
  ```

### Jobs table doesn't exist?
- Run the complete schema from `supabase_schema.sql`
- Or follow the `SUPABASE_SETUP.md` guide

### Environment variables not loading?
- Make sure `.env` file is in the project root (same level as `package.json`)
- Restart your development server completely
- Check for typos in variable names (must be `VITE_SUPABASE_URL` not `REACT_APP_SUPABASE_URL`)

---

## Quick Test Commands

Test your Supabase connection:
```javascript
// In browser console:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key present:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

---

## Need More Help?

1. Check browser console for detailed error messages
2. Check Supabase Dashboard → Logs for database errors
3. Verify all SQL scripts ran successfully
4. Make sure you're using the correct Supabase project

---

**Last Updated:** 2025-11-17
**Status:** Ready to fix issues