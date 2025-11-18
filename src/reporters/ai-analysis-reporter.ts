import type {
  FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
} from '@playwright/test/reporter';
import { ReportAnalyzer } from '../services/report-analyzer';

/**
 * Custom Playwright reporter that performs AI analysis after test execution.
 * This runs AFTER the JSON reporter has written results.json, ensuring we analyze
 * the current run's results instead of stale results from a previous run.
 */
class AIAnalysisReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    // Optional: Log when tests begin
  }

  onTestBegin(test: TestCase, result: TestResult) {
    // Optional: Track test start
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Optional: Track test end
  }

  async onEnd(result: FullResult) {
    // This runs after all tests complete and after other reporters have written their output
    console.log('\n=== Running AI Analysis ===');
    
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
  }
}

export default AIAnalysisReporter;
