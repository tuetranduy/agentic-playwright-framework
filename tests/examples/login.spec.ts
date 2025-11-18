import { test, expect } from '@playwright/test';
import { ExampleLoginPage } from '../pages/example-login.page';

test.describe('Example Login Tests with Agentic Framework', () => {
  let loginPage: ExampleLoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new ExampleLoginPage(page);
  });

  test('should demonstrate self-healing login', async () => {
    await loginPage.navigateToBook();
    await loginPage.navigateToLogin();
    await loginPage.login('testuser', 'testpass');
  });

  test('should handle form validation', async () => {
    await loginPage.navigateToBook();
    await loginPage.navigateToLogin();
    await loginPage.login('', '');

    const errorMsg = await loginPage.getErrorMessage();
    console.log('Captured error message:', errorMsg);
    expect(errorMsg).toBeTruthy();
  });
});
