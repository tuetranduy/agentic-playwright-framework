# Agentic Playwright Framework

An intelligent test automation framework built on Playwright with AI-powered self-healing locators and automated report analysis using Node.js and TypeScript.

## 🚀 Features

### 1. **AI-Powered Self-Healing Locators**
- Automatically detects when element locators fail
- Uses AI (OpenAI GPT) to suggest alternative locators
- Falls back to multiple strategies: text, role, test-id, CSS, XPath
- Caches successful healed locators for future use
- Saves healed locators for team collaboration

### 2. **Intelligent Report Analysis**
- AI-powered analysis of test failures
- Root cause identification
- Actionable recommendations
- Comprehensive markdown reports with insights

### 3. **Agentic Page Objects**
- Base `AgenticPage` class with built-in self-healing
- Clean API for common actions (click, fill, getText, etc.)
- Automatic logging of all actions
- Smart element finding with multiple fallback strategies

### 4. **Production-Ready Architecture**
- TypeScript for type safety
- Structured logging with Winston
- Configurable framework settings
- Comprehensive error handling

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

The framework can be configured programmatically or uses sensible defaults:

```typescript
import { ConfigManager } from 'agentic-playwright-framework';

const configManager = ConfigManager.getInstance();
configManager.updateConfig({
  ai: {
    enabled: true,
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo',
    maxRetries: 3,
  },
  selfHealing: {
    enabled: true,
    strategies: ['text', 'role', 'testId', 'css', 'xpath'],
    maxAttempts: 5,
    saveHealedLocators: true,
  },
  reporting: {
    aiAnalysis: true,
    generateInsights: true,
    outputPath: './test-results',
  },
});
```

### Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your-openai-api-key-here
LOG_LEVEL=info
```

## 🎯 Quick Start

### 1. Create a Page Object

```typescript
import { AgenticPage } from 'agentic-playwright-framework';
import { Page } from '@playwright/test';

export class LoginPage extends AgenticPage {
  private readonly usernameInput = '#username';
  private readonly passwordInput = '#password';
  private readonly loginButton = 'button[type="submit"]';

  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username, 'Username field');
    await this.fill(this.passwordInput, password, 'Password field');
    await this.click(this.loginButton, 'Login button');
  }
}
```

### 2. Write Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login.page';
import { ReportAnalyzer } from 'agentic-playwright-framework';

test('login with self-healing', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto('https://example.com/login');
  await loginPage.login('user@example.com', 'password123');
  
  // If selectors break, the framework will automatically try to heal them
  expect(await loginPage.isLoggedIn()).toBe(true);
});

test.afterAll(async () => {
  // Generate AI analysis report
  const analyzer = ReportAnalyzer.getInstance();
  const analysis = await analyzer.analyzeResults();
  console.log(`Tests: ${analysis.totalTests}, Healed: ${analysis.healedLocators.length}`);
});
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run in headed mode
npm run test:headed

# Run with debugging
npm run test:debug

# Build the framework
npm run build
```

## 🧠 How Self-Healing Works

1. **Initial Attempt**: Framework tries the provided selector
2. **AI Analysis**: If it fails, sends page context to AI for suggestions
3. **Strategy Fallbacks**: Tries multiple locator strategies (text, role, testId, CSS, XPath)
4. **Caching**: Successful healed locators are cached for future use
5. **Persistence**: Healed locators saved to `test-results/healed-locators.json`

## 📊 Report Analysis

After test execution, the framework generates:

### 1. **AI Analysis Report** (`ai-analysis-report.md`)
- Test execution summary
- Detailed failure analysis
- AI-generated insights and root cause
- Actionable recommendations
- List of healed locators

### 2. **Healed Locators** (`healed-locators.json`)
- Original vs healed selectors
- Strategy used for healing
- Timestamp and success status

## 🏗️ Framework Architecture

```
src/
├── config/          # Framework configuration
├── core/            # AgenticPage base class
├── services/        # AI, self-healing, and report services
├── types/           # TypeScript type definitions
└── utils/           # Logger and utilities

tests/
├── examples/        # Example test files
└── pages/           # Page object examples
```

## 🔑 Key Classes

### AgenticPage
Base class for page objects with self-healing capabilities.

**Methods:**
- `goto(url)` - Navigate to URL
- `click(selector, description?)` - Click with self-healing
- `fill(selector, value, description?)` - Fill input with self-healing
- `getText(selector, description?)` - Get text with self-healing
- `isVisible(selector, description?)` - Check visibility
- `waitForElement(selector, description?, options?)` - Wait for element

### ConfigManager
Singleton for managing framework configuration.

### AIService
Handles AI interactions for locator suggestions and failure analysis.

### SelfHealingService
Manages the self-healing logic and locator caching.

### ReportAnalyzer
Generates AI-powered test reports with insights.

## 📝 Best Practices

1. **Provide Descriptive Labels**: Use the description parameter for better AI suggestions
   ```typescript
   await page.click('#submit', 'Submit payment button');
   ```

2. **Review Healed Locators**: Periodically review `healed-locators.json` and update your tests

3. **Use Semantic Selectors**: Prefer data-testid, roles, and text over fragile CSS

4. **Configure AI Wisely**: Set appropriate retry limits and enable only when needed

5. **Monitor Logs**: Check `logs/framework.log` for detailed execution information

## 🔍 Example Output

### Console Output
```
[INFO]: Navigated to: https://example.com
[WARN]: Original selector failed: #old-button, attempting self-healing
[INFO]: AI suggested 3 alternative locators
[INFO]: Healed locator found using text: text=Submit
[INFO]: Clicked: Submit button
```

### AI Analysis Report
```markdown
# Test Execution Analysis Report

## Summary
- **Total Tests:** 10
- **Passed:** 8 ✅
- **Failed:** 2 ❌
- **Success Rate:** 80.00%

## AI Analysis Insights
**Summary:** Two tests failed due to element not found errors...
**Root Cause:** Recent UI changes modified button selectors
**Confidence:** 85%

### Recommendations
1. Update selectors to use data-testid attributes
2. Implement visual regression testing
3. Add retry logic for flaky network requests
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- Powered by [OpenAI](https://openai.com/)
- Logging by [Winston](https://github.com/winstonjs/winston)
