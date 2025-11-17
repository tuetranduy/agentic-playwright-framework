# Agentic Playwright Framework - Examples

This document provides practical examples of using the Agentic Playwright Framework.

## Example 1: Basic Page Interaction with Self-Healing

```typescript
import { test, expect } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';

test('Basic self-healing example', async ({ page }) => {
  const agenticPage = new AgenticPage(page);
  
  await agenticPage.goto('https://example.com');
  
  // Even if the selector changes, the framework will try to heal it
  await agenticPage.click('#submit-button', 'Submit button');
  
  // Framework will try multiple strategies:
  // 1. Original: #submit-button
  // 2. Text: text=Submit
  // 3. Role: role=button[name="Submit"]
  // 4. TestId: [data-testid="submit"]
});
```

## Example 2: Complete Login Flow

```typescript
import { test, expect } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';
import { Page } from '@playwright/test';

class LoginPage extends AgenticPage {
  constructor(page: Page) {
    super(page);
  }

  async login(username: string, password: string) {
    // Self-healing applied automatically to all these actions
    await this.fill('#username', username, 'Username field');
    await this.fill('#password', password, 'Password field');
    await this.click('button[type="submit"]', 'Login button');
    await this.waitForElement('.welcome-message', 'Welcome message');
  }

  async isLoginSuccessful(): Promise<boolean> {
    return this.isVisible('.user-profile', 'User profile section');
  }
}

test.describe('Login Tests', () => {
  test('should login with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto('https://example.com/login');
    await loginPage.login('user@example.com', 'SecurePass123');
    
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goto('https://example.com/login');
    await loginPage.login('invalid@example.com', 'wrongpass');
    
    const errorVisible = await loginPage.isVisible('.error-message', 'Error message');
    expect(errorVisible).toBe(true);
  });
});
```

## Example 3: E-commerce Shopping Flow

```typescript
import { test, expect } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';
import { Page } from '@playwright/test';

class ProductPage extends AgenticPage {
  constructor(page: Page) {
    super(page);
  }

  async searchProduct(productName: string) {
    await this.fill('#search-input', productName, 'Search input');
    await this.click('#search-button', 'Search button');
  }

  async selectFirstProduct() {
    await this.click('.product-card:first-child', 'First product card');
  }

  async addToCart() {
    await this.click('#add-to-cart', 'Add to cart button');
  }

  async getCartCount(): Promise<string> {
    return this.getText('.cart-count', 'Cart count badge');
  }
}

test('Complete shopping flow with self-healing', async ({ page }) => {
  const productPage = new ProductPage(page);
  
  await productPage.goto('https://shop.example.com');
  await productPage.searchProduct('Laptop');
  await productPage.selectFirstProduct();
  await productPage.addToCart();
  
  const cartCount = await productPage.getCartCount();
  expect(cartCount).toBe('1');
});
```

## Example 4: Form Handling with Multiple Fields

```typescript
import { test } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';
import { Page } from '@playwright/test';

class RegistrationPage extends AgenticPage {
  constructor(page: Page) {
    super(page);
  }

  async fillRegistrationForm(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    country: string;
    acceptTerms: boolean;
  }) {
    await this.fill('#firstName', userData.firstName, 'First name');
    await this.fill('#lastName', userData.lastName, 'Last name');
    await this.fill('#email', userData.email, 'Email');
    await this.fill('#password', userData.password, 'Password');
    
    // Select from dropdown
    await this.selectOption('#country', userData.country, 'Country dropdown');
    
    // Checkbox
    if (userData.acceptTerms) {
      await this.check('#terms', 'Terms checkbox');
    }
    
    await this.click('#submit', 'Submit button');
  }
}

test('Register new user', async ({ page }) => {
  const registrationPage = new RegistrationPage(page);
  
  await registrationPage.goto('https://example.com/register');
  
  await registrationPage.fillRegistrationForm({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!',
    country: 'United States',
    acceptTerms: true,
  });
  
  await registrationPage.waitForElement('.success-message', 'Success message');
});
```

## Example 5: Configuration and AI Integration

```typescript
import { test, expect } from '@playwright/test';
import { ConfigManager } from '../src/config/config';
import { ReportAnalyzer } from '../src/services/report-analyzer';
import { AgenticPage } from '../src/core/agentic-page';

test.describe('Tests with AI-powered analysis', () => {
  test.beforeAll(() => {
    // Configure the framework
    const config = ConfigManager.getInstance();
    config.updateConfig({
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
  });

  test('AI-powered test', async ({ page }) => {
    const agenticPage = new AgenticPage(page);
    
    await agenticPage.goto('https://example.com');
    
    // If this selector breaks, AI will suggest alternatives
    await agenticPage.click('#dynamic-button', 'Dynamic button');
  });

  test.afterAll(async () => {
    // Generate AI analysis report
    const analyzer = ReportAnalyzer.getInstance();
    const analysis = await analyzer.analyzeResults();
    
    console.log('\n========== Test Summary ==========');
    console.log(`Total Tests: ${analysis.totalTests}`);
    console.log(`Passed: ${analysis.passed}`);
    console.log(`Failed: ${analysis.failed}`);
    console.log(`Success Rate: ${((analysis.passed / analysis.totalTests) * 100).toFixed(2)}%`);
    console.log(`Healed Locators: ${analysis.healedLocators.length}`);
    
    if (analysis.aiInsights) {
      console.log('\n========== AI Insights ==========');
      console.log(`Summary: ${analysis.aiInsights.summary}`);
      console.log(`Confidence: ${(analysis.aiInsights.confidence * 100).toFixed(0)}%`);
      
      if (analysis.aiInsights.rootCause) {
        console.log(`Root Cause: ${analysis.aiInsights.rootCause}`);
      }
      
      if (analysis.aiInsights.suggestions.length > 0) {
        console.log('\nRecommendations:');
        analysis.aiInsights.suggestions.forEach((suggestion, i) => {
          console.log(`  ${i + 1}. ${suggestion}`);
        });
      }
    }
    
    if (analysis.healedLocators.length > 0) {
      console.log('\n========== Healed Locators ==========');
      analysis.healedLocators.forEach((hl, i) => {
        console.log(`${i + 1}. ${hl.original} → ${hl.healed} (${hl.strategy.type})`);
      });
    }
  });
});
```

## Example 6: Advanced Navigation and JavaScript Execution

```typescript
import { test, expect } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';
import { Page } from '@playwright/test';

class AdvancedPage extends AgenticPage {
  constructor(page: Page) {
    super(page);
  }

  async navigateWithHistory() {
    await this.goto('https://example.com/page1');
    await this.click('#next-page', 'Next page button');
    await this.goBack();
    await this.goForward();
  }

  async executeCustomScript() {
    // Execute JavaScript in page context
    const result = await this.evaluate(() => {
      return document.querySelectorAll('.item').length;
    });
    return result;
  }

  async scrollToElement(selector: string) {
    await this.evaluate((sel) => {
      const element = document.querySelector(sel);
      element?.scrollIntoView({ behavior: 'smooth' });
    }, selector);
  }

  async takeDebugScreenshot() {
    await this.takeScreenshot('debug-screenshot');
  }
}

test('Advanced page interactions', async ({ page }) => {
  const advancedPage = new AdvancedPage(page);
  
  await advancedPage.goto('https://example.com');
  
  const itemCount = await advancedPage.executeCustomScript();
  console.log(`Found ${itemCount} items`);
  
  await advancedPage.scrollToElement('.footer');
  await advancedPage.takeDebugScreenshot();
});
```

## Example 7: Handling Dynamic Content

```typescript
import { test, expect } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';
import { Page } from '@playwright/test';

class DynamicContentPage extends AgenticPage {
  constructor(page: Page) {
    super(page);
  }

  async waitForDynamicContent() {
    // Wait for element to appear with custom timeout
    await this.waitForElement(
      '.dynamic-content',
      'Dynamic content',
      { timeout: 15000, state: 'visible' }
    );
  }

  async clickOnceVisible(selector: string, description: string) {
    await this.waitForElement(selector, description, { state: 'visible' });
    await this.click(selector, description);
  }

  async getTextWhenAvailable(selector: string): Promise<string> {
    await this.waitForElement(selector, 'Text element', { state: 'attached' });
    return this.getText(selector);
  }
}

test('Handle dynamic content with self-healing', async ({ page }) => {
  const dynamicPage = new DynamicContentPage(page);
  
  await dynamicPage.goto('https://example.com/dynamic');
  await dynamicPage.waitForDynamicContent();
  
  // Framework will wait and heal if needed
  await dynamicPage.clickOnceVisible('#load-more', 'Load more button');
  
  const loadedText = await dynamicPage.getTextWhenAvailable('.loaded-content');
  expect(loadedText).toBeTruthy();
});
```

## Example 8: Multi-Step User Journey

```typescript
import { test, expect } from '@playwright/test';
import { AgenticPage } from '../src/core/agentic-page';
import { Page } from '@playwright/test';

class CheckoutFlow extends AgenticPage {
  constructor(page: Page) {
    super(page);
  }

  async addProductToCart(productId: string) {
    await this.click(`[data-product-id="${productId}"]`, `Product ${productId}`);
    await this.click('#add-to-cart', 'Add to cart');
  }

  async proceedToCheckout() {
    await this.click('#cart-icon', 'Cart icon');
    await this.click('#checkout-button', 'Checkout button');
  }

  async fillShippingInfo(info: {
    name: string;
    address: string;
    city: string;
    zip: string;
  }) {
    await this.fill('#shipping-name', info.name, 'Shipping name');
    await this.fill('#shipping-address', info.address, 'Shipping address');
    await this.fill('#shipping-city', info.city, 'Shipping city');
    await this.fill('#shipping-zip', info.zip, 'Shipping ZIP');
    await this.click('#continue-to-payment', 'Continue button');
  }

  async completePayment(cardInfo: { number: string; cvv: string }) {
    await this.fill('#card-number', cardInfo.number, 'Card number');
    await this.fill('#cvv', cardInfo.cvv, 'CVV');
    await this.click('#submit-payment', 'Submit payment');
  }

  async getOrderConfirmation(): Promise<string> {
    await this.waitForElement('.order-confirmation', 'Order confirmation');
    return this.getText('.order-number', 'Order number');
  }
}

test('Complete checkout flow with self-healing', async ({ page }) => {
  const checkout = new CheckoutFlow(page);
  
  await checkout.goto('https://shop.example.com');
  
  // Step 1: Add product
  await checkout.addProductToCart('PROD-123');
  
  // Step 2: Checkout
  await checkout.proceedToCheckout();
  
  // Step 3: Shipping
  await checkout.fillShippingInfo({
    name: 'John Doe',
    address: '123 Main St',
    city: 'New York',
    zip: '10001',
  });
  
  // Step 4: Payment
  await checkout.completePayment({
    number: '4111111111111111',
    cvv: '123',
  });
  
  // Step 5: Confirmation
  const orderNumber = await checkout.getOrderConfirmation();
  expect(orderNumber).toMatch(/^ORD-\d+$/);
  
  console.log(`Order completed: ${orderNumber}`);
});
```

## Running These Examples

1. **Set up environment**:
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY if you want AI features
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npx playwright install
   ```

3. **Run examples**:
   ```bash
   # Run all examples
   npm test

   # Run specific example
   npx playwright test tests/examples/login.spec.ts

   # Run with UI
   npm run test:headed

   # Debug mode
   npm run test:debug
   ```

4. **View results**:
   ```bash
   # View AI analysis report
   cat test-results/ai-analysis-report.md

   # View healed locators
   cat test-results/healed-locators.json

   # Open HTML report
   npx playwright show-report
   ```

## Tips for Writing Tests

1. **Always provide descriptions** for better AI suggestions
2. **Use semantic selectors** (roles, test IDs) when possible
3. **Let the framework heal** - don't immediately fix every broken selector
4. **Review healed locators** periodically and update your tests
5. **Enable logging** during development for better insights
