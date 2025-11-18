"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgenticPage = void 0;
const self_healing_service_1 = require("../services/self-healing-service");
const logger_1 = require("../utils/logger");
/**
 * AgenticPage - Base class for page objects with AI-powered self-healing capabilities
 */
class AgenticPage {
    constructor(page) {
        this.page = page;
        this.selfHealingService = self_healing_service_1.SelfHealingService.getInstance();
    }
    /**
     * Navigate to a URL with error handling
     */
    async goto(url, options) {
        try {
            await this.page.goto(url, options);
            logger_1.logger.info(`Navigated to: ${url}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to navigate to ${url}`, error);
            throw error;
        }
    }
    /**
     * Find element with self-healing capabilities
     */
    async findElement(selector, description) {
        return this.selfHealingService.findElement(this.page, selector, description || selector);
    }
    /**
     * Click on an element with self-healing
     */
    async click(selector, description) {
        const locator = await this.findElement(selector, description || `Click ${selector}`);
        if (locator) {
            await locator.click();
            logger_1.logger.info(`Clicked: ${description || selector}`);
        }
        else {
            throw new Error(`Could not find element to click: ${selector}`);
        }
    }
    /**
     * Fill input field with self-healing
     */
    async fill(selector, value, description) {
        const locator = await this.findElement(selector, description || `Fill ${selector}`);
        if (locator) {
            await locator.fill(value);
            logger_1.logger.info(`Filled ${description || selector} with: ${value}`);
        }
        else {
            throw new Error(`Could not find element to fill: ${selector}`);
        }
    }
    /**
     * Get text content with self-healing
     */
    async getText(selector, description) {
        const locator = await this.findElement(selector, description || `Get text from ${selector}`);
        if (locator) {
            const text = await locator.textContent();
            logger_1.logger.info(`Got text from ${description || selector}: ${text}`);
            return text || '';
        }
        else {
            throw new Error(`Could not find element to get text: ${selector}`);
        }
    }
    /**
     * Check if element is visible with self-healing
     */
    async isVisible(selector, description) {
        const locator = await this.findElement(selector, description || `Check visibility ${selector}`);
        if (locator) {
            const visible = await locator.isVisible();
            logger_1.logger.info(`Element ${description || selector} visible: ${visible}`);
            return visible;
        }
        return false;
    }
    /**
     * Wait for element with self-healing
     */
    async waitForElement(selector, description, options) {
        const locator = await this.findElement(selector, description || `Wait for ${selector}`);
        if (locator) {
            await locator.waitFor(options);
            logger_1.logger.info(`Element found and ready: ${description || selector}`);
        }
        return locator;
    }
    /**
     * Select option from dropdown with self-healing
     */
    async selectOption(selector, value, description) {
        const locator = await this.findElement(selector, description || `Select ${selector}`);
        if (locator) {
            await locator.selectOption(value);
            logger_1.logger.info(`Selected option in ${description || selector}: ${value}`);
        }
        else {
            throw new Error(`Could not find element to select option: ${selector}`);
        }
    }
    /**
     * Check/uncheck checkbox with self-healing
     */
    async check(selector, description) {
        const locator = await this.findElement(selector, description || `Check ${selector}`);
        if (locator) {
            await locator.check();
            logger_1.logger.info(`Checked: ${description || selector}`);
        }
        else {
            throw new Error(`Could not find element to check: ${selector}`);
        }
    }
    async uncheck(selector, description) {
        const locator = await this.findElement(selector, description || `Uncheck ${selector}`);
        if (locator) {
            await locator.uncheck();
            logger_1.logger.info(`Unchecked: ${description || selector}`);
        }
        else {
            throw new Error(`Could not find element to uncheck: ${selector}`);
        }
    }
    /**
     * Take screenshot with automatic naming
     */
    async takeScreenshot(name) {
        const screenshotName = name || `screenshot-${Date.now()}.png`;
        await this.page.screenshot({ path: `test-results/${screenshotName}`, fullPage: true });
        logger_1.logger.info(`Screenshot saved: ${screenshotName}`);
    }
    /**
     * Execute JavaScript in page context
     */
    async evaluate(pageFunction, arg) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.page.evaluate(pageFunction, arg);
    }
    /**
     * Get current URL
     */
    getCurrentUrl() {
        return this.page.url();
    }
    /**
     * Get page title
     */
    async getTitle() {
        return this.page.title();
    }
    /**
     * Reload the page
     */
    async reload() {
        await this.page.reload();
        logger_1.logger.info('Page reloaded');
    }
    /**
     * Go back in browser history
     */
    async goBack() {
        await this.page.goBack();
        logger_1.logger.info('Navigated back');
    }
    /**
     * Go forward in browser history
     */
    async goForward() {
        await this.page.goForward();
        logger_1.logger.info('Navigated forward');
    }
    /**
     * Wait for navigation
     */
    async waitForNavigation(options) {
        await this.page.waitForLoadState(options?.waitUntil || 'load', { timeout: options?.timeout });
        logger_1.logger.info('Navigation completed');
    }
}
exports.AgenticPage = AgenticPage;
//# sourceMappingURL=agentic-page.js.map