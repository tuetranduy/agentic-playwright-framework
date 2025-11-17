# API Reference

## Core Classes

### AgenticPage

Base class for creating intelligent page objects with self-healing capabilities.

#### Constructor
```typescript
constructor(page: Page)
```

#### Methods

##### Navigation

**`goto(url: string, options?: NavigationOptions): Promise<void>`**
- Navigate to a URL
- Parameters:
  - `url`: Target URL
  - `options`: Optional navigation options (waitUntil, etc.)

**`getCurrentUrl(): string`**
- Returns the current page URL

**`getTitle(): Promise<string>`**
- Returns the page title

**`reload(): Promise<void>`**
- Reload the current page

**`goBack(): Promise<void>`**
- Navigate back in history

**`goForward(): Promise<void>`**
- Navigate forward in history

##### Element Interaction

**`click(selector: string, description?: string): Promise<void>`**
- Click an element with self-healing
- Parameters:
  - `selector`: Element selector
  - `description`: Human-readable description for better AI suggestions

**`fill(selector: string, value: string, description?: string): Promise<void>`**
- Fill an input field
- Parameters:
  - `selector`: Input element selector
  - `value`: Text to fill
  - `description`: Element description

**`getText(selector: string, description?: string): Promise<string>`**
- Get text content from an element
- Returns: Text content or empty string

**`isVisible(selector: string, description?: string): Promise<boolean>`**
- Check if element is visible
- Returns: true if visible, false otherwise

**`check(selector: string, description?: string): Promise<void>`**
- Check a checkbox

**`uncheck(selector: string, description?: string): Promise<void>`**
- Uncheck a checkbox

**`selectOption(selector: string, value: string | string[], description?: string): Promise<void>`**
- Select dropdown option(s)

##### Element Finding

**`findElement(selector: string, description?: string): Promise<Locator | null>`**
- Find element with self-healing
- Returns: Playwright Locator or null if not found

**`waitForElement(selector: string, description?: string, options?: WaitOptions): Promise<Locator | null>`**
- Wait for element to appear
- Options:
  - `timeout`: Maximum wait time
  - `state`: 'visible' | 'hidden' | 'attached' | 'detached'

##### Utilities

**`takeScreenshot(name?: string): Promise<void>`**
- Capture a screenshot
- Saves to test-results directory

**`evaluate<R>(pageFunction: Function, arg?: any): Promise<R>`**
- Execute JavaScript in page context

---

## Configuration

### ConfigManager

Singleton class for managing framework configuration.

#### Methods

**`static getInstance(): ConfigManager`**
- Get the singleton instance

**`getConfig(): FrameworkConfig`**
- Get current configuration

**`updateConfig(updates: Partial<FrameworkConfig>): void`**
- Update configuration at runtime

#### FrameworkConfig Interface

```typescript
interface FrameworkConfig {
  ai: {
    enabled: boolean;
    provider: 'openai' | 'custom';
    apiKey?: string;
    model?: string;
    maxRetries?: number;
  };
  selfHealing: {
    enabled: boolean;
    strategies: Array<'text' | 'role' | 'testId' | 'xpath' | 'css' | 'visual'>;
    maxAttempts?: number;
    saveHealedLocators?: boolean;
  };
  reporting: {
    aiAnalysis: boolean;
    generateInsights: boolean;
    outputPath?: string;
  };
  timeouts: {
    default?: number;
    navigation?: number;
    action?: number;
  };
}
```

---

## Services

### AIService

Provides AI-powered suggestions and analysis.

#### Methods

**`static getInstance(): AIService`**
- Get the singleton instance

**`async suggestLocator(elementDescription: string, pageContent: string, failedSelector: string): Promise<string[]>`**
- Get AI suggestions for alternative locators
- Returns: Array of suggested selectors

**`async analyzeTestFailures(failures: TestFailure[]): Promise<AIAnalysisResult>`**
- Analyze test failures with AI
- Returns: AI analysis with insights and recommendations

**`isAvailable(): boolean`**
- Check if AI service is available

### SelfHealingService

Manages self-healing locator functionality.

#### Methods

**`static getInstance(): SelfHealingService`**
- Get the singleton instance

**`async findElement(page: Page, selector: string, elementDescription?: string): Promise<Locator | null>`**
- Find element with self-healing
- Tries multiple strategies to locate element

**`getHealedLocators(): HealedLocator[]`**
- Get all healed locators from current session

**`clearCache(): void`**
- Clear the healed locator cache

### ReportAnalyzer

Generates comprehensive test reports with AI insights.

#### Methods

**`static getInstance(): ReportAnalyzer`**
- Get the singleton instance

**`async analyzeResults(resultsPath?: string): Promise<ReportAnalysis>`**
- Analyze test results
- Parameters:
  - `resultsPath`: Optional path to results JSON file
- Returns: Complete analysis including AI insights

---

## Types

### HealedLocator
```typescript
interface HealedLocator {
  original: string;
  healed: string;
  strategy: LocatorStrategy;
  timestamp: Date;
  success: boolean;
}
```

### LocatorStrategy
```typescript
interface LocatorStrategy {
  type: 'text' | 'role' | 'testId' | 'xpath' | 'css' | 'visual';
  selector: string;
  confidence?: number;
}
```

### TestFailure
```typescript
interface TestFailure {
  testName: string;
  error: string;
  screenshot?: string;
  trace?: string;
  timestamp: Date;
}
```

### AIAnalysisResult
```typescript
interface AIAnalysisResult {
  summary: string;
  rootCause?: string;
  suggestions: string[];
  confidence: number;
}
```

### ReportAnalysis
```typescript
interface ReportAnalysis {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  failures: TestFailure[];
  aiInsights?: AIAnalysisResult;
  healedLocators: HealedLocator[];
}
```

---

## Usage Examples

### Basic Page Object
```typescript
import { AgenticPage } from 'agentic-playwright-framework';

export class HomePage extends AgenticPage {
  async searchFor(term: string) {
    await this.fill('#search-input', term, 'Search input');
    await this.click('button[type="submit"]', 'Search button');
  }
}
```

### Configuration
```typescript
import { ConfigManager } from 'agentic-playwright-framework';

ConfigManager.getInstance().updateConfig({
  ai: { enabled: true, apiKey: process.env.OPENAI_API_KEY },
  selfHealing: { enabled: true, maxAttempts: 5 }
});
```

### Report Analysis
```typescript
import { ReportAnalyzer } from 'agentic-playwright-framework';

const analyzer = ReportAnalyzer.getInstance();
const analysis = await analyzer.analyzeResults();
console.log(`Healed ${analysis.healedLocators.length} locators`);
```