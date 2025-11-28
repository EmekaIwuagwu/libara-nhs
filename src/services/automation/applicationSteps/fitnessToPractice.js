// src/services/automation/applicationSteps/fitnessToPractice.js

const { FITNESS_TO_PRACTICE, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay, elementExists } = require('../helpers');

/**
 * Complete the Fitness to Practice step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeFitnessToPractice(page) {
    console.log('\n[STEP] ========== FITNESS TO PRACTICE ==========');

    try {
        // Click on the fitness to practice task link
        const clicked = await clickIfExists(page, FITNESS_TO_PRACTICE.TASK_LINK, {
            description: 'Fitness to Practice task link'
        });

        if (!clicked) {
            console.log('[STEP] Fitness to Practice link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Click continue first (intro page)
        await clickIfExists(page, FITNESS_TO_PRACTICE.CONTINUE, {
            description: 'Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        // There are 3 "No" questions to answer
        // Question 1
        await selectRadioIfExists(page, FITNESS_TO_PRACTICE.NO_OPTION, {
            description: 'Question 1 - NO option'
        });

        await delay(1000);

        await clickIfExists(page, FITNESS_TO_PRACTICE.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Question 2
        await selectRadioIfExists(page, FITNESS_TO_PRACTICE.NO_OPTION, {
            description: 'Question 2 - NO option'
        });

        await delay(1000);

        await clickIfExists(page, FITNESS_TO_PRACTICE.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Question 3
        await selectRadioIfExists(page, FITNESS_TO_PRACTICE.NO_OPTION, {
            description: 'Question 3 - NO option'
        });

        await delay(1000);

        await clickIfExists(page, FITNESS_TO_PRACTICE.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Final Continue button to proceed
        await clickIfExists(page, FITNESS_TO_PRACTICE.CONTINUE, {
            description: 'Final Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Fitness to Practice completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Fitness to Practice error: ${error.message}`);
        return false;
    }
}

module.exports = { completeFitnessToPractice };
