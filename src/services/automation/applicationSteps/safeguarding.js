// src/services/automation/applicationSteps/safeguarding.js

const { SAFEGUARDING, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay } = require('../helpers');

/**
 * Complete the Safeguarding step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeSafeguarding(page) {
    console.log('\n[STEP] ========== SAFEGUARDING ==========');

    try {
        // Click on the safeguarding task link
        const clicked = await clickIfExists(page, SAFEGUARDING.TASK_LINK, {
            description: 'Safeguarding task link'
        });

        if (!clicked) {
            console.log('[STEP] Safeguarding link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Click continue first (some pages have an intro)
        await clickIfExists(page, SAFEGUARDING.CONTINUE, {
            description: 'Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        // Select NO for convictions
        await selectRadioIfExists(page, SAFEGUARDING.NO_CONVICTIONS, {
            description: 'No convictions option'
        });

        await delay(1000);

        // Click save/continue
        await clickIfExists(page, SAFEGUARDING.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Click final continue to save and move to next screen
        await clickIfExists(page, SAFEGUARDING.CONTINUE, {
            description: 'Final Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Safeguarding completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Safeguarding error: ${error.message}`);
        return false;
    }
}

module.exports = { completeSafeguarding };
