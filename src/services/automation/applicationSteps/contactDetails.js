// src/services/automation/applicationSteps/contactDetails.js

const { CONTACT_DETAILS, TIMEOUTS } = require('../constants');
const { clickIfExists, selectRadioIfExists, delay } = require('../helpers');

/**
 * Complete the Contact Details step of the application
 * @param {Page} page - Puppeteer page object
 * @returns {boolean} - Whether step was completed successfully
 */
async function completeContactDetails(page) {
    console.log('\n[STEP] ========== CONTACT DETAILS ==========');

    try {
        // Click on the contact details task link
        const clicked = await clickIfExists(page, CONTACT_DETAILS.TASK_LINK, {
            description: 'Contact Details task link'
        });

        if (!clicked) {
            console.log('[STEP] Contact details link not found, may already be completed');
            return true;
        }

        await delay(TIMEOUTS.SHORT);

        // Select email as communication preference
        await selectRadioIfExists(page, CONTACT_DETAILS.EMAIL_PREFERENCE, {
            description: 'Email communication preference'
        });

        await delay(1000);

        // Click continue/save
        await clickIfExists(page, CONTACT_DETAILS.SAVE_CONTINUE, {
            description: 'Save and Continue button'
        });

        await delay(TIMEOUTS.SHORT);

        console.log('[STEP] Contact Details completed successfully');
        return true;

    } catch (error) {
        console.log(`[STEP] Contact Details error: ${error.message}`);
        return false;
    }
}

module.exports = { completeContactDetails };
