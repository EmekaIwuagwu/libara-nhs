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

        // Click the continue LINK to start the section
        const continueClicked = await clickIfExists(page, EQUALITY_DIVERSITY.CONTINUE_LINK, {
            description: 'Continue link to start section',
            timeout: TIMEOUTS.SHORT
        });

        if (continueClicked) {
            await delay(TIMEOUTS.SHORT);
        }

        // Answer all questions with "Prefer not to say" options
        // Gender (Male option as default)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.GENDER_MALE, {
            description: 'Gender: Male'
        });
        await delay(500);

        // Birth sex match (Yes option)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.BIRTH_SEX_MATCH_YES, {
            description: 'Birth sex same as gender: Yes'
        });
        await delay(500);

        // Marital status (Single)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.MARITAL_STATUS_SINGLE, {
            description: 'Marital status: Single'
        });
        await delay(500);

        // Pregnancy (No)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.PREGNANCY_NO, {
            description: 'Pregnancy/Maternity: No'
        });
        await delay(500);

        // Sexuality (Prefer not to say)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.SEXUALITY_PREFER_NOT, {
            description: 'Sexuality: Prefer not to say'
        });
        await delay(500);

        // Age range (Prefer not to say)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.AGE_RANGE_PREFER_NOT, {
            description: 'Age range: Prefer not to say'
        });
        await delay(500);

        // Ethnicity (Prefer not to say)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.ETHNICITY_PREFER_NOT, {
            description: 'Ethnicity: Prefer not to say'
        });
        await delay(500);

        // Religion (Prefer not to say)
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.RELIGION_PREFER_NOT, {
            description: 'Religion: Prefer not to say'
        });
        await delay(1000);

        // Click save/continue
        await clickIfExists(page, EQUALITY_DIVERSITY.SAVE_CONTINUE, {
            description: 'Save and Continue button'
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
