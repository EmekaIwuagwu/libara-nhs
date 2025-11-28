// src/services/automation/helpers.js

const { TIMEOUTS } = require('./constants');
const fs = require('fs');
const path = require('path');

/**
 * Helper function to click an element if it exists
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {object} options - Additional options
 * @returns {boolean} - Whether the click was successful
 */
async function clickIfExists(page, selector, options = {}) {
    const { timeout = TIMEOUTS.MEDIUM, description = selector } = options;

    try {
        console.log(`[CLICK] Attempting to click: ${description}`);

        // Wait for the element to be visible
        await page.waitForSelector(selector, {
            timeout,
            visible: true
        });

        await page.click(selector);
        console.log(`[CLICK] Successfully clicked: ${description}`);
        return true;

    } catch (error) {
        console.log(`[CLICK] Failed to click ${description}: ${error.message}`);
        return false;
    }
}

/**
 * Helper function to fill an input field if it exists
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {string} value - Value to fill
 * @param {object} options - Additional options
 * @returns {boolean} - Whether the fill was successful
 */
async function fillIfExists(page, selector, value, options = {}) {
    const { timeout = TIMEOUTS.MEDIUM, description = selector, clearFirst = true } = options;

    try {
        console.log(`[FILL] Attempting to fill: ${description}`);

        // Wait for the element to be visible
        await page.waitForSelector(selector, {
            timeout,
            visible: true
        });

        if (clearFirst) {
            // Clear existing value
            await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) element.value = '';
            }, selector);
        }

        await page.type(selector, value, { delay: 50 });
        console.log(`[FILL] Successfully filled: ${description}`);
        return true;

    } catch (error) {
        console.log(`[FILL] Failed to fill ${description}: ${error.message}`);
        return false;
    }
}

/**
 * Helper function to select a radio button if it exists
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {object} options - Additional options
 * @returns {boolean} - Whether the selection was successful
 */
async function selectRadioIfExists(page, selector, options = {}) {
    const { timeout = TIMEOUTS.MEDIUM, description = selector } = options;

    try {
        console.log(`[RADIO] Attempting to select: ${description}`);

        await page.waitForSelector(selector, {
            timeout
        });

        // Check if already selected
        const isChecked = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element ? element.checked : false;
        }, selector);

        if (!isChecked) {
            await page.click(selector);
        }

        console.log(`[RADIO] Successfully selected: ${description}`);
        return true;

    } catch (error) {
        console.log(`[RADIO] Failed to select ${description}: ${error.message}`);
        return false;
    }
}

/**
 * Helper function to check a checkbox if it exists
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {object} options - Additional options
 * @returns {boolean} - Whether the check was successful
 */
async function checkIfExists(page, selector, options = {}) {
    const { timeout = TIMEOUTS.MEDIUM, description = selector } = options;

    try {
        console.log(`[CHECK] Attempting to check: ${description}`);

        await page.waitForSelector(selector, {
            timeout
        });

        const isChecked = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element ? element.checked : false;
        }, selector);

        if (!isChecked) {
            await page.click(selector);
        }

        console.log(`[CHECK] Successfully checked: ${description}`);
        return true;

    } catch (error) {
        console.log(`[CHECK] Failed to check ${description}: ${error.message}`);
        return false;
    }
}

/**
 * Helper function to safely wait for navigation
 * @param {Page} page - Puppeteer page object
 * @param {Function} action - Action that triggers navigation
 * @param {object} options - Additional options
 * @returns {boolean} - Whether navigation was successful
 */
async function waitForNavigationSafe(page, action, options = {}) {
    const { timeout = TIMEOUTS.NAVIGATION, description = 'navigation' } = options;

    try {
        console.log(`[NAV] Waiting for ${description}...`);

        await Promise.all([
            page.waitForNavigation({ timeout, waitUntil: 'domcontentloaded' }),
            action()
        ]);

        console.log(`[NAV] ${description} completed successfully`);
        return true;
    } catch (error) {
        // Navigation might not always trigger, so we just log and continue
        console.log(`[NAV] ${description} note: ${error.message}`);
        return false;
    }
}

/**
 * Helper function to wait for a short delay
 * @param {number} ms - Milliseconds to wait
 */
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper function to take a screenshot for debugging
 * @param {Page} page - Puppeteer page object
 * @param {string} name - Screenshot name
 * @param {string} outputDir - Output directory
 */
async function takeScreenshot(page, name, outputDir = './screenshots') {
    try {
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = path.join(outputDir, `${timestamp}-${name}.png`);
        await page.screenshot({ path: filename, fullPage: true });
        console.log(`[SCREENSHOT] Saved: ${filename}`);
        return filename;
    } catch (error) {
        console.log(`[SCREENSHOT] Failed to save screenshot: ${error.message}`);
        return null;
    }
}

/**
 * Helper function to check if element exists without waiting
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @returns {boolean} - Whether element exists
 */
async function elementExists(page, selector) {
    try {
        const element = await page.$(selector);
        return element !== null;
    } catch {
        return false;
    }
}

/**
 * Helper function to get text content of an element
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @returns {string|null} - Text content or null
 */
async function getTextContent(page, selector) {
    try {
        const element = await page.$(selector);
        if (element) {
            return await page.evaluate(el => el.textContent, element);
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Helper function to select an option from a dropdown
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {string} value - Value to select
 * @param {object} options - Additional options
 * @returns {boolean} - Whether selection was successful
 */
async function selectOptionIfExists(page, selector, value, options = {}) {
    const { timeout = TIMEOUTS.MEDIUM, description = selector } = options;

    try {
        console.log(`[SELECT] Attempting to select ${value} from: ${description}`);

        await page.waitForSelector(selector, { timeout, visible: true });
        await page.select(selector, value);

        console.log(`[SELECT] Successfully selected: ${description}`);
        return true;
    } catch (error) {
        console.log(`[SELECT] Failed to select ${description}: ${error.message}`);
        return false;
    }
}

module.exports = {
    clickIfExists,
    fillIfExists,
    selectRadioIfExists,
    checkIfExists,
    waitForNavigationSafe,
    delay,
    takeScreenshot,
    elementExists,
    getTextContent,
    selectOptionIfExists
};
