// src/services/automation/applicationSteps/declaration.js

const { DECLARATION, TIMEOUTS } = require('../constants');
const { clickIfExists, checkIfExists, delay } = require('../helpers');

/**
 * Complete the Declaration step and submit the application
 * @param {Page} page - Puppeteer page object
 * @returns {object} - Result containing success status and reference number if available
 */
async function completeDeclaration(page) {
    console.log('\n[STEP] ========== DECLARATION & SUBMISSION ==========');

    try {
        // Click on the declaration task link
        const clicked = await clickIfExists(page, DECLARATION.TASK_LINK, {
            description: 'Declaration task link'
        });

        if (!clicked) {
            console.log('[STEP] Declaration link not found, checking if already on declaration page');
        }

        await delay(TIMEOUTS.SHORT);

        // Check the declaration checkbox
        const checked = await checkIfExists(page, DECLARATION.AGREE_CHECKBOX, {
            description: 'Declaration agreement checkbox'
        });

        if (!checked) {
            console.log('[STEP] Declaration checkbox not found');
            return { success: false, referenceNumber: null };
        }

        await delay(1000);

        // Click send application
        const submitted = await clickIfExists(page, DECLARATION.SEND_APPLICATION, {
            description: 'Send Application button'
        });

        if (!submitted) {
            console.log('[STEP] Send Application button not found');
            return { success: false, referenceNumber: null };
        }

        await delay(TIMEOUTS.MEDIUM);

        // Try to extract reference number from confirmation page
        let referenceNumber = null;
        try {
            // Common patterns for reference numbers on confirmation pages
            const confirmationText = await page.evaluate(() => document.body.textContent);
            const refMatch = confirmationText.match(/reference[:\s]*([A-Z0-9-]+)/i);
            if (refMatch) {
                referenceNumber = refMatch[1];
            }
        } catch {
            console.log('[STEP] Could not extract reference number');
        }

        console.log('[STEP] Declaration completed and application submitted successfully');
        return { success: true, referenceNumber };

    } catch (error) {
        console.log(`[STEP] Declaration error: ${error.message}`);
        return { success: false, referenceNumber: null };
    }
}

module.exports = { completeDeclaration };
