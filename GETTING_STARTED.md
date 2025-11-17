# Getting Started with Agentic Playwright Framework

This guide will help you get started with the Agentic Playwright Framework, an intelligent test automation solution with AI-powered self-healing capabilities.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- (Optional) OpenAI API key for AI-powered features

## Installation

### 1. Clone or Install the Framework

```bash
# If using as a standalone project
git clone <repository-url>
cd agentic-playwright-framework
npm install

# If using as a dependency (future npm package)
npm install agentic-playwright-framework
```

### 2. Install Playwright Browsers

```bash
npx playwright install
```

### 3. Configure Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your-gemini-api-key-here
LOG_LEVEL=info
```

**Note:** The framework works without an API key, but AI features will be disabled.

## Quick Start

### Step 1: Create Your First Page Object

Create a new file `tests/pages/my-app.page.ts`:

```typescript
import { AgenticPage } from '../../src/core/agentic-page';
import { Page } from '@playwright/test';

export class MyAppPage extends AgenticPage {
  // Define your selectors
  private readonly loginButton = '#login-btn';
  private readonly usernameField = 'input[name="username"]';
  private readonly passwordField = 'input[name="password"]';

  constructor(page: Page) {
    super(page);
  }

  async navigateToApp(): Promise<void> {
    await this.goto('https://your-app.com');
  }

  async performLogin(username: string, password: string): Promise<void> {
    await this.fill(this.usernameField, username, 'Username input');
    await this.fill(this.passwordField, password, 'Password input');
    await this.click(this.loginButton, 'Login button');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.isVisible('.user-profile', 'User profile');
  }
}
```

### Step 2: Write Your First Test

Create `tests/my-first-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { MyAppPage } from './pages/my-app.page';
import { ConfigManager } from '../src/config/config';

test.describe('My First Agentic Test', () => {
  let myApp: MyAppPage;

  test.beforeAll(() => {
    // Optional: Configure the framework
    ConfigManager.getInstance().updateConfig({
      ai: {
        enabled: true,
        apiKey: process.env.GEMINI_API_KEY,
      },
      selfHealing: {
        enabled: true,
        maxAttempts: 5,
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    myApp = new MyAppPage(page);
  });

  test('should login successfully', async () => {
    await myApp.navigateToApp();
    await myApp.performLogin('testuser', 'testpass');
    
    const isLoggedIn = await myApp.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });
});
```

### Step 3: Run Your Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/my-first-test.spec.ts

# Run with UI
npm run test:headed

# Debug mode
npm run test:debug
```

## Understanding Self-Healing

### How It Works

When a test encounters a broken selector, the framework automatically:

1. **Tries the cached healed locator** (if previously healed)
2. **Consults AI** (if enabled) for alternative selectors
3. **Applies fallback strategies**:
   - Text-based matching
   - Role-based matching (accessibility)
   - Test ID variations
   - CSS selector alternatives
   - XPath (last resort)
4. **Caches successful matches** for future use

### Example

```typescript
// Original selector breaks due to UI change
await page.click('#old-submit-btn');

// Framework automatically:
// 1. Tries AI suggestions: 'button[type="submit"]', 'text=Submit'
// 2. Tries text match: page.getByText('Submit')
// 3. Tries role: page.getByRole('button', { name: 'Submit' })
// 4. Caches the working selector for next time
```

### Viewing Healed Locators

After running tests, check:
```bash
cat test-results/healed-locators.json
```

Example output:
```json
[
  {
    "original": "#old-submit-btn",
    "healed": "text=Submit",
    "strategy": { "type": "text", "selector": "text=Submit" },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "success": true
  }
]
```

## Configuration Options

### Framework Configuration

```typescript
import { ConfigManager } from 'agentic-playwright-framework';

const config = ConfigManager.getInstance();
config.updateConfig({
  ai: {
    enabled: true,              // Enable AI features
    provider: 'openai',         // AI provider
    apiKey: 'your-key',         // API key
    model: 'gpt-3.5-turbo',     // Model to use
    maxRetries: 3,              // Max AI retry attempts
  },
  selfHealing: {
    enabled: true,              // Enable self-healing
    strategies: [               // Strategies to try
      'text',
      'role',
      'testId',
      'css',
      'xpath'
    ],
    maxAttempts: 5,             // Max healing attempts
    saveHealedLocators: true,   // Save to file
  },
  reporting: {
    aiAnalysis: true,           // Enable AI analysis
    generateInsights: true,     // Generate reports
    outputPath: './test-results'
  },
  timeouts: {
    default: 30000,             // 30 seconds
    navigation: 60000,          // 60 seconds
    action: 10000,              // 10 seconds
  }
});
```

## Analyzing Test Results

### Generate AI Analysis Report

```typescript
import { ReportAnalyzer } from 'agentic-playwright-framework';

test.afterAll(async () => {
  const analyzer = ReportAnalyzer.getInstance();
  const analysis = await analyzer.analyzeResults();
  
  console.log(`Total: ${analysis.totalTests}`);
  console.log(`Passed: ${analysis.passed}`);
  console.log(`Failed: ${analysis.failed}`);
  console.log(`Healed: ${analysis.healedLocators.length}`);
  
  if (analysis.aiInsights) {
    console.log('\nAI Insights:');
    console.log(analysis.aiInsights.summary);
    console.log('\nRecommendations:');
    analysis.aiInsights.suggestions.forEach((s, i) => {
      console.log(`${i + 1}. ${s}`);
    });
  }
});
```

### View Generated Reports

After test execution:
- **AI Analysis Report**: `test-results/ai-analysis-report.md`
- **Healed Locators**: `test-results/healed-locators.json`
- **Playwright Report**: `playwright-report/index.html`
- **Test Results**: `test-results/results.json`

## Best Practices

### 1. Use Descriptive Labels

```typescript
// Good - provides context for AI
await page.click('#btn', 'Submit order button');

// Less helpful
await page.click('#btn');
```

### 2. Prefer Semantic Selectors

```typescript
// Best - resistant to change
await page.getByRole('button', { name: 'Submit' });
await page.getByTestId('submit-button');

// Okay - may need healing
await page.locator('#submit-btn');

// Fragile - likely to break
await page.locator('div > div:nth-child(3) > button');
```

### 3. Review Healed Locators Regularly

```bash
# Check healed locators after test runs
cat test-results/healed-locators.json

# Update your tests with better selectors
```

### 4. Use Page Objects

Always extend `AgenticPage` for automatic self-healing:

```typescript
export class HomePage extends AgenticPage {
  // Your page object logic
}
```

### 5. Enable Logging for Debugging

```typescript
// In your test
import { logger } from 'agentic-playwright-framework';

test('debug test', async ({ page }) => {
  logger.info('Starting test...');
  // Your test logic
});
```

## Troubleshooting

### Tests Fail Without AI

**Issue:** Tests fail when AI is disabled
**Solution:** Ensure your selectors are robust or enable AI features

### High API Costs

**Issue:** Too many API calls to OpenAI
**Solution:** 
- Reduce `maxRetries` in config
- Use cached healed locators
- Disable AI for stable tests

### Healed Locators Not Persisting

**Issue:** Same locators heal repeatedly
**Solution:** 
- Ensure `saveHealedLocators: true` in config
- Check write permissions for `test-results/` directory

### Logs Too Verbose

**Issue:** Too many log messages
**Solution:** Set `LOG_LEVEL=error` in `.env`

## Advanced Usage

### Custom AI Provider

Extend `AIService` to use your own AI provider:

```typescript
import { AIService } from 'agentic-playwright-framework';

class CustomAIService extends AIService {
  // Override methods with your implementation
}
```

### Custom Healing Strategies

Add custom strategies in configuration:

```typescript
config.updateConfig({
  selfHealing: {
    strategies: ['text', 'role', 'testId', 'custom'],
  }
});
```

### Integration with CI/CD

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

- name: Upload Reports
  uses: actions/upload-artifact@v3
  with:
    name: test-reports
    path: test-results/
```

## Next Steps

- Read the [API Reference](./API.md)
- Study the [Architecture](./ARCHITECTURE.md)
- Explore example tests in `tests/examples/`
- Join our community (if applicable)

## Support

- Issues: GitHub Issues
- Documentation: [README.md](./README.md)
- API Docs: [API.md](./API.md)
