"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const agentic_page_1 = require("../../src/core/agentic-page");
test_1.test.describe('Agentic Framework Basic Tests', () => {
    (0, test_1.test)('should demonstrate basic self-healing capabilities', async ({ page }) => {
        const agenticPage = new agentic_page_1.AgenticPage(page);
        // Navigate to a demo page
        await agenticPage.goto('https://playwright.dev');
        // Try to find elements - framework will use self-healing if needed
        const title = await agenticPage.getTitle();
        (0, test_1.expect)(title).toContain('Playwright');
    });
    (0, test_1.test)('should handle missing elements gracefully', async ({ page }) => {
        const agenticPage = new agentic_page_1.AgenticPage(page);
        await agenticPage.goto('https://playwright.dev');
        // This will trigger self-healing mechanism
        const visible = await agenticPage.isVisible('#non-existent-element');
        (0, test_1.expect)(visible).toBe(false);
    });
});
//# sourceMappingURL=basic.spec.js.map