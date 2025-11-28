// Test script for NHS Jobs automation
const NHSJobsAutomation = require('./src/services/automation/nhsJobsAutomation');

async function testAutomation() {
    console.log('Starting NHS Jobs Automation Test...\n');

    const config = {
        username: 'dev@soledadrobotics.com',
        password: 'EmekaIwuagwu87**',
        jobTitle: 'nurse',
        location: 'London',
        cvText: 'Experienced healthcare professional with strong clinical skills.',
        maxApplications: 1, // Only test with 1 application
        headless: true, // Must run headless (no display server available)
        slowMo: 100 // Slow down actions for better visibility
    };

    const automation = new NHSJobsAutomation(config);

    try {
        const results = await automation.run();

        console.log('\n========================================');
        console.log('AUTOMATION TEST COMPLETED');
        console.log('========================================\n');

        const summary = automation.getResultsSummary();
        console.log('Summary:');
        console.log(`  Total: ${summary.total}`);
        console.log(`  Successful: ${summary.successful}`);
        console.log(`  Failed: ${summary.failed}`);
        console.log('\nDetailed Results:');
        console.log(JSON.stringify(summary.results, null, 2));

    } catch (error) {
        console.error('\n========================================');
        console.error('AUTOMATION TEST FAILED');
        console.error('========================================');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

testAutomation();
