-- LibaraNHS Sample Data
-- This file contains sample data for testing

-- Note: Password for all test users is 'password123'
-- Hashed with bcrypt (10 rounds): $2b$10$rM8YqQZ5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e

-- Insert sample users
INSERT INTO users (first_name, last_name, email, username, password, phone, is_active, email_verified) VALUES
('John', 'Doe', 'john.doe@example.com', 'johndoe', '$2b$10$rM8YqQZ5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e', '+44 7700 900123', TRUE, TRUE),
('Jane', 'Smith', 'jane.smith@example.com', 'janesmith', '$2b$10$rM8YqQZ5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e', '+44 7700 900124', TRUE, TRUE),
('Michael', 'Johnson', 'michael.johnson@example.com', 'michaelj', '$2b$10$rM8YqQZ5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e5y5aGf5OqYqQZ5e', '+44 7700 900125', TRUE, FALSE);

-- Insert subscriptions for users
INSERT INTO subscriptions (user_id, plan, status, applications_limit, applications_used, start_date) VALUES
(1, 'pro', 'active', 50, 12, CURRENT_TIMESTAMP),
(2, 'free', 'active', 5, 3, CURRENT_TIMESTAMP),
(3, 'max', 'active', 999999, 45, CURRENT_TIMESTAMP);

-- Insert sample application configurations
INSERT INTO application_configs (user_id, config_name, job_title, job_location, skills, min_salary, max_salary, profile_summary, is_active) VALUES
(1, 'Primary Config', 'Registered Nurse', 'Edinburgh', 'Patient Care, Emergency Response, Clinical Documentation, Team Leadership', 28000.00, 35000.00, 'Experienced RN with 5 years in acute care settings. Strong clinical skills and excellent patient communication.', TRUE),
(1, 'Secondary Config', 'Staff Nurse', 'Glasgow', 'Wound Care, Medication Administration, Patient Assessment', 26000.00, 32000.00, 'Compassionate nurse with expertise in surgical ward management.', TRUE),
(2, 'Main Config', 'Healthcare Assistant', 'London', 'Patient Support, Vital Signs Monitoring, Hygiene Care', 22000.00, 26000.00, 'Dedicated HCA with 2 years experience in elderly care.', TRUE),
(3, 'Config 1', 'Nurse Practitioner', 'Manchester', 'Advanced Clinical Assessment, Prescribing, Chronic Disease Management', 40000.00, 50000.00, 'ANP with 10 years experience in primary care and specialist clinics.', TRUE);

-- Note: Actual resume files would need to be uploaded by users
-- This is just metadata for demonstration

-- Insert sample applications
INSERT INTO applications (user_id, config_id, resume_id, portal, job_reference, job_title, employer, status, submission_date) VALUES
(1, 1, 1, 'scotland', 'NHS-SCO-2024-001', 'Registered Nurse - Emergency Department', 'NHS Lothian', 'submitted', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 DAY)),
(1, 1, 1, 'scotland', 'NHS-SCO-2024-002', 'Staff Nurse - ICU', 'NHS Greater Glasgow and Clyde', 'submitted', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY)),
(1, 2, 1, 'scotland', 'NHS-SCO-2024-003', 'Staff Nurse - Surgical Ward', 'NHS Tayside', 'pending', CURRENT_TIMESTAMP),
(2, 3, 2, 'england', 'NHS-ENG-2024-101', 'Healthcare Assistant', 'Royal Free London NHS Foundation Trust', 'submitted', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY)),
(2, 3, 2, 'england', 'NHS-ENG-2024-102', 'Healthcare Assistant - Elderly Care', 'University College London Hospitals NHS Trust', 'failed', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY)),
(3, 4, 3, 'england', 'NHS-ENG-2024-201', 'Nurse Practitioner - Primary Care', 'Manchester University NHS Foundation Trust', 'submitted', DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY));

-- Insert sample application logs
INSERT INTO application_logs (application_id, action, details) VALUES
(1, 'Login Successful', 'Successfully logged into NHS Scotland portal'),
(1, 'Job Search', 'Searched for Registered Nurse positions in Edinburgh'),
(1, 'Application Started', 'Began application for job reference NHS-SCO-2024-001'),
(1, 'Form Filled', 'Completed all required application fields'),
(1, 'Resume Uploaded', 'Successfully uploaded resume document'),
(1, 'Application Submitted', 'Application submitted successfully'),
(2, 'Login Successful', 'Successfully logged into NHS Scotland portal'),
(2, 'Application Submitted', 'Application submitted successfully'),
(5, 'Login Failed', 'Failed to login - credentials may be incorrect'),
(5, 'Application Failed', 'Could not complete application due to login failure');
