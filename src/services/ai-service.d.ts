import { AIAnalysisResult, TestFailure } from '../types';
export declare class AIService {
    private static instance;
    private client;
    private config;
    private constructor();
    static getInstance(): AIService;
    suggestLocator(elementDescription: string, pageContent: string, failedSelector: string): Promise<string[]>;
    analyzeTestFailures(failures: TestFailure[]): Promise<AIAnalysisResult>;
    private getDefaultSuggestions;
    private getDefaultAnalysis;
    isAvailable(): boolean;
}
//# sourceMappingURL=ai-service.d.ts.map