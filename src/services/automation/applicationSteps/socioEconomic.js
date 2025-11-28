// src/services/automation/applicationSteps/socioEconomic.js

const { SOCIO_ECONOMIC, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay } = require('../helpers');

/**
 * Complete the Socio-Economic Background step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeSocioEconomic(page) {
    console.log('\n[STEP] ========== SOCIO-ECONOMIC BACKGROUND ==========');

    try {
        // Click on the socio-economic task link
        const clicked = await clickIfExists(page, SOCIO_ECONOMIC.TASK_LINK, {
            description: 'Socio-Economic Background task link'
        });

        if (!clicked) {
            console.log('[STEP] Socio-Economic link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Click the continue LINK to start the section
        const continueClicked = await clickIfExists(page, SOCIO_ECONOMIC.CONTINUE_LINK, {
            description: 'Continue link to start section',
            timeout: TIMEOUTS.SHORT
        });

        if (continueClicked) {
            await delay(TIMEOUTS.SHORT);
        }

        // Main household occupation (Prefer not to say)
        await selectRadioIfExists(page, SOCIO_ECONOMIC.OCCUPATION_PREFER_NOT, {
            description: 'Main household occupation: Prefer not to say'
        });
        await delay(500);

        // School type (Prefer not to say)
        await selectRadioIfExists(page, SOCIO_ECONOMIC.SCHOOL_TYPE_PREFER_NOT, {
            description: 'School type: Prefer not to say'
        });
        await delay(500);

        // Free school meals (Prefer not to say)
        await selectRadioIfExists(page, SOCIO_ECONOMIC.FREE_MEALS_PREFER_NOT, {
            description: 'Free school meals: Prefer not to say'
        });
        await delay(1000);

        // Click save/continue
        await clickIfExists(page, SOCIO_ECONOMIC.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Socio-Economic Background completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Socio-Economic Background error: ${error.message}`);
        return false;
    }
}

module.exports = { completeSocioEconomic };
