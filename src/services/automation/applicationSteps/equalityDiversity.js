// src/services/automation/applicationSteps/equalityDiversity.js

const { EQUALITY_DIVERSITY, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay } = require('../helpers');

/**
 * Complete the Equality & Diversity step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeEqualityDiversity(page) {
    console.log('\n[STEP] ========== EQUALITY & DIVERSITY ==========');

    try {
        // Click on the equality & diversity task link
        const clicked = await clickIfExists(page, EQUALITY_DIVERSITY.TASK_LINK, {
            description: 'Equality & Diversity task link'
        });

        if (!clicked) {
            console.log('[STEP] Equality & Diversity link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Click Continue link at the start
        await clickIfExists(page, EQUALITY_DIVERSITY.CONTINUE_LINK, {
            description: 'Continue link',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        // Gender
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.GENDER, {
            description: 'Gender - Male'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Gender same as birth
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.BIRTH_SEX_MATCH, {
            description: 'Gender same as birth - Yes'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Marital status
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.MARITAL_STATUS, {
            description: 'Marital status - Single'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Pregnancy
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.PREGNANCY, {
            description: 'Pregnancy - No'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Sexuality
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.SEXUALITY, {
            description: 'Sexuality - Prefer not to say'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Age range
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.AGE_RANGE, {
            description: 'Age range - Prefer not to say'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Ethnicity
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.ETHNICITY, {
            description: 'Ethnicity - Prefer not to say'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Religion
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.RELIGION, {
            description: 'Religion - Prefer not to say'
        });

        await delay(1000);

        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        // Final Continue button
        await clickIfExists(page, EQUALITY_DIVERSITY.CONTINUE, {
            description: 'Final Continue button',
            timeout: TIMEOUTS.SHORT
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Equality & Diversity completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Equality & Diversity error: ${error.message}`);
        return false;
    }
}

module.exports = { completeEqualityDiversity };
