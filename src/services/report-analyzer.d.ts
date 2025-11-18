import { ReportAnalysis } from '../types';
export declare class ReportAnalyzer {
    private static instance;
    private config;
    private aiService;
    private selfHealingService;
    private constructor();
    static getInstance(): ReportAnalyzer;
    analyzeResults(resultsPath?: string): Promise<ReportAnalysis>;
    private parseResults;
    private parseSuites;
    private generateReport;
    private formatReport;
    private getEmptyAnalysis;
}
//# sourceMappingURL=report-analyzer.d.ts.map