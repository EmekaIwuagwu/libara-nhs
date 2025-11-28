-- Create NHS credentials table for storing encrypted NHS portal login credentials

CREATE TABLE IF NOT EXISTS nhs_credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    portal ENUM('scotland', 'england') NOT NULL,
    username_encrypted TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_portal (user_id, portal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for faster lookups
CREATE INDEX idx_user_portal ON nhs_credentials(user_id, portal);
CREATE INDEX idx_is_verified ON nhs_credentials(is_verified);
