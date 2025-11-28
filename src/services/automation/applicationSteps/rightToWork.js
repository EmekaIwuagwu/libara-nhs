// src/services/automation/applicationSteps/rightToWork.js

const { RIGHT_TO_WORK, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay } = require('../helpers');

/**
 * Complete the Right to Work step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeRightToWork(page) {
    console.log('\n[STEP] ========== RIGHT TO WORK ==========');

    try {
        // Click on the right to work task link
        const clicked = await clickIfExists(page, RIGHT_TO_WORK.TASK_LINK, {
            description: 'Right to Work task link'
        });

        if (!clicked) {
            console.log('[STEP] Right to Work link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Select YES for right to work
        await selectRadioIfExists(page, RIGHT_TO_WORK.YES_OPTION, {
            description: 'Right to Work - YES option'
        });

        await delay(1000);

        // Click save/continue
        await clickIfExists(page, RIGHT_TO_WORK.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Sometimes there's an additional continue button
        await clickIfExists(page, RIGHT_TO_WORK.CONTINUE, {
            description: 'Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Right to Work completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Right to Work error: ${error.message}`);
        return false;
    }
}

module.exports = { completeRightToWork };
