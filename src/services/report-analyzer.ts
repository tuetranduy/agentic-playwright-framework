import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../config/config';
import { logger } from '../utils/logger';
import { AIService } from './ai-service';
import { SelfHealingService } from './self-healing-service';
import { ReportAnalysis, TestFailure } from '../types';

export class ReportAnalyzer {
  private static instance: ReportAnalyzer;
  private config = ConfigManager.getInstance().getConfig();
  private aiService = AIService.getInstance();
  private selfHealingService = SelfHealingService.getInstance();

  private constructor() {}

  static getInstance(): ReportAnalyzer {
    if (!ReportAnalyzer.instance) {
      ReportAnalyzer.instance = new ReportAnalyzer();
    }
    return ReportAnalyzer.instance;
  }

  async analyzeResults(resultsPath?: string): Promise<ReportAnalysis> {
    const jsonPath =
      resultsPath || path.join(this.config.reporting.outputPath || './test-results', 'results.json');

    if (!fs.existsSync(jsonPath)) {
      logger.warn(`Results file not found: ${jsonPath}`);
      return this.getEmptyAnalysis();
    }

    try {
      const rawData = fs.readFileSync(jsonPath, 'utf-8');
      const results = JSON.parse(rawData);

      const analysis = this.parseResults(results);

      if (this.config.reporting.aiAnalysis && analysis.failures.length > 0) {
        logger.info('Performing AI analysis of test failures...');
        analysis.aiInsights = await this.aiService.analyzeTestFailures(analysis.failures);
      }

      analysis.healedLocators = this.selfHealingService.getHealedLocators();

      if (this.config.reporting.generateInsights) {
        await this.generateReport(analysis);
      }

      return analysis;
    } catch (error) {
      logger.error('Failed to analyze test results', error);
      return this.getEmptyAnalysis();
    }
  }

  private parseResults(results: Record<string, unknown>): ReportAnalysis {
    const analysis: ReportAnalysis = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: [],
      healedLocators: [],
    };

    if (results.suites) {
      this.parseSuites(results.suites as Array<Record<string, unknown>>, analysis);
    }

    // Handle different result formats
    if (results.stats) {
      const stats = results.stats as Record<string, number>;
      analysis.totalTests = stats.tests || 0;
      analysis.passed = stats.passes || 0;
      analysis.failed = stats.failures || 0;
      analysis.skipped = stats.skipped || 0;
    }

    return analysis;
  }

  private parseSuites(suites: Array<Record<string, unknown>>, analysis: ReportAnalysis): void {
    for (const suite of suites) {
      if (suite.specs) {
        const specs = suite.specs as Array<Record<string, unknown>>;
        for (const spec of specs) {
          analysis.totalTests++;

          if (spec.ok) {
            analysis.passed++;
          } else if (spec.tests) {
            const tests = spec.tests as Array<Record<string, unknown>>;
            const test = tests[0];
            const results = test?.results as Array<Record<string, unknown>> | undefined;
            if (results?.[0]?.status === 'skipped') {
              analysis.skipped++;
            } else {
              analysis.failed++;
              const result = results?.[0] as Record<string, unknown> | undefined;
              const error = result?.error as Record<string, string> | undefined;
              const attachments = result?.attachments as Array<Record<string, string>> | undefined;
              const failure: TestFailure = {
                testName: (spec.title as string) || 'Unknown test',
                error: error?.message || 'Unknown error',
                screenshot: attachments?.find((a) => a.name === 'screenshot')?.path,
                trace: attachments?.find((a) => a.name === 'trace')?.path,
                timestamp: new Date((result?.startTime as number) || Date.now()),
              };
              analysis.failures.push(failure);
            }
          }
        }
      }

      if (suite.suites) {
        this.parseSuites(suite.suites as Array<Record<string, unknown>>, analysis);
      }
    }
  }

  private async generateReport(analysis: ReportAnalysis): Promise<void> {
    const reportPath = path.join(
      this.config.reporting.outputPath || './test-results',
      'ai-analysis-report.md'
    );

    const report = this.formatReport(analysis);

    try {
      const dir = path.dirname(reportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(reportPath, report);
      logger.info(`AI analysis report generated: ${reportPath}`);
    } catch (error) {
      logger.error('Failed to generate report', error);
    }
  }

  private formatReport(analysis: ReportAnalysis): string {
    let report = '# Test Execution Analysis Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;

    report += '## Summary\n\n';
    report += `- **Total Tests:** ${analysis.totalTests}\n`;
    report += `- **Passed:** ${analysis.passed} ✅\n`;
    report += `- **Failed:** ${analysis.failed} ❌\n`;
    report += `- **Skipped:** ${analysis.skipped} ⏭️\n`;
    report += `- **Success Rate:** ${((analysis.passed / analysis.totalTests) * 100).toFixed(2)}%\n\n`;

    if (analysis.failures.length > 0) {
      report += '## Test Failures\n\n';
      analysis.failures.forEach((failure, index) => {
        report += `### ${index + 1}. ${failure.testName}\n\n`;
        report += `**Error:** \`${failure.error}\`\n\n`;
        if (failure.screenshot) {
          report += `**Screenshot:** ${failure.screenshot}\n\n`;
        }
        if (failure.trace) {
          report += `**Trace:** ${failure.trace}\n\n`;
        }
      });
    }

    if (analysis.aiInsights) {
      report += '## AI Analysis Insights\n\n';
      report += `**Summary:** ${analysis.aiInsights.summary}\n\n`;
      if (analysis.aiInsights.rootCause) {
        report += `**Root Cause:** ${analysis.aiInsights.rootCause}\n\n`;
      }
      report += `**Confidence:** ${(analysis.aiInsights.confidence * 100).toFixed(0)}%\n\n`;

      if (analysis.aiInsights.suggestions.length > 0) {
        report += '### Recommendations\n\n';
        analysis.aiInsights.suggestions.forEach((suggestion, index) => {
          report += `${index + 1}. ${suggestion}\n`;
        });
        report += '\n';
      }
    }

    if (analysis.healedLocators.length > 0) {
      report += '## Self-Healed Locators\n\n';
      report += `The framework automatically healed ${analysis.healedLocators.length} locator(s):\n\n`;
      analysis.healedLocators.forEach((hl, index) => {
        report += `${index + 1}. **Original:** \`${hl.original}\`\n`;
        report += `   **Healed:** \`${hl.healed}\`\n`;
        report += `   **Strategy:** ${hl.strategy.type}\n`;
        report += `   **Time:** ${hl.timestamp.toISOString()}\n\n`;
      });
    }

    return report;
  }

  private getEmptyAnalysis(): ReportAnalysis {
    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: [],
      healedLocators: [],
    };
  }
}
