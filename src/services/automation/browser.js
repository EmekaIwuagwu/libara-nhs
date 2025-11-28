// src/services/automation/browser.js

const puppeteer = require('puppeteer');

/**
 * Create and configure a browser instance for automation
 * @param {object} options - Browser configuration options
 * @returns {object} - Browser and page objects
 */
async function createBrowser(options = {}) {
    const {
        headless = true,
        slowMo = 50,
        screenshotsDir = './screenshots'
    } = options;

    console.log('[BROWSER] Launching browser...');

    const browser = await puppeteer.launch({
        headless: headless ? 'new' : false,
        slowMo,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Enable console logging from the page
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[PAGE ERROR] ${msg.text()}`);
        }
    });

    console.log('[BROWSER] Browser launched successfully');

    return { browser, page };
}

/**
 * Safely close browser and cleanup
 * @param {Browser} browser - Puppeteer browser instance
 */
async function closeBrowser(browser) {
    try {
        if (browser) {
            await browser.close();
            console.log('[BROWSER] Browser closed successfully');
        }
    } catch (error) {
        console.log(`[BROWSER] Error closing browser: ${error.message}`);
    }
}

module.exports = {
    createBrowser,
    closeBrowser
};
