-- Fix applications table to support text resumes
-- Make resume_id nullable and add text_resume_id column

ALTER TABLE applications
  MODIFY resume_id INT NULL,
  ADD COLUMN text_resume_id INT NULL AFTER resume_id,
  ADD FOREIGN KEY (text_resume_id) REFERENCES text_resumes(id) ON DELETE CASCADE;

-- Add index for text_resume_id
CREATE INDEX idx_text_resume_id ON applications(text_resume_id);
