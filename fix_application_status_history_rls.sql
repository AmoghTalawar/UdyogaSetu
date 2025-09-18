-- Fix Row Level Security policies for application_status_history table
-- This table needs INSERT/UPDATE policies to allow the status tracking trigger to work
-- Run this in your Supabase SQL Editor

-- Add missing INSERT policy for application_status_history table
-- This allows the trigger function to insert status history records automatically
CREATE POLICY "Triggers can insert status history" ON application_status_history
FOR INSERT WITH CHECK (true);

-- Add missing UPDATE policy (in case it's needed for future functionality)
CREATE POLICY "Company users can update status history" ON application_status_history
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE a.id = application_status_history.application_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE a.id = application_status_history.application_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

-- Grant necessary permissions to authenticated and anonymous users
-- This ensures the trigger function can execute regardless of auth state
GRANT INSERT ON application_status_history TO authenticated, anon;
GRANT SELECT, UPDATE ON application_status_history TO authenticated;

-- Verify the policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'application_status_history';

SELECT 'RLS policies for application_status_history table fixed successfully!' as status;