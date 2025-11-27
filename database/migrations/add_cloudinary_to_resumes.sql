-- Migration: Add Cloudinary support to resumes table
-- Run this on your production database

-- Add Cloudinary columns
ALTER TABLE resumes
  ADD COLUMN cloudinary_url VARCHAR(500) AFTER file_path,
  ADD COLUMN cloudinary_public_id VARCHAR(255) AFTER cloudinary_url,
  ADD COLUMN cloudinary_secure_url VARCHAR(500) AFTER cloudinary_public_id;

-- Make old file_path nullable (for migrating to Cloudinary)
ALTER TABLE resumes
  MODIFY COLUMN file_path VARCHAR(500) NULL;

-- Add index on cloudinary_public_id for faster lookups
CREATE INDEX idx_cloudinary_public_id ON resumes(cloudinary_public_id);

-- Display updated schema
DESCRIBE resumes;
