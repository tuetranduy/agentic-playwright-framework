import { test, expect } from '@playwright/test';
import { ExampleLoginPage } from '../pages/example-login.page';
import { ConfigManager } from '../../src/config/config';
import { ReportAnalyzer } from '../../src/services/report-analyzer';

test.describe('Example Login Tests with Agentic Framework', () => {
  let loginPage: ExampleLoginPage;

  test.beforeAll(() => {
    const configManager = ConfigManager.getInstance();
    configManager.updateConfig({
      ai: {
        enabled: true,
        provider: 'gemini',
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-2.5-flash-lite',
      },
      selfHealing: {
        enabled: true,
        strategies: ['text', 'role', 'testId', 'css'],
        maxAttempts: 5,
        saveHealedLocators: true,
      },
      reporting: {
        aiAnalysis: true,
        generateInsights: true,
      },
    });
  });

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

  test.afterAll(async () => {
    const analyzer = ReportAnalyzer.getInstance();
    const analysis = await analyzer.analyzeResults();

    console.log('\n=== Test Execution Summary ===');
    console.log(`Total: ${analysis.totalTests}`);
    console.log(`Passed: ${analysis.passed}`);
    console.log(`Failed: ${analysis.failed}`);
    console.log(`Healed Locators: ${analysis.healedLocators.length}`);

    if (analysis.aiInsights) {
      console.log('\n=== AI Insights ===');
      console.log(analysis.aiInsights.summary);
    }
  });
});
