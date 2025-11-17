# Architecture Overview

## System Design

The Agentic Playwright Framework is designed with modularity and extensibility in mind. It follows a layered architecture:

```
┌─────────────────────────────────────────┐
│         Test Layer (User Code)          │
│   - Test Specs                          │
│   - Page Objects (extending AgenticPage)│
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Core Framework Layer            │
│   - AgenticPage (Base Class)           │
│   - Action Methods with Self-Healing    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Service Layer                   │
│   - SelfHealingService                  │
│   - AIService                           │
│   - ReportAnalyzer                      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Infrastructure Layer               │
│   - ConfigManager                       │
│   - Logger                              │
│   - Type Definitions                    │
└─────────────────────────────────────────┘
```

## Component Responsibilities

### 1. AgenticPage (Core)
- **Purpose**: Base class for all page objects
- **Responsibilities**:
  - Provides high-level action methods
  - Delegates to SelfHealingService for element location
  - Handles error logging and reporting
  - Wraps Playwright Page API with intelligence

### 2. SelfHealingService
- **Purpose**: Automatically heal broken locators
- **Responsibilities**:
  - Detect locator failures
  - Try cached healed locators first
  - Delegate to AIService for suggestions
  - Apply fallback strategies
  - Cache successful heals
  - Persist healed locators to disk

**Healing Flow:**
```
1. Try original selector
2. Check cache for healed version
3. Ask AI for suggestions (if enabled)
4. Try each AI suggestion
5. Fall back to traditional strategies:
   - Text-based matching
   - Role-based matching
   - Test ID variations
   - CSS selector variations
   - XPath (last resort)
6. Cache first successful match
7. Return locator or null
```

### 3. AIService
- **Purpose**: Interface with AI models for intelligent suggestions
- **Responsibilities**:
  - Suggest alternative locators based on page context
  - Analyze test failures for patterns
  - Generate root cause analysis
  - Provide actionable recommendations
  - Handle API rate limiting and errors

**AI Prompts:**
- **Locator Healing**: Analyzes page HTML and failed selector to suggest alternatives
- **Failure Analysis**: Examines multiple test failures to find patterns and root causes

### 4. ReportAnalyzer
- **Purpose**: Generate comprehensive test reports with AI insights
- **Responsibilities**:
  - Parse Playwright test results
  - Extract failure information
  - Call AIService for analysis
  - Collect healed locator data
  - Generate markdown reports
  - Calculate metrics and statistics

### 5. ConfigManager
- **Purpose**: Centralized configuration management
- **Responsibilities**:
  - Store framework settings
  - Provide singleton access
  - Allow runtime configuration updates
  - Merge with defaults

### 6. Logger
- **Purpose**: Structured logging throughout the framework
- **Responsibilities**:
  - Console output with colors
  - File-based logging
  - Log rotation
  - Different log levels
  - Error stack traces

## Data Flow

### Test Execution Flow
```
Test Code
  └─> AgenticPage.click(selector)
       └─> SelfHealingService.findElement(selector)
            ├─> Check cache
            ├─> Try original selector
            ├─> (if fail) AIService.suggestLocator()
            ├─> Try AI suggestions
            ├─> Try fallback strategies
            └─> Return Locator or throw error
```

### Report Generation Flow
```
Test Completion
  └─> ReportAnalyzer.analyzeResults()
       ├─> Parse test results JSON
       ├─> Extract failures
       ├─> Get healed locators
       ├─> AIService.analyzeTestFailures()
       ├─> Generate markdown report
       └─> Save to disk
```

## Configuration Strategy

The framework uses a layered configuration approach:

1. **Default Configuration**: Sensible defaults in `config.ts`
2. **Environment Variables**: Override via `.env` file
3. **Runtime Configuration**: Programmatic updates via ConfigManager
4. **Test-Level Configuration**: Per-test overrides in beforeAll hooks

## Error Handling Strategy

- **Graceful Degradation**: If AI is unavailable, fall back to traditional strategies
- **Detailed Logging**: All errors logged with context
- **User-Friendly Messages**: Clear error messages for debugging
- **Non-Blocking**: AI failures don't stop test execution

## Performance Considerations

### Caching
- Healed locators cached in memory
- Persisted to disk for cross-session reuse
- LRU eviction (if implemented)

### Timeouts
- Configurable timeouts for each action type
- Shorter timeouts for healing attempts
- Exponential backoff for retries

### Parallel Execution
- Services use singleton pattern for shared state
- Thread-safe operations
- Minimal state sharing between tests

## Extension Points

### Custom AI Providers
Implement a new AI provider by extending AIService:
```typescript
class CustomAIService extends AIService {
  // Override suggestLocator and analyzeTestFailures
}
```

### Custom Healing Strategies
Add new strategies to SelfHealingService:
```typescript
// In config
strategies: ['text', 'role', 'testId', 'custom']
```

### Custom Report Formats
Extend ReportAnalyzer for different output formats:
```typescript
class HTMLReportAnalyzer extends ReportAnalyzer {
  // Generate HTML instead of markdown
}
```

## Security Considerations

- API keys stored in environment variables
- Sensitive data not logged
- Page content sanitized before sending to AI
- Configurable data retention policies

## Future Enhancements

1. **Visual Healing**: Use screenshot comparison for element identification
2. **Learning**: ML model to learn from healing patterns
3. **Distributed Caching**: Share healed locators across teams
4. **Real-time Monitoring**: Dashboard for test health
5. **Custom AI Models**: Support for local/private AI models