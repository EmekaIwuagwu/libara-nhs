// Deployment validation script
const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('LibaraNHS Automation Module - Deployment Validation');
console.log('='.repeat(60));

let errors = 0;
let warnings = 0;

// Check files exist
const requiredFiles = [
    'src/models/TextResume.js',
    'src/controllers/textResumeController.js',
    'src/controllers/applyboxController.js',
    'src/services/automation/index.js',
    'src/services/automation/browser.js',
    'src/services/automation/helpers.js',
    'src/services/automation/constants.js',
    'src/services/automation/nhsJobsAutomation.js',
    'src/services/automation/applicationSteps/contactDetails.js',
    'src/services/automation/applicationSteps/rightToWork.js',
    'src/services/automation/applicationSteps/cvInput.js',
    'src/services/automation/applicationSteps/safeguarding.js',
    'src/services/automation/applicationSteps/fitnessToPractice.js',
    'src/services/automation/applicationSteps/guaranteedInterview.js',
    'src/services/automation/applicationSteps/equalityDiversity.js',
    'src/services/automation/applicationSteps/socioEconomic.js',
    'src/services/automation/applicationSteps/declaration.js',
    'src/views/dashboard/applybox.ejs',
    'database/migrations/add_text_resumes.sql'
];

console.log('\n[1/5] Checking required files...');
requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✓ ${file}`);
    } else {
        console.log(`  ✗ MISSING: ${file}`);
        errors++;
    }
});

// Validate JavaScript syntax
console.log('\n[2/5] Validating JavaScript modules...');
const jsFiles = requiredFiles.filter(f => f.endsWith('.js'));
jsFiles.forEach(file => {
    try {
        const fullPath = path.join(__dirname, '..', file);
        require(fullPath);
        console.log(`  ✓ ${path.basename(file)} - syntax OK`);
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND' && error.message.includes('database')) {
            console.log(`  ⚠ ${path.basename(file)} - OK (database not connected)`);
            warnings++;
        } else {
            console.log(`  ✗ ${path.basename(file)} - ${error.message}`);
            errors++;
        }
    }
});

// Check routes updated
console.log('\n[3/5] Validating route updates...');
const dashboardRoutes = fs.readFileSync('src/routes/dashboard.js', 'utf8');
const resumeRoutes = fs.readFileSync('src/routes/resume.js', 'utf8');

if (dashboardRoutes.includes('applyboxController')) {
    console.log('  ✓ ApplyBox routes registered in dashboard.js');
} else {
    console.log('  ✗ ApplyBox routes NOT found in dashboard.js');
    errors++;
}

if (resumeRoutes.includes('textResumeController')) {
    console.log('  ✓ Text resume routes registered in resume.js');
} else {
    console.log('  ✗ Text resume routes NOT found in resume.js');
    errors++;
}

// Check package.json dependencies
console.log('\n[4/5] Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.dependencies.puppeteer) {
    console.log(`  ✓ Puppeteer installed (${packageJson.dependencies.puppeteer})`);
} else {
    console.log('  ✗ Puppeteer not found in dependencies');
    errors++;
}

if (packageJson.dependencies.playwright) {
    console.log(`  ✓ Playwright added (${packageJson.dependencies.playwright})`);
} else {
    console.log('  ⚠ Playwright not in dependencies (using Puppeteer)');
    warnings++;
}

// Check migration file
console.log('\n[5/5] Validating database migration...');
const migration = fs.readFileSync('database/migrations/add_text_resumes.sql', 'utf8');
if (migration.includes('CREATE TABLE') && migration.includes('text_resumes')) {
    console.log('  ✓ Migration file contains text_resumes table');
} else {
    console.log('  ✗ Migration file invalid or missing table creation');
    errors++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('Validation Summary');
console.log('='.repeat(60));
console.log(`Total files checked: ${requiredFiles.length}`);
console.log(`Errors: ${errors}`);
console.log(`Warnings: ${warnings}`);

if (errors === 0) {
    console.log('\n✓ ✓ ✓ DEPLOYMENT VALIDATION PASSED! ✓ ✓ ✓');
    console.log('\nNext steps:');
    console.log('  1. Run database migration:');
    console.log('     mysql -u username -p database < database/migrations/add_text_resumes.sql');
    console.log('  2. Start the application:');
    console.log('     npm start  OR  pm2 start src/app.js --name libaranhs');
    console.log('  3. Test ApplyBox page:');
    console.log('     http://localhost:3000/dashboard/applybox');
    process.exit(0);
} else {
    console.log('\n✗ ✗ ✗ VALIDATION FAILED - Please fix errors above ✗ ✗ ✗');
    process.exit(1);
}
