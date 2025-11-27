-- Migration: Add base64 storage support to resumes table
-- This allows storing resumes directly in the database using compressed base64

-- Add column for compressed base64 data
ALTER TABLE resumes
  ADD COLUMN file_data LONGTEXT AFTER cloudinary_secure_url,
  ADD COLUMN is_compressed BOOLEAN DEFAULT TRUE AFTER file_data;

-- Make cloudinary columns nullable (for migration from cloud to base64)
ALTER TABLE resumes
  MODIFY COLUMN cloudinary_url VARCHAR(500) NULL,
  MODIFY COLUMN cloudinary_public_id VARCHAR(255) NULL,
  MODIFY COLUMN cloudinary_secure_url VARCHAR(500) NULL;

-- Make file_path nullable (already done in previous migration, but ensuring)
ALTER TABLE resumes
  MODIFY COLUMN file_path VARCHAR(500) NULL;

-- Add index on is_compressed for faster lookups
CREATE INDEX idx_is_compressed ON resumes(is_compressed);

-- Display updated schema
DESCRIBE resumes;
