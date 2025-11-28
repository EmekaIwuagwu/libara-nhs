// src/services/automation/applicationSteps/cvInput.js

const { CV, TIMEOUTS } = require('../constants');
const { clickIfExists, fillIfExists, delay } = require('../helpers');

/**
 * Complete the CV input step of the application
 * @param {Page} page - Puppeteer page object
 * @param {string} cvText - The CV text to fill in
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeCVInput(page, cvText) {
    console.log('\n[STEP] ========== CV INPUT ==========');

    try {
        // Click on the CV task link
        const clicked = await clickIfExists(page, CV.TASK_LINK, {
            description: 'CV input task link'
        });

        if (!clicked) {
            console.log('[STEP] CV link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Fill in the CV textarea with the user's CV text
        const filled = await fillIfExists(page, CV.CV_TEXTAREA, cvText, {
            description: 'CV textarea'
        });

        if (!filled) {
            console.log('[STEP] CV textarea not found');
            return false;
        }

        await delay(1000);

        // Click save/continue
        await clickIfExists(page, CV.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Click continue to go to next page
        await clickIfExists(page, CV.CONTINUE, {
            description: 'Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] CV Input completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] CV Input error: ${error.message}`);
        return false;
    }
}

module.exports = { completeCVInput };
