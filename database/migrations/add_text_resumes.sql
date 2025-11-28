-- Add text_resumes table for storing text-based CVs
-- This migration adds support for text resumes alongside file-based resumes

CREATE TABLE IF NOT EXISTS text_resumes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resume_name VARCHAR(255) NOT NULL DEFAULT 'My Text Resume',
    personal_statement TEXT,
    work_experience TEXT,
    education TEXT,
    skills TEXT,
    certifications TEXT,
    references_text TEXT,
    full_cv_text TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
