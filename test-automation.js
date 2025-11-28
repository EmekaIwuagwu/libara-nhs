// test-automation.js
// Script to apply database migration and test NHS Jobs automation

const { query } = require('./src/config/database');
const { startAutomation } = require('./src/services/automation');

async function applyMigration() {
    console.log('\n========================================');
    console.log('APPLYING DATABASE MIGRATION');
    console.log('========================================\n');

    try {
        // Check if text_resume_id column already exists
        const checkColumn = await query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'libaranhs'
            AND TABLE_NAME = 'applications'
            AND COLUMN_NAME = 'text_resume_id'
        `);

        if (checkColumn.length > 0) {
            console.log('[MIGRATION] text_resume_id column already exists, skipping migration');
            return true;
        }

        console.log('[MIGRATION] Applying migration: Adding text_resume_id column...');

        // Make resume_id nullable
        await query('ALTER TABLE applications MODIFY resume_id INT NULL');
        console.log('[MIGRATION] ✓ Made resume_id nullable');

        // Add text_resume_id column
        await query(`
            ALTER TABLE applications
            ADD COLUMN text_resume_id INT NULL AFTER resume_id
        `);
        console.log('[MIGRATION] ✓ Added text_resume_id column');

        // Add foreign key constraint
        await query(`
            ALTER TABLE applications
            ADD FOREIGN KEY (text_resume_id) REFERENCES text_resumes(id) ON DELETE CASCADE
        `);
        console.log('[MIGRATION] ✓ Added foreign key constraint');

        // Add index
        await query('CREATE INDEX idx_text_resume_id ON applications(text_resume_id)');
        console.log('[MIGRATION] ✓ Created index');

        console.log('\n[MIGRATION] Migration completed successfully!\n');
        return true;

    } catch (error) {
        console.error('[MIGRATION] Error:', error.message);
        return false;
    }
}

async function testAutomation(userId, configId) {
    console.log('\n========================================');
    console.log('TESTING NHS JOBS AUTOMATION');
    console.log('========================================\n');

    try {
        const options = {
            maxApplications: 1, // Only test with 1 application
            headless: false, // Set to false to watch the automation
            slowMo: 100 // Slow down actions to see what's happening
        };

        console.log('[TEST] Starting automation...');
        console.log(`[TEST] User ID: ${userId}`);
        console.log(`[TEST] Config ID: ${configId}`);
        console.log(`[TEST] Max Applications: ${options.maxApplications}`);
        console.log(`[TEST] Headless: ${options.headless}`);
        console.log('');

        const result = await startAutomation(userId, configId, options);

        console.log('\n========================================');
        console.log('AUTOMATION TEST RESULTS');
        console.log('========================================\n');
        console.log('Success:', result.success);
        if (result.summary) {
            console.log('Total attempts:', result.summary.total);
            console.log('Successful:', result.summary.successful);
            console.log('Failed:', result.summary.failed);
        }
        if (result.error) {
            console.log('Error:', result.error);
        }

        return result;

    } catch (error) {
        console.error('\n[TEST] Automation test failed:', error.message);
        console.error(error.stack);
        return { success: false, error: error.message };
    }
}

async function main() {
    try {
        // Get userId and configId from command line arguments
        const userId = parseInt(process.argv[2]) || 1;
        const configId = parseInt(process.argv[3]) || 1;

        if (!userId || !configId) {
            console.error('\n[ERROR] Please provide userId and configId as command line arguments');
            console.error('Usage: node test-automation.js <userId> <configId>');
            console.error('\nRun "node setup-test-data.js" first to create test data');
            process.exit(1);
        }

        // Step 1: Apply migration
        const migrationSuccess = await applyMigration();

        if (!migrationSuccess) {
            console.error('\n[ERROR] Migration failed. Cannot proceed with testing.');
            process.exit(1);
        }

        // Step 2: Test automation
        console.log('\n[INFO] Starting automation test in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const result = await testAutomation(userId, configId);

        // Exit with appropriate code
        process.exit(result.success ? 0 : 1);

    } catch (error) {
        console.error('\n[FATAL] Test script failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the test
main();
