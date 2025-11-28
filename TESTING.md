# NHS Jobs Automation - Testing Guide

This guide provides instructions for testing the NHS Jobs automation with the corrected selectors and flow.

## Prerequisites

1. MySQL database running with `libaranhs` database
2. Node.js installed (v14 or higher)
3. NHS Jobs credentials (England portal)

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

**Note**: If Puppeteer download fails with 403 error, this is normal in some environments. The dependencies are still installed correctly.

### Step 2: Configure Database

Make sure your `.env` file has the correct database connection:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=libaranhs
DB_PORT=3306
```

### Step 3: Set Up Test Data

Run the setup script to create test user, credentials, resume, and config:

```bash
node setup-test-data.js
```

This will:
- Create a test user
- Add NHS credentials (dev@soledadrobotics.com)
- Create a text resume with sample CV
- Create an application config
- Apply database migration for `text_resume_id` column

The script will output the User ID and Config ID to use for testing.

### Step 4: Run the Automation Test

```bash
node test-automation.js <userId> <configId>
```

Replace `<userId>` and `<configId>` with the values from Step 3.

Example:
```bash
node test-automation.js 1 1
```

## Test Settings

The test is configured with:
- **maxApplications**: 1 (only applies to one job)
- **headless**: false (you can watch the browser)
- **slowMo**: 100ms (slowed down to see actions)

## What the Test Does

The automation will:

1. **Login** to NHS Jobs with provided credentials
2. **Search** for jobs matching the config (job title + location)
3. **Filter** out TRAC jobs (only applies to internal NHS applications)
4. **Complete application** with these steps:
   - Contact Details (select email preference)
   - Right to Work (select Yes)
   - CV Input (paste text CV)
   - Safeguarding (select No convictions)
   - Fitness to Practice (3x No selections)
   - Guaranteed Interview Scheme (No to both questions)
   - Equality & Diversity (8 questions with various answers)
   - Socio-Economic Background (3 questions - Prefer not to say)
   - Declaration (agree and submit)
5. **Save** application to database
6. **Email** notification (logged to console)

## Expected Output

You should see console output like:

```
========================================
APPLYING DATABASE MIGRATION
========================================

[MIGRATION] Applying migration: Adding text_resume_id column...
[MIGRATION] ✓ Made resume_id nullable
[MIGRATION] ✓ Added text_resume_id column
[MIGRATION] ✓ Added foreign key constraint
[MIGRATION] ✓ Created index
[MIGRATION] Migration completed successfully!

========================================
TESTING NHS JOBS AUTOMATION
========================================

[TEST] Starting automation...
[TEST] User ID: 1
[TEST] Config ID: 1
[TEST] Max Applications: 1
[TEST] Headless: false

[ORCHESTRATOR] Starting automation for user 1 with config 1
[LOGIN] ========== LOGGING IN ==========
[SEARCH] ========== SEARCHING FOR JOBS ==========
...
```

## Monitoring

During the test:
1. Watch the browser window (if headless: false)
2. Monitor console output for each step
3. Check `./screenshots/` directory for error screenshots

## Verifying Results

After the test completes:

### Check Database

```sql
-- Check if application was saved
SELECT * FROM applications WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1;

-- Check application details
SELECT
    a.id,
    a.job_title,
    a.status,
    a.job_reference,
    a.created_at,
    tr.resume_name
FROM applications a
LEFT JOIN text_resumes tr ON a.text_resume_id = tr.id
WHERE a.user_id = 1
ORDER BY a.created_at DESC;
```

### Check Console Output

Look for:
- ✅ `[STEP] ... completed successfully` for each application step
- ✅ `NHS JOBS AUTOMATION - COMPLETED`
- ✅ `Total applications submitted: 1`
- ✅ `[ORCHESTRATOR] Automation completed. 1/X applications submitted.`

## Troubleshooting

### Error: NHS credentials not found

Check that NHS credentials exist:

```sql
SELECT * FROM nhs_credentials WHERE user_id = 1 AND portal = 'england';
```

If missing, run `node setup-test-data.js` again.

### Error: No default text resume found

Check that text resume exists:

```sql
SELECT * FROM text_resumes WHERE user_id = 1 AND is_default = TRUE;
```

If missing, run `node setup-test-data.js` again.

### Error: Application configuration not found

Check that config exists:

```sql
SELECT * FROM application_configs WHERE id = 1 AND user_id = 1;
```

If missing, run `node setup-test-data.js` again.

### Selector Timeouts

If you see many "Failed to click" messages:
1. Check that NHS Jobs website hasn't changed structure
2. Increase timeout values in `src/services/automation/constants.js`
3. Run with `headless: false` to watch what's happening
4. Check screenshots in `./screenshots/` directory

### Foreign Key Constraint Error

If you still get foreign key errors:
1. Check migration was applied: `SHOW COLUMNS FROM applications LIKE 'text_resume_id'`
2. If not, run: `node test-automation.js` (migration runs automatically)

## Selector Documentation

All selectors are documented in `src/services/automation/constants.js` and match the HTML structure provided.

## Running in Production

For production use via PM2:

1. Update NHS credentials in database (encrypted)
2. Use API endpoint to trigger automation
3. Set `headless: true` for server environments
4. Monitor via `pm2 logs libaranhs`

## Support

For issues or questions:
1. Check the console output for error messages
2. Review screenshots in `./screenshots/` directory
3. Check `FIXES_APPLIED.md` for known issues and solutions
4. Verify selectors match current NHS Jobs website structure
