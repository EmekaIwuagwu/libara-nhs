-- LibaraNHS Database Schema
-- MySQL 8.0+

-- Drop existing tables if they exist
DROP TABLE IF EXISTS application_logs;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS nhs_credentials;
DROP TABLE IF EXISTS application_configs;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscriptions table
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan ENUM('free', 'pro', 'max') DEFAULT 'free',
    status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
    applications_limit INT DEFAULT 5,
    applications_used INT DEFAULT 0,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Resumes table
CREATE TABLE resumes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application configurations table
CREATE TABLE application_configs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    config_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_location VARCHAR(255) NOT NULL,
    skills TEXT NOT NULL,
    min_salary DECIMAL(10,2),
    max_salary DECIMAL(10,2),
    profile_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NHS credentials table (encrypted)
CREATE TABLE nhs_credentials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    portal ENUM('scotland', 'england') NOT NULL,
    username_encrypted VARCHAR(500) NOT NULL,
    password_encrypted VARCHAR(500) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_portal (user_id, portal),
    INDEX idx_user_id (user_id),
    INDEX idx_portal (portal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Applications submitted table
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    config_id INT NOT NULL,
    resume_id INT NOT NULL,
    portal ENUM('scotland', 'england') NOT NULL,
    job_reference VARCHAR(255),
    job_title VARCHAR(255) NOT NULL,
    employer VARCHAR(255),
    status ENUM('pending', 'submitted', 'failed', 'withdrawn') DEFAULT 'pending',
    cover_letter TEXT,
    submission_date TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (config_id) REFERENCES application_configs(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_portal (portal),
    INDEX idx_submission_date (submission_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Application logs table
CREATE TABLE application_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    screenshot_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    s.plan,
    s.applications_limit,
    s.applications_used,
    COUNT(DISTINCT a.id) as total_applications,
    SUM(CASE WHEN a.status = 'submitted' THEN 1 ELSE 0 END) as successful_applications,
    SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
    SUM(CASE WHEN a.status = 'failed' THEN 1 ELSE 0 END) as failed_applications
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN applications a ON u.id = a.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email, s.plan, s.applications_limit, s.applications_used;
