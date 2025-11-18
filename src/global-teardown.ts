import { ReportAnalyzer } from './services/report-analyzer';

async function globalTeardown() {
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

export default globalTeardown;
