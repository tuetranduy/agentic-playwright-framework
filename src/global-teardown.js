"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const report_analyzer_1 = require("./services/report-analyzer");
async function globalTeardown() {
    const analyzer = report_analyzer_1.ReportAnalyzer.getInstance();
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
exports.default = globalTeardown;
//# sourceMappingURL=global-teardown.js.map