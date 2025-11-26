const puppeteer = require('puppeteer');
require('dotenv').config();

/**
 * Get browser configuration
 * @returns {Object} Puppeteer browser launch options
 */
function getBrowserConfig() {
  return {
    headless: process.env.PUPPETEER_HEADLESS === 'true' || process.env.NODE_ENV === 'production',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    slowMo: process.env.NODE_ENV === 'development' ? 50 : 0,
  };
}

/**
 * Launch a browser instance
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
async function launchBrowser() {
  try {
    const browser = await puppeteer.launch(getBrowserConfig());
    console.log('✓ Browser launched successfully');
    return browser;
  } catch (error) {
    console.error('✗ Failed to launch browser:', error);
    throw error;
  }
}

/**
 * Take a screenshot and save it
 * @param {Page} page - Puppeteer page object
 * @param {string} filename - Screenshot filename
 * @returns {Promise<string>} Screenshot path
 */
async function takeScreenshot(page, filename) {
  try {
    const fs = require('fs');
    const path = require('path');
    const screenshotDir = path.join(__dirname, '../../..', 'screenshots');

    // Create screenshots directory if it doesn't exist
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const screenshotPath = path.join(screenshotDir, filename);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`✓ Screenshot saved: ${filename}`);
    return screenshotPath;
  } catch (error) {
    console.error('Screenshot error:', error);
    return null;
  }
}

/**
 * Wait with retry logic
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} retries - Number of retries
 * @returns {Promise<boolean>} Success status
 */
async function waitForSelectorWithRetry(page, selector, timeout = 30000, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / retries });
      return true;
    } catch (error) {
      console.log(`Retry ${i + 1}/${retries} for selector: ${selector}`);
      if (i === retries - 1) {
        throw error;
      }
      await page.waitForTimeout(2000);
    }
  }
  return false;
}

/**
 * Type text with human-like delay
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {string} text - Text to type
 * @param {number} delay - Delay between keystrokes in ms
 */
async function typeWithDelay(page, selector, text, delay = 50) {
  await page.waitForSelector(selector);
  await page.click(selector);
  await page.type(selector, text, { delay });
}

/**
 * Safe click with wait
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in milliseconds
 */
async function safeClick(page, selector, timeout = 30000) {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
  await page.waitForTimeout(1000); // Wait for click action to process
}

/**
 * Scroll to element
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 */
async function scrollToElement(page, selector) {
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, selector);
  await page.waitForTimeout(500);
}

/**
 * Check if element exists
 * @param {Page} page - Puppeteer page object
 * @param {string} selector - CSS selector
 * @returns {Promise<boolean>} True if element exists
 */
async function elementExists(page, selector) {
  try {
    const element = await page.$(selector);
    return element !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Close browser safely
 * @param {Browser} browser - Puppeteer browser instance
 */
async function closeBrowser(browser) {
  try {
    if (browser) {
      await browser.close();
      console.log('✓ Browser closed');
    }
  } catch (error) {
    console.error('Error closing browser:', error);
  }
}

module.exports = {
  getBrowserConfig,
  launchBrowser,
  takeScreenshot,
  waitForSelectorWithRetry,
  typeWithDelay,
  safeClick,
  scrollToElement,
  elementExists,
  closeBrowser
};
