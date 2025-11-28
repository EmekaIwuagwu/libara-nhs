// src/services/automation/applicationSteps/guaranteedInterview.js

const { GUARANTEED_INTERVIEW, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay } = require('../helpers');

/**
 * Complete the Guaranteed Interview Scheme step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeGuaranteedInterview(page) {
    console.log('\n[STEP] ========== GUARANTEED INTERVIEW SCHEME ==========');

    try {
        // Click on the GIS task link
        const clicked = await clickIfExists(page, GUARANTEED_INTERVIEW.TASK_LINK, {
            description: 'Guaranteed Interview Scheme task link'
        });

        if (!clicked) {
            console.log('[STEP] GIS link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Select NO for physical limitation
        await selectRadioIfExists(page, GUARANTEED_INTERVIEW.NO_PHYSICAL_LIMITATION, {
            description: 'No physical limitation option'
        });

        await delay(1000);

        // Select NO for armed forces veteran
        await selectRadioIfExists(page, GUARANTEED_INTERVIEW.NO_ARMED_FORCES, {
            description: 'No armed forces veteran option'
        });

        await delay(1000);

        // Click save/continue
        await clickIfExists(page, GUARANTEED_INTERVIEW.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Guaranteed Interview Scheme completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Guaranteed Interview Scheme error: ${error.message}`);
        return false;
    }
}

module.exports = { completeGuaranteedInterview };
