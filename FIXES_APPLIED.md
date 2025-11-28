# LibaraNHS - Bug Fixes Applied

## Date: 2025-11-28

## Issues Fixed

### 1. Foreign Key Constraint Error
**Problem:** The application was failing to save submitted applications to the database with error:
```
Cannot add or update a child row: a foreign key constraint fails (`libaranhs`.`applications`, CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE)
```

**Root Cause:** The automation code was using `textResume.id` as `resume_id` in the applications table, but the foreign key constraint expects a value from the `resumes` table, not `text_resumes` table.

**Solution:**
- Created migration file: `database/migrations/fix_applications_text_resume.sql`
- Modified `Application.create()` to accept `text_resume_id` parameter
- Updated automation service to use `text_resume_id` instead of `resume_id`

**Files Modified:**
- `src/models/Application.js` - Updated create method to handle both resume_id and text_resume_id
- `src/services/automation/index.js` - Changed to use text_resume_id when saving applications
- `database/migrations/fix_applications_text_resume.sql` - New migration file

### 2. Missing Email Service Methods
**Problem:** The automation was calling non-existent methods:
- `emailService.sendApplicationSummary is not a function`
- `emailService.sendAutomationError is not a function`

**Solution:** Added the missing methods to EmailService class with proper logging.

**Files Modified:**
- `src/services/emailService.js` - Added `sendApplicationSummary()` and `sendAutomationError()` methods

### 3. Selector Timeout Issues
**Problem:** NHS Jobs automation was timing out on many selectors (5000ms timeout), failing to find elements on the page.

**Solution:**
- Increased timeout values to allow more time for page loads:
  - SHORT: 3000ms → 5000ms
  - MEDIUM: 5000ms → 10000ms
  - LONG: 10000ms → 15000ms

**Files Modified:**
- `src/services/automation/constants.js` - Increased timeout values

## Required Actions

### CRITICAL: Apply Database Migration

You MUST run the following migration before the application will work correctly:

```bash
# Option 1: Using mysql command
mysql -u root -p libaranhs < database/migrations/fix_applications_text_resume.sql

# Option 2: Using mysql workbench or phpmyadmin
# Copy and paste the contents of database/migrations/fix_applications_text_resume.sql

# Option 3: Direct SQL (if you have access to MySQL console)
mysql -u root -p
use libaranhs;
source database/migrations/fix_applications_text_resume.sql;
```

**Migration Contents:**
```sql
ALTER TABLE applications
  MODIFY resume_id INT NULL,
  ADD COLUMN text_resume_id INT NULL AFTER resume_id,
  ADD FOREIGN KEY (text_resume_id) REFERENCES text_resumes(id) ON DELETE CASCADE;

CREATE INDEX idx_text_resume_id ON applications(text_resume_id);
```

### Restart PM2 Process

After applying the migration, restart the application:

```bash
pm2 restart libaranhs
pm2 logs libaranhs --lines 50
```

## Remaining Selector Issues

The selector issues may be due to:

1. **NHS Jobs Website Changes**: The NHS Jobs website structure may have changed since the selectors were defined. You may need to:
   - Inspect the actual NHS Jobs application pages
   - Update selectors in `src/services/automation/constants.js` to match current page structure
   - Test the automation manually with headless: false to see what's happening

2. **Application Flow**: The automation assumes a specific flow through the application. If NHS Jobs has changed their application process, the step files may need updating:
   - `src/services/automation/applicationSteps/*.js`

3. **Debugging Recommendations**:
   - Run automation with `headless: false` to see browser actions
   - Check screenshots in `./screenshots/` directory for error states
   - Review element selectors using browser DevTools on NHS Jobs website

## Testing Recommendations

1. **Test with Single Application:**
   ```javascript
   // Set maxApplications to 1 for testing
   automationConfig.maxApplications = 1;
   automationConfig.headless = false; // See what's happening
   ```

2. **Verify Database:**
   ```sql
   -- Check text_resumes exist for the user
   SELECT * FROM text_resumes WHERE user_id = <YOUR_USER_ID>;

   -- Check if applications are being saved
   SELECT * FROM applications ORDER BY created_at DESC LIMIT 10;
   ```

3. **Monitor Logs:**
   ```bash
   pm2 logs libaranhs --lines 100
   ```

## Summary

The critical fixes have been applied to resolve:
✅ Foreign key constraint errors - **REQUIRES MIGRATION**
✅ Email service method errors
✅ Timeout issues (increased timeout values)

The selector issues may require website-specific debugging as the NHS Jobs website structure may have changed. Review the actual website to verify selectors are still valid.

## Need Help?

If selector issues persist:
1. Enable screenshots: Already enabled in automation
2. Run with headless: false to watch the browser
3. Inspect NHS Jobs website elements with browser DevTools
4. Update selectors in `src/services/automation/constants.js` accordingly
