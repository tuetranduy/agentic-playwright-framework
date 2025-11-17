import { test, expect } from '@playwright/test';
import { ExampleLoginPage } from '../pages/example-login.page';
import { ConfigManager } from '../../src/config/config';
import { ReportAnalyzer } from '../../src/services/report-analyzer';

test.describe('Example Login Tests with Agentic Framework', () => {
  let loginPage: ExampleLoginPage;

  test.beforeAll(() => {
    // Configure the framework (optional - uses defaults if not configured)
    const configManager = ConfigManager.getInstance();
    configManager.updateConfig({
      ai: {
        enabled: true,
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY, // Set this in your environment
        model: 'gpt-3.5-turbo',
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
    // This test demonstrates the self-healing capability
    // Even if the selectors change slightly, the framework will attempt to find elements
    await loginPage.navigateToLogin();
    await loginPage.login('testuser', 'testpass');
    
    // The framework will automatically try to heal broken locators
    // and log all attempts
  });

  test('should handle form validation', async () => {
    await loginPage.navigateToLogin();
    await loginPage.login('', ''); // Invalid credentials
    
    const errorMsg = await loginPage.getErrorMessage();
    expect(errorMsg).toBeTruthy();
  });

  test.afterAll(async () => {
    // Generate AI-powered report analysis
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
