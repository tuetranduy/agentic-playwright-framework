import { test } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';

test('test logger output with successful navigation', async ({ page }) => {
  const agenticPage = new AgenticPage(page);
  await agenticPage.goto('about:blank');
  await agenticPage.click('body', 'body element');
});
