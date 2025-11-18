import type {
  FullConfig, FullResult, Reporter, Suite, TestCase, TestResult
} from '@playwright/test/reporter';
import { ReportAnalyzer } from '../services/report-analyzer';
import { logger } from '../utils/logger';

class AIAnalysisReporter implements Reporter {
  onBegin(_config: FullConfig, _suite: Suite) {
  }

  onTestBegin(_test: TestCase, _result: TestResult) {
  }

  onTestEnd(_test: TestCase, _result: TestResult) {
  }

  async onEnd(_result: FullResult) {
    console.log('\n=== Running AI Analysis ===');

    const analyzer = ReportAnalyzer.getInstance();
    const analysis = await analyzer.analyzeResults();

    logger.info('\n=== Test Execution Summary ===');
    logger.info(`Total: ${analysis.totalTests}`);
    logger.info(`Passed: ${analysis.passed}`);
    logger.info(`Failed: ${analysis.failed}`);
    logger.info(`Healed Locators: ${analysis.healedLocators.length}`);

    if (analysis.aiInsights) {
      logger.info('\n=== AI Insights ===');
      logger.info(analysis.aiInsights.summary);
    }
  }
}

export default AIAnalysisReporter;
