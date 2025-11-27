-- Add base64 storage column for resumes
-- This allows storing resumes directly in the database as compressed base64

ALTER TABLE resumes
  ADD COLUMN base64_data LONGTEXT AFTER mime_type,
  ADD COLUMN compression_type VARCHAR(20) DEFAULT 'gzip' AFTER base64_data;

-- Add index for faster queries
CREATE INDEX idx_user_base64 ON resumes(user_id, base64_data(100));

-- Make file_path and cloudinary fields optional since we're using base64
ALTER TABLE resumes
  MODIFY COLUMN file_path VARCHAR(500) NULL,
  MODIFY COLUMN cloudinary_url VARCHAR(500) NULL,
  MODIFY COLUMN cloudinary_public_id VARCHAR(255) NULL,
  MODIFY COLUMN cloudinary_secure_url VARCHAR(500) NULL;
