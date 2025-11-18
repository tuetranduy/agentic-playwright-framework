export interface FrameworkConfig {
    ai: {
        enabled: boolean;
        provider: 'openai' | 'gemini' | 'custom';
        apiKey?: string;
        model?: string;
        maxRetries?: number;
    };
    selfHealing: {
        enabled: boolean;
        strategies: Array<'text' | 'role' | 'testId' | 'xpath' | 'css' | 'visual'>;
        maxAttempts?: number;
        saveHealedLocators?: boolean;
    };
    reporting: {
        aiAnalysis: boolean;
        generateInsights: boolean;
        outputPath?: string;
    };
    timeouts: {
        default?: number;
        navigation?: number;
        action?: number;
    };
}
export declare const defaultConfig: FrameworkConfig;
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(): ConfigManager;
    getConfig(): FrameworkConfig;
    updateConfig(updates: Partial<FrameworkConfig>): void;
}
//# sourceMappingURL=config.d.ts.map