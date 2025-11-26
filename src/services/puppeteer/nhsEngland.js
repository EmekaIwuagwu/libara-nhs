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
 * NHS England Job Application Automation
 * This is a template - selectors need to be updated based on actual NHS England portal (NHS Jobs)
 */

const NHS_ENGLAND_URL = process.env.NHS_ENGLAND_URL || 'https://www.jobs.nhs.uk';

/**
 * Login to NHS England portal
 * @param {Page} page - Puppeteer page object
 * @param {Object} credentials - User credentials
 * @returns {Promise<boolean>} Login success status
 */
async function login(page, credentials) {
  try {
    console.log('Navigating to NHS England portal...');
    await page.goto(NHS_ENGLAND_URL, { waitUntil: 'networkidle2' });

    await takeScreenshot(page, `nhs-england-homepage-${Date.now()}.png`);

    // TODO: Update these selectors based on actual NHS Jobs portal
    await safeClick(page, 'a[href*="login"], button[class*="login"], .sign-in');

    await typeWithDelay(page, 'input[name="username"], input[type="email"], #username', credentials.username);
    await typeWithDelay(page, 'input[name="password"], input[type="password"], #password', credentials.password);

    await safeClick(page, 'button[type="submit"], input[type="submit"], .login-button');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-england-logged-in-${Date.now()}.png`);

    console.log('✓ Login successful');
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    await takeScreenshot(page, `nhs-england-login-error-${Date.now()}.png`);
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

    await page.goto(`${NHS_ENGLAND_URL}/search`, { waitUntil: 'networkidle2' });

    // TODO: Update selectors based on actual NHS Jobs portal
    await typeWithDelay(page, 'input[name="keyword"], input[id*="keywords"]', config.job_title);
    await typeWithDelay(page, 'input[name="location"], input[id*="location"]', config.job_location);

    await safeClick(page, 'button[type="submit"], .search-button, input[value*="Search"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-england-search-results-${Date.now()}.png`);

    // Parse job listings
    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.nhsuk-card, .job-result, .vacancy-item');
      return Array.from(jobElements).slice(0, 5).map(el => ({
        title: el.querySelector('.nhsuk-card__heading, .job-title, h2')?.textContent.trim() || '',
        employer: el.querySelector('.employer, .organization-name')?.textContent.trim() || '',
        reference: el.querySelector('.reference, .vacancy-id')?.textContent.trim() || '',
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
 * @param {Object} applicationData - Application data
 * @returns {Promise<boolean>} Application success status
 */
async function applyToJob(page, job, applicationData) {
  try {
    console.log(`Applying to: ${job.title}`);

    await page.goto(job.link, { waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-england-job-details-${Date.now()}.png`);

    // Click apply button
    await safeClick(page, 'button[class*="apply"], a[href*="apply"], .nhsuk-button');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Upload CV/Resume
    const cvInput = await page.$('input[type="file"][accept*="pdf"], input[name*="cv"], input[id*="cv"]');
    if (cvInput) {
      await cvInput.uploadFile(applicationData.resumePath);
      console.log('✓ CV uploaded');
    }

    // Fill supporting information / cover letter
    const supportingInfoField = await page.$('textarea[name*="supporting"], textarea[id*="statement"]');
    if (supportingInfoField) {
      await page.evaluate((el, text) => {
        el.value = text;
      }, supportingInfoField, applicationData.coverLetter);
      console.log('✓ Supporting information added');
    }

    await takeScreenshot(page, `nhs-england-application-form-${Date.now()}.png`);

    // Submit application
    await safeClick(page, 'button[type="submit"], input[value*="Submit"], .submit-button');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await takeScreenshot(page, `nhs-england-application-submitted-${Date.now()}.png`);

    console.log('✓ Application submitted');
    return true;
  } catch (error) {
    console.error('Application submission failed:', error);
    await takeScreenshot(page, `nhs-england-application-error-${Date.now()}.png`);
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
        const applicationId = await Application.create({
          user_id: userData.id,
          config_id: config.id,
          resume_id: resumePath,
          portal: 'england',
          job_reference: job.reference,
          job_title: job.title,
          employer: job.employer,
          cover_letter: coverLetter
        });

        const applied = await applyToJob(page, job, {
          resumePath,
          coverLetter,
          config
        });

        if (applied) {
          await Application.updateStatus(applicationId, 'submitted');
          results.applicationsSubmitted++;

          await sendEmail(userData.email, 'applicationSubmitted', {
            firstName: userData.first_name,
            jobTitle: job.title,
            employer: job.employer,
            portal: 'England',
            jobReference: job.reference,
            submissionDate: new Date().toLocaleString()
          });
        } else {
          await Application.updateStatus(applicationId, 'failed', 'Application submission failed');
          results.applicationsFailed++;
        }

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
