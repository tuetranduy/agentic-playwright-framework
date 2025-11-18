"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportAnalyzer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
const ai_service_1 = require("./ai-service");
const self_healing_service_1 = require("./self-healing-service");
class ReportAnalyzer {
    constructor() {
        this.config = config_1.ConfigManager.getInstance().getConfig();
        this.aiService = ai_service_1.AIService.getInstance();
        this.selfHealingService = self_healing_service_1.SelfHealingService.getInstance();
    }
    static getInstance() {
        if (!ReportAnalyzer.instance) {
            ReportAnalyzer.instance = new ReportAnalyzer();
        }
        return ReportAnalyzer.instance;
    }
    async analyzeResults(resultsPath) {
        const jsonPath = resultsPath || path.join(this.config.reporting.outputPath || './test-results', 'results.json');
        if (!fs.existsSync(jsonPath)) {
            logger_1.logger.warn(`Results file not found: ${jsonPath}`);
            return this.getEmptyAnalysis();
        }
        try {
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            const results = JSON.parse(rawData);
            const analysis = this.parseResults(results);
            if (this.config.reporting.aiAnalysis && analysis.failures.length > 0) {
                logger_1.logger.info('Performing AI analysis of test failures...');
                analysis.aiInsights = await this.aiService.analyzeTestFailures(analysis.failures);
            }
            analysis.healedLocators = this.selfHealingService.getHealedLocators();
            if (this.config.reporting.generateInsights) {
                await this.generateReport(analysis);
            }
            return analysis;
        }
        catch (error) {
            logger_1.logger.error('Failed to analyze test results', error);
            return this.getEmptyAnalysis();
        }
    }
    parseResults(results) {
        const analysis = this.getEmptyAnalysis();
        if (results.suites) {
            this.parseSuites(results.suites, analysis);
        }
        else if (results.stats) {
            // Fallback for a different format that only has stats
            const stats = results.stats;
            analysis.passed = stats.expected || 0;
            analysis.failed = stats.unexpected || 0;
            analysis.skipped = stats.skipped || 0;
            analysis.totalTests = analysis.passed + analysis.failed + analysis.skipped;
        }
        return analysis;
    }
    parseSuites(suites, analysis) {
        for (const suite of suites) {
            if (suite.specs) {
                const specs = suite.specs;
                for (const spec of specs) {
                    analysis.totalTests++;
                    if (spec.ok) {
                        analysis.passed++;
                    }
                    else if (spec.tests) {
                        const tests = spec.tests;
                        const test = tests[0];
                        const results = test?.results;
                        if (results?.[0]?.status === 'skipped') {
                            analysis.skipped++;
                        }
                        else {
                            analysis.failed++;
                            const result = results?.[0];
                            const error = result?.error;
                            const attachments = result?.attachments;
                            const failure = {
                                testName: spec.title || 'Unknown test',
                                error: error?.message || 'Unknown error',
                                screenshot: attachments?.find((a) => a.name === 'screenshot')?.path,
                                trace: attachments?.find((a) => a.name === 'trace')?.path,
                                timestamp: new Date(result?.startTime || Date.now()),
                            };
                            analysis.failures.push(failure);
                        }
                    }
                }
            }
            if (suite.suites) {
                this.parseSuites(suite.suites, analysis);
            }
        }
    }
    async generateReport(analysis) {
        const reportPath = path.join(this.config.reporting.outputPath || './test-results', 'ai-analysis-report.md');
        const report = this.formatReport(analysis);
        try {
            const dir = path.dirname(reportPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(reportPath, report);
            logger_1.logger.info(`AI analysis report generated: ${reportPath}`);
        }
        catch (error) {
            logger_1.logger.error('Failed to generate report', error);
        }
    }
    formatReport(analysis) {
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
    getEmptyAnalysis() {
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
exports.ReportAnalyzer = ReportAnalyzer;
//# sourceMappingURL=report-analyzer.js.map