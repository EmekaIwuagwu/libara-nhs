// setup-test-data.js
// Script to set up test data for automation testing

const { query } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function setupTestData() {
    console.log('\n========================================');
    console.log('SETTING UP TEST DATA');
    console.log('========================================\n');

    try {
        // Step 1: Check if test user exists
        const users = await query('SELECT * FROM users WHERE email = ?', ['test@libaranhs.com']);

        let userId;
        if (users.length === 0) {
            console.log('[SETUP] Creating test user...');
            const hashedPassword = await bcrypt.hash('TestPassword123', 10);
            const result = await query(`
                INSERT INTO users (first_name, last_name, email, username, password, is_active, email_verified)
                VALUES (?, ?, ?, ?, ?, TRUE, TRUE)
            `, ['Test', 'User', 'test@libaranhs.com', 'testuser', hashedPassword]);
            userId = result.insertId;
            console.log(`[SETUP] ✓ Created test user with ID: ${userId}`);
        } else {
            userId = users[0].id;
            console.log(`[SETUP] Test user already exists with ID: ${userId}`);
        }

        // Step 2: Check/create subscription
        const subscriptions = await query('SELECT * FROM subscriptions WHERE user_id = ?', [userId]);
        if (subscriptions.length === 0) {
            console.log('[SETUP] Creating subscription...');
            await query(`
                INSERT INTO subscriptions (user_id, plan, status, applications_limit, applications_used)
                VALUES (?, 'pro', 'active', 100, 0)
            `, [userId]);
            console.log('[SETUP] ✓ Created subscription');
        } else {
            console.log('[SETUP] Subscription already exists');
        }

        // Step 3: Check/create NHS credentials
        const credentials = await query('SELECT * FROM nhs_credentials WHERE user_id = ? AND portal = ?', [userId, 'england']);
        if (credentials.length === 0) {
            console.log('[SETUP] Creating NHS credentials...');
            // For testing, we'll store the credentials as plain text (NOT SECURE - for testing only)
            // In production, these should be encrypted
            await query(`
                INSERT INTO nhs_credentials (user_id, portal, username_encrypted, password_encrypted, is_verified)
                VALUES (?, ?, ?, ?, TRUE)
            `, [userId, 'england', 'dev@soledadrobotics.com', 'EmekaIwuagwu87**']);
            console.log('[SETUP] ✓ Created NHS credentials');
        } else {
            console.log('[SETUP] Updating NHS credentials...');
            await query(`
                UPDATE nhs_credentials
                SET username_encrypted = ?, password_encrypted = ?
                WHERE user_id = ? AND portal = ?
            `, ['dev@soledadrobotics.com', 'EmekaIwuagwu87**', userId, 'england']);
            console.log('[SETUP] ✓ Updated NHS credentials');
        }

        // Step 4: Check/create text resume
        const textResumes = await query('SELECT * FROM text_resumes WHERE user_id = ?', [userId]);
        let textResumeId;
        if (textResumes.length === 0) {
            console.log('[SETUP] Creating text resume...');
            const cvText = `
PROFESSIONAL SUMMARY
Experienced healthcare professional with expertise in patient care and clinical administration.

WORK EXPERIENCE
Senior Nurse - General Hospital (2020-Present)
- Provided comprehensive patient care
- Managed clinical documentation
- Collaborated with multidisciplinary teams

EDUCATION
Bachelor of Science in Nursing - University of Health Sciences (2018)

SKILLS
- Patient Care
- Clinical Documentation
- Team Collaboration
- Healthcare Administration
            `.trim();

            const result = await query(`
                INSERT INTO text_resumes (user_id, resume_name, full_cv_text, is_default)
                VALUES (?, ?, ?, TRUE)
            `, [userId, 'Test Resume', cvText]);
            textResumeId = result.insertId;
            console.log(`[SETUP] ✓ Created text resume with ID: ${textResumeId}`);
        } else {
            textResumeId = textResumes[0].id;
            console.log(`[SETUP] Text resume already exists with ID: ${textResumeId}`);
        }

        // Step 5: Check/create application config
        const configs = await query('SELECT * FROM application_configs WHERE user_id = ?', [userId]);
        let configId;
        if (configs.length === 0) {
            console.log('[SETUP] Creating application config...');
            const result = await query(`
                INSERT INTO application_configs (user_id, config_name, job_title, job_location, skills, profile_summary, is_active)
                VALUES (?, ?, ?, ?, ?, ?, TRUE)
            `, [
                userId,
                'Test Config',
                'Nurse',
                'London',
                'Patient Care, Clinical Documentation, Team Collaboration',
                'Experienced healthcare professional seeking new opportunities'
            ]);
            configId = result.insertId;
            console.log(`[SETUP] ✓ Created application config with ID: ${configId}`);
        } else {
            configId = configs[0].id;
            console.log(`[SETUP] Application config already exists with ID: ${configId}`);
        }

        console.log('\n========================================');
        console.log('TEST DATA SETUP COMPLETE');
        console.log('========================================\n');
        console.log(`User ID: ${userId}`);
        console.log(`Config ID: ${configId}`);
        console.log(`Text Resume ID: ${textResumeId}`);
        console.log('\nYou can now run the automation test with:');
        console.log(`node test-automation.js ${userId} ${configId}`);
        console.log('');

        return { userId, configId, textResumeId };

    } catch (error) {
        console.error('[SETUP] Error:', error.message);
        console.error(error.stack);
        throw error;
    }
}

// Run the setup
setupTestData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Setup failed:', error.message);
        process.exit(1);
    });
