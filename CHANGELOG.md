# Changelog

## [Unreleased]

### Fixed
- **AI Summary Stale Results Issue**: Fixed a critical bug where the AI report summary was showing results from the previous test run instead of the current run.
  - **Root Cause**: The `globalTeardown` hook runs before Playwright reporters write their output files, causing the analyzer to read stale `results.json` data.
  - **Solution**: Created a custom Playwright reporter (`AIAnalysisReporter`) that runs after all built-in reporters complete, ensuring the current run's `results.json` is available for analysis.
  - **Files Changed**:
    - Added `src/reporters/ai-analysis-reporter.ts` - Custom reporter with proper lifecycle hooks
    - Updated `playwright.config.ts` - Added custom reporter to the reporter array
    - Updated `src/global-teardown.ts` - Removed analysis logic (now handled by reporter)
    - Updated `.gitignore` - Exclude build artifacts

### Technical Details
**Playwright Test Lifecycle:**
1. `globalSetup` runs before all tests
2. Tests execute
3. `globalTeardown` runs after tests complete
4. **Reporters run and write output** (JSON, HTML, etc.)

The original implementation called `ReportAnalyzer.analyzeResults()` in step 3, but the `results.json` file is only written in step 4, causing the analyzer to read stale data from a previous run.

The fix moves the analysis to a custom reporter's `onEnd` hook, which executes in step 4 after all other reporters have written their files.

**Verification:**
- Tested with intentionally stale `results.json` (100 passed, 50 failed, 25 skipped)
- AI Summary correctly displayed current run data (2 passed, 0 failed)
- Build and linting pass successfully
- No security vulnerabilities detected (CodeQL scan)

