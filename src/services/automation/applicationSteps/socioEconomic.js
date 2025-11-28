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

        // Main household occupation
        await selectRadioIfExists(page, SOCIO_ECONOMIC.OCCUPATION, {
            description: 'Main household occupation option'
        });
        await delay(500);

        // School type
        await selectRadioIfExists(page, SOCIO_ECONOMIC.SCHOOL_TYPE, {
            description: 'School type option'
        });
        await delay(500);

        // Free school meals
        await selectRadioIfExists(page, SOCIO_ECONOMIC.FREE_SCHOOL_MEALS, {
            description: 'Free school meals option'
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
