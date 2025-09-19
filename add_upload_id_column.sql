-- Migration: Add upload_id column to uploaded_files table
-- This column is needed for the QR upload functionality

-- Add the upload_id column
ALTER TABLE uploaded_files
ADD COLUMN upload_id text;

-- Add index for performance
CREATE INDEX idx_uploaded_files_upload_id ON uploaded_files(upload_id);

-- Update RLS policy to allow access based on upload_id for temporary uploads
CREATE POLICY "Temporary upload access" ON uploaded_files
FOR ALL USING (
    upload_id IS NOT NULL OR
    application_id IS NULL OR
    EXISTS (
        SELECT 1 FROM applications a
        JOIN jobs j ON a.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN company_users cu ON c.id = cu.company_id
        WHERE a.id = uploaded_files.application_id
        AND (
            c.clerk_user_id = auth.jwt() ->> 'sub' OR
            (cu.clerk_user_id = auth.jwt() ->> 'sub' AND cu.is_active = true)
        )
    )
);

SELECT 'upload_id column added successfully!' as status;