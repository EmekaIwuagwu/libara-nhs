const {
  launchBrowser,
  closeBrowser,
  takeScreenshot,
  typeWithDelay,
  safeClick,
  waitForSelectorWithRetry,
  scrollToElement
} = require('./browser');
const Application = require('../../models/Application');
const { sendEmail } = require('../../config/email');

/**
 * NHS Scotland Job Application Automation
 * This is a template - selectors need to be updated based on actual NHS Scotland portal
 */

const NHS_SCOTLAND_URL = process.env.NHS_SCOTLAND_URL || 'https://jobs.scot.nhs.uk';

/**
 * Login to NHS Scotland portal
 * @param {Page} page - Puppeteer page object
 * @param {Object} credentials - User credentials
 * @returns {Promise<boolean>} Login success status
 */
async function login(page, credentials) {
  try {
    console.log('Navigating to NHS Scotland portal...');
    await page.goto(NHS_SCOTLAND_URL, { waitUntil: 'networkidle2' });

    // Take screenshot
    await takeScreenshot(page, `nhs-scotland-homepage-${Date.now()}.png`);

    // TODO: Update these selectors based on actual NHS Scotland portal
    // Click login button
    await safeClick(page, 'a[href*="login"], button[class*="login"]');

    // Enter credentials
    await typeWithDelay(page, 'input[name="username"], input[type="email"]', credentials.username);
    await typeWithDelay(page, 'input[name="password"], input[type="password"]', credentials.password);

    // Submit login form
    await safeClick(page, 'button[type="submit"], input[type="submit"]');

    // Wait for dashboard or profile indicator
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Verify login success
    await takeScreenshot(page, `nhs-scotland-logged-in-${Date.now()}.png`);

    console.log('✓ Login successful');
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    await takeScreenshot(page, `nhs-scotland-login-error-${Date.now()}.png`);
    return false;
  }
}

/**
 * Search for jobs based on configuration
 * @param {Page} page - Puppeteer page object
 * @param {Object} config - Application configuration
 * @returns {Promise<Array>} Array of job listings
 */
async function searchJobs(page, config) {
  try {
    console.log('Searching for jobs...');

    // Navigate to job search
    await page.goto(`${NHS_SCOTLAND_URL}/search`, { waitUntil: 'networkidle2' });

    // TODO: Update selectors based on actual portal
    // Enter job title
    await typeWithDelay(page, 'input[name="keywords"], input[id*="job-title"]', config.job_title);

    // Enter location
    await typeWithDelay(page, 'input[name="location"], input[id*="location"]', config.job_location);

    // Submit search
    await safeClick(page, 'button[type="submit"], .search-button');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-scotland-search-results-${Date.now()}.png`);

    // Parse job listings
    // TODO: Update selectors based on actual portal
    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.job-listing, .vacancy-item');
      return Array.from(jobElements).slice(0, 5).map(el => ({
        title: el.querySelector('.job-title, h2, h3')?.textContent.trim() || '',
        employer: el.querySelector('.employer, .organization')?.textContent.trim() || '',
        reference: el.querySelector('.reference, .job-id')?.textContent.trim() || '',
        link: el.querySelector('a')?.href || ''
      }));
    });

    console.log(`✓ Found ${jobs.length} jobs`);
    return jobs;
  } catch (error) {
    console.error('Job search failed:', error);
    return [];
  }
}

/**
 * Apply to a specific job
 * @param {Page} page - Puppeteer page object
 * @param {Object} job - Job details
 * @param {Object} applicationData - Application data (resume, cover letter, config)
 * @returns {Promise<boolean>} Application success status
 */
async function applyToJob(page, job, applicationData) {
  try {
    console.log(`Applying to: ${job.title}`);

    // Navigate to job details
    await page.goto(job.link, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-scotland-job-details-${Date.now()}.png`);

    // Click apply button
    await safeClick(page, 'button[class*="apply"], a[href*="apply"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Fill application form
    // TODO: Update selectors based on actual portal

    // Upload resume/CV
    const resumeInput = await page.$('input[type="file"][accept*="pdf"], input[name*="cv"]');
    if (resumeInput) {
      await resumeInput.uploadFile(applicationData.resumePath);
      console.log('✓ Resume uploaded');
    }

    // Fill cover letter
    const coverLetterField = await page.$('textarea[name*="cover"], textarea[id*="letter"]');
    if (coverLetterField) {
      await page.evaluate((el, text) => {
        el.value = text;
      }, coverLetterField, applicationData.coverLetter);
      console.log('✓ Cover letter added');
    }

    // Fill additional fields
    // Personal details, experience, etc.

    await takeScreenshot(page, `nhs-scotland-application-form-${Date.now()}.png`);

    // Submit application
    await safeClick(page, 'button[type="submit"], input[value*="Submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-scotland-application-submitted-${Date.now()}.png`);

    console.log('✓ Application submitted');
    return true;
  } catch (error) {
    console.error('Application submission failed:', error);
    await takeScreenshot(page, `nhs-scotland-application-error-${Date.now()}.png`);
    return false;
  }
}

/**
 * Main automation function
 * @param {Object} userData - User data
 * @param {Object} credentials - NHS credentials
 * @param {Object} config - Application configuration
 * @param {string} resumePath - Path to resume file
 * @param {string} coverLetter - Cover letter text
 * @returns {Promise<Object>} Automation result
 */
async function automateApplication(userData, credentials, config, resumePath, coverLetter) {
  let browser;
  const results = {
    success: false,
    applicationsSubmitted: 0,
    applicationsFailed: 0,
    errors: []
  };

  try {
    // Launch browser
    browser = await launchBrowser();
    const page = await browser.newPage();

    // Login
    const loginSuccess = await login(page, credentials);
    if (!loginSuccess) {
      results.errors.push('Login failed');
      return results;
    }

    // Search for jobs
    const jobs = await searchJobs(page, config);

    if (jobs.length === 0) {
      results.errors.push('No jobs found matching criteria');
      return results;
    }

    // Apply to each job
    for (const job of jobs) {
      try {
        // Create application record
        const applicationId = await Application.create({
          user_id: userData.id,
          config_id: config.id,
          resume_id: resumePath,
          portal: 'scotland',
          job_reference: job.reference,
          job_title: job.title,
          employer: job.employer,
          cover_letter: coverLetter
        });

        // Apply to job
        const applied = await applyToJob(page, job, {
          resumePath,
          coverLetter,
          config
        });

        if (applied) {
          await Application.updateStatus(applicationId, 'submitted');
          results.applicationsSubmitted++;

          // Send success email
          await sendEmail(userData.email, 'applicationSubmitted', {
            firstName: userData.first_name,
            jobTitle: job.title,
            employer: job.employer,
            portal: 'Scotland',
            jobReference: job.reference,
            submissionDate: new Date().toLocaleString()
          });
        } else {
          await Application.updateStatus(applicationId, 'failed', 'Application submission failed');
          results.applicationsFailed++;
        }

        // Wait between applications
        await page.waitForTimeout(3000);
      } catch (error) {
        console.error(`Error applying to ${job.title}:`, error);
        results.applicationsFailed++;
        results.errors.push(`${job.title}: ${error.message}`);
      }
    }

    results.success = results.applicationsSubmitted > 0;
  } catch (error) {
    console.error('Automation error:', error);
    results.errors.push(error.message);
  } finally {
    // Close browser
    if (browser) {
      await closeBrowser(browser);
    }
  }

  return results;
}

module.exports = {
  automateApplication,
  login,
  searchJobs,
  applyToJob
};
