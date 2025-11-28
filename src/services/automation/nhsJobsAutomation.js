// src/services/automation/nhsJobsAutomation.js

const { createBrowser, closeBrowser } = require('./browser');
const { URLS, LOGIN, SEARCH, APPLICATION, TIMEOUTS } = require('./constants');
const {
    clickIfExists,
    fillIfExists,
    delay,
    takeScreenshot,
    elementExists
} = require('./helpers');

// Import application step modules
const { completeContactDetails } = require('./applicationSteps/contactDetails');
const { completeRightToWork } = require('./applicationSteps/rightToWork');
const { completeCVInput } = require('./applicationSteps/cvInput');
const { completeSafeguarding } = require('./applicationSteps/safeguarding');
const { completeFitnessToPractice } = require('./applicationSteps/fitnessToPractice');
const { completeGuaranteedInterview } = require('./applicationSteps/guaranteedInterview');
const { completeEqualityDiversity } = require('./applicationSteps/equalityDiversity');
const { completeSocioEconomic } = require('./applicationSteps/socioEconomic');
const { completeDeclaration } = require('./applicationSteps/declaration');

class NHSJobsAutomation {
    constructor(config) {
        this.config = config;
        this.browser = null;
        this.page = null;
        this.results = [];
    }

    /**
     * Initialize the browser
     */
    async init() {
        console.log('\n========================================');
        console.log('NHS JOBS AUTOMATION - STARTING');
        console.log('========================================\n');

        const { browser, page } = await createBrowser({
            headless: this.config.headless !== false,
            slowMo: this.config.slowMo || 50
        });

        this.browser = browser;
        this.page = page;
    }

    /**
     * Login to NHS Jobs portal
     */
    async login() {
        console.log('\n[LOGIN] ========== LOGGING IN ==========');

        try {
            // Navigate to candidate home
            console.log(`[LOGIN] Navigating to ${URLS.NHS_CANDIDATE_HOME}`);
            await this.page.goto(URLS.NHS_CANDIDATE_HOME, {
                waitUntil: 'domcontentloaded',
                timeout: TIMEOUTS.NAVIGATION
            });

            await delay(TIMEOUTS.SHORT);

            // Click sign in link
            await clickIfExists(this.page, LOGIN.SIGN_IN_LINK, {
                description: 'Sign In link'
            });

            await delay(TIMEOUTS.SHORT);

            // Fill username
            await fillIfExists(this.page, LOGIN.USERNAME_INPUT, this.config.username, {
                description: 'Username field'
            });

            // Fill password
            await fillIfExists(this.page, LOGIN.PASSWORD_INPUT, this.config.password, {
                description: 'Password field'
            });

            await delay(1000);

            // Click submit
            await clickIfExists(this.page, LOGIN.SUBMIT_BUTTON, {
                description: 'Submit button'
            });

            await delay(TIMEOUTS.MEDIUM);

            // Click "Go to search"
            await clickIfExists(this.page, LOGIN.GO_TO_SEARCH, {
                description: 'Go to search link'
            });

            await delay(TIMEOUTS.SHORT);

            console.log('[LOGIN] Login completed successfully');
            return true;

        } catch (error) {
            console.log(`[LOGIN] Login failed: ${error.message}`);
            await takeScreenshot(this.page, 'login-error');
            return false;
        }
    }

    /**
     * Search for jobs
     */
    async searchJobs() {
        console.log('\n[SEARCH] ========== SEARCHING FOR JOBS ==========');

        try {
            // Navigate to search page if not already there
            const currentUrl = this.page.url();
            if (!currentUrl.includes('/candidate/search')) {
                await this.page.goto(URLS.NHS_SEARCH, {
                    waitUntil: 'domcontentloaded',
                    timeout: TIMEOUTS.NAVIGATION
                });
            }

            await delay(TIMEOUTS.SHORT);

            // Fill keyword
            if (this.config.jobTitle) {
                await fillIfExists(this.page, SEARCH.KEYWORD_INPUT, this.config.jobTitle, {
                    description: 'Keyword field'
                });
            }

            // Fill location
            if (this.config.location) {
                await fillIfExists(this.page, SEARCH.LOCATION_INPUT, this.config.location, {
                    description: 'Location field'
                });
            }

            await delay(1000);

            // Click search
            await clickIfExists(this.page, SEARCH.SEARCH_BUTTON, {
                description: 'Search button'
            });

            await delay(TIMEOUTS.MEDIUM);

            // Extract job links
            const jobLinks = await this.page.$$eval(SEARCH.JOB_LINK_PATTERN, links =>
                links.map(link => ({
                    href: link.href,
                    title: link.textContent.trim()
                }))
            );

            console.log(`[SEARCH] Found ${jobLinks.length} job listings`);
            return jobLinks;

        } catch (error) {
            console.log(`[SEARCH] Search failed: ${error.message}`);
            await takeScreenshot(this.page, 'search-error');
            return [];
        }
    }

    /**
     * Check if job is an internal application (not trac.jobs)
     */
    async isInternalApplication(jobUrl) {
        try {
            await this.page.goto(jobUrl, {
                waitUntil: 'domcontentloaded',
                timeout: TIMEOUTS.NAVIGATION
            });

            await delay(TIMEOUTS.SHORT);

            const currentUrl = this.page.url();

            // Check if redirected to trac.jobs (external)
            if (currentUrl.includes(URLS.TRAC_JOBS)) {
                console.log('[CHECK] External application (trac.jobs) - SKIPPING');
                return false;
            }

            // Check if it's an internal NHS application
            if (currentUrl.includes(URLS.NHS_APPLICATION_BASE)) {
                // Look for the "Start Application" button
                const hasStartButton = await elementExists(this.page, APPLICATION.START_APPLICATION_BUTTON);
                if (hasStartButton) {
                    console.log('[CHECK] Internal application detected - PROCEEDING');
                    return true;
                }
            }

            // Check for Apply button on job advert page
            // First try link with "application" in href
            let applyButton = await this.page.$('a[href*="application"]');

            // If not found, look for button with "Apply" text using XPath
            if (!applyButton) {
                const buttons = await this.page.$x("//button[contains(translate(text(), 'APPLY', 'apply'), 'apply')]");
                if (buttons.length > 0) {
                    applyButton = buttons[0];
                }
            }

            // Also check for links with "Apply" text
            if (!applyButton) {
                const links = await this.page.$x("//a[contains(translate(text(), 'APPLY', 'apply'), 'apply')]");
                if (links.length > 0) {
                    applyButton = links[0];
                }
            }

            if (applyButton) {
                await applyButton.click();
                await delay(TIMEOUTS.MEDIUM);

                const newUrl = this.page.url();
                if (newUrl.includes(URLS.TRAC_JOBS)) {
                    console.log('[CHECK] External application (trac.jobs) - SKIPPING');
                    return false;
                }

                console.log('[CHECK] Internal application detected - PROCEEDING');
                return true;
            }

            console.log('[CHECK] Could not determine application type - SKIPPING');
            return false;

        } catch (error) {
            console.log(`[CHECK] Error checking application type: ${error.message}`);
            return false;
        }
    }

    /**
     * Complete the full application process
     */
    async completeApplication(jobInfo) {
        console.log('\n========================================');
        console.log(`[APPLICATION] Starting application for: ${jobInfo.title}`);
        console.log('========================================\n');

        const result = {
            jobTitle: jobInfo.title,
            jobUrl: jobInfo.href,
            success: false,
            referenceNumber: null,
            error: null,
            stepsCompleted: []
        };

        try {
            // Take screenshot of current page to debug
            await takeScreenshot(this.page, `before-start-application-${Date.now()}`);
            console.log(`[APPLICATION] Current URL: ${this.page.url()}`);

            // Try to find and click "Start Application" button
            // The button might be a regular button, not an input
            let started = false;

            // Try Method 1: Input button with value
            started = await clickIfExists(this.page, APPLICATION.START_APPLICATION_BUTTON, {
                description: 'Start Application button (input)',
                timeout: TIMEOUTS.SHORT
            });

            // Try Method 2: Regular button with text
            if (!started) {
                console.log('[APPLICATION] Trying button element with "Start Application" text...');
                const buttons = await this.page.$x("//button[contains(text(), 'Start Application') or contains(text(), 'Start application')]");
                if (buttons.length > 0) {
                    await buttons[0].click();
                    started = true;
                    console.log('[APPLICATION] Clicked Start Application button (xpath)');
                    await delay(TIMEOUTS.MEDIUM);
                }
            }

            // Try Method 3: Link with "Apply" text
            if (!started) {
                console.log('[APPLICATION] Trying link with "Apply" text...');
                const applyLinks = await this.page.$x("//a[contains(text(), 'Apply') or contains(text(), 'apply')]");
                if (applyLinks.length > 0) {
                    await applyLinks[0].click();
                    started = true;
                    console.log('[APPLICATION] Clicked Apply link (xpath)');
                    await delay(TIMEOUTS.MEDIUM);
                }
            }

            if (started) {
                await delay(TIMEOUTS.MEDIUM);
                await takeScreenshot(this.page, `after-start-application-${Date.now()}`);
                console.log(`[APPLICATION] After start, URL: ${this.page.url()}`);
            } else {
                console.log('[APPLICATION] WARNING: Could not find Start Application button');
                await takeScreenshot(this.page, `no-start-button-${Date.now()}`);
            }

            // Step 1: Contact Details
            const contactResult = await completeContactDetails(this.page);
            result.stepsCompleted.push({ step: 'Contact Details', success: contactResult });

            // Step 2: Right to Work
            const rtwResult = await completeRightToWork(this.page);
            result.stepsCompleted.push({ step: 'Right to Work', success: rtwResult });

            // Step 3: CV Input
            const cvResult = await completeCVInput(this.page, this.config.cvText);
            result.stepsCompleted.push({ step: 'CV Input', success: cvResult });

            // Step 4: Safeguarding
            const safeguardingResult = await completeSafeguarding(this.page);
            result.stepsCompleted.push({ step: 'Safeguarding', success: safeguardingResult });

            // Step 5: Fitness to Practice
            const fitnessResult = await completeFitnessToPractice(this.page);
            result.stepsCompleted.push({ step: 'Fitness to Practice', success: fitnessResult });

            // Step 6: Guaranteed Interview Scheme
            const gisResult = await completeGuaranteedInterview(this.page);
            result.stepsCompleted.push({ step: 'Guaranteed Interview Scheme', success: gisResult });

            // Step 7: Equality & Diversity
            const equalityResult = await completeEqualityDiversity(this.page);
            result.stepsCompleted.push({ step: 'Equality & Diversity', success: equalityResult });

            // Step 8: Socio-Economic Background
            const socioResult = await completeSocioEconomic(this.page);
            result.stepsCompleted.push({ step: 'Socio-Economic Background', success: socioResult });

            // Step 9: Declaration & Submit
            const declarationResult = await completeDeclaration(this.page);
            result.stepsCompleted.push({ step: 'Declaration', success: declarationResult.success });

            result.success = declarationResult.success;
            result.referenceNumber = declarationResult.referenceNumber;

            // Take screenshot of confirmation
            if (result.success) {
                await takeScreenshot(this.page, `success-${Date.now()}`);
            }

        } catch (error) {
            console.log(`[APPLICATION] Application error: ${error.message}`);
            result.error = error.message;
            await takeScreenshot(this.page, `error-${Date.now()}`);
        }

        this.results.push(result);
        return result;
    }

    /**
     * Run the complete automation process
     */
    async run() {
        try {
            // Initialize browser
            await this.init();

            // Login
            const loggedIn = await this.login();
            if (!loggedIn) {
                throw new Error('Failed to login to NHS Jobs');
            }

            // Search for jobs
            const jobs = await this.searchJobs();
            if (jobs.length === 0) {
                console.log('[RUN] No jobs found matching criteria');
                return this.results;
            }

            // Limit the number of applications based on config
            const maxApplications = this.config.maxApplications || 5;
            let applicationCount = 0;

            // Process each job
            for (const job of jobs) {
                if (applicationCount >= maxApplications) {
                    console.log(`[RUN] Reached maximum applications limit (${maxApplications})`);
                    break;
                }

                console.log(`\n[RUN] Processing job ${applicationCount + 1}/${Math.min(jobs.length, maxApplications)}: ${job.title}`);

                // Check if internal application
                const isInternal = await this.isInternalApplication(job.href);

                if (isInternal) {
                    // Complete the application
                    const result = await this.completeApplication(job);

                    if (result.success) {
                        applicationCount++;
                        console.log(`[RUN] Application ${applicationCount} submitted successfully`);
                    } else {
                        console.log(`[RUN] Application failed: ${result.error || 'Unknown error'}`);
                    }

                    // Small delay between applications
                    await delay(TIMEOUTS.MEDIUM);
                }
            }

            console.log('\n========================================');
            console.log('NHS JOBS AUTOMATION - COMPLETED');
            console.log(`Total applications submitted: ${applicationCount}`);
            console.log('========================================\n');

            return this.results;

        } catch (error) {
            console.log(`[RUN] Automation error: ${error.message}`);
            throw error;

        } finally {
            // Always close browser
            await closeBrowser(this.browser);
        }
    }

    /**
     * Get results summary
     */
    getResultsSummary() {
        const successful = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;

        return {
            total: this.results.length,
            successful,
            failed,
            results: this.results
        };
    }
}

module.exports = NHSJobsAutomation;
