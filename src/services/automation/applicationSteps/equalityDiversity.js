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

        // Answer all questions
        // Gender
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.GENDER, {
            description: 'Gender option'
        });
        await delay(500);

        // Birth sex match
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.BIRTH_SEX_MATCH, {
            description: 'Birth sex match option'
        });
        await delay(500);

        // Marital status
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.MARITAL_STATUS, {
            description: 'Marital status option'
        });
        await delay(500);

        // Pregnancy
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.PREGNANCY, {
            description: 'Pregnancy option'
        });
        await delay(500);

        // Sexuality
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.SEXUALITY, {
            description: 'Sexuality option'
        });
        await delay(500);

        // Age range
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.AGE_RANGE, {
            description: 'Age range option'
        });
        await delay(500);

        // Ethnicity
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.ETHNICITY, {
            description: 'Ethnicity option'
        });
        await delay(500);

        // Religion
        await selectRadioIfExists(page, EQUALITY_DIVERSITY.RELIGION, {
            description: 'Religion option'
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
