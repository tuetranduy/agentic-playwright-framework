import { test, expect } from '@playwright/test';
import { AgenticPage } from '../../src/core/agentic-page';

test.describe('Agentic Framework Basic Tests', () => {
  test('should demonstrate basic self-healing capabilities', async ({ page }) => {
    const agenticPage = new AgenticPage(page);
    
    // Navigate to a demo page
    await agenticPage.goto('https://playwright.dev');
    
    // Try to find elements - framework will use self-healing if needed
    const title = await agenticPage.getTitle();
    expect(title).toContain('Playwright');
  });

  test('should handle missing elements gracefully', async ({ page }) => {
    const agenticPage = new AgenticPage(page);
    await agenticPage.goto('https://playwright.dev');
    
    // This will trigger self-healing mechanism
    const visible = await agenticPage.isVisible('#non-existent-element');
    expect(visible).toBe(false);
  });
});
