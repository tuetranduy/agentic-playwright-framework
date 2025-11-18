"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const example_login_page_1 = require("../pages/example-login.page");
test_1.test.describe('Example Login Tests with Agentic Framework', () => {
    let loginPage;
    test_1.test.beforeEach(async ({ page }) => {
        loginPage = new example_login_page_1.ExampleLoginPage(page);
    });
    (0, test_1.test)('should demonstrate self-healing login', async () => {
        await loginPage.navigateToBook();
        await loginPage.navigateToLogin();
        await loginPage.login('testuser', 'testpass');
    });
    (0, test_1.test)('should handle form validation', async () => {
        await loginPage.navigateToBook();
        await loginPage.navigateToLogin();
        await loginPage.login('', '');
        const errorMsg = await loginPage.getErrorMessage();
        console.log('Captured error message:', errorMsg);
        (0, test_1.expect)(errorMsg).toBeTruthy();
    });
});
//# sourceMappingURL=login.spec.js.map