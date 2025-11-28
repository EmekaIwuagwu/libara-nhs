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

        // Click the continue LINK to start the section
        const continueClicked = await clickIfExists(page, FITNESS_TO_PRACTICE.CONTINUE_LINK, {
            description: 'Continue link to start section',
            timeout: TIMEOUTS.SHORT
        });

        if (continueClicked) {
            await delay(TIMEOUTS.SHORT);
        }

        // There might be multiple questions, answer NO to all
        let questionCount = 0;
        const maxQuestions = 5;

        while (questionCount < maxQuestions) {
            const hasNoOption = await elementExists(page, FITNESS_TO_PRACTICE.NO_OPTION);

            if (hasNoOption) {
                await selectRadioIfExists(page, FITNESS_TO_PRACTICE.NO_OPTION, {
                    description: `Fitness question ${questionCount + 1} - NO option`
                });

                await delay(1000);

                // Click continue for next question
                const continued = await clickIfExists(page, FITNESS_TO_PRACTICE.SAVE_CONTINUE, {
                    description: 'Save and Continue button'
                });

                if (!continued) {
                    break;
                }

                await delay(TIMEOUTS.SHORT);
                questionCount++;
            } else {
                break;
            }
        }

        console.log(`[STEP] Fitness to Practice completed successfully (${questionCount} questions answered)`);
        return true;

    } catch (error) {
        console.log(`[STEP] Fitness to Practice error: ${error.message}`);
        return false;
    }
}

module.exports = { completeFitnessToPractice };
