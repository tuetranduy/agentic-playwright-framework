"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = exports.defaultConfig = void 0;
exports.defaultConfig = {
    ai: {
        enabled: true,
        provider: 'gemini',
        model: 'gemini-2.5-flash-lite',
        maxRetries: 3,
        apiKey: process.env.GEMINI_API_KEY,
    },
    selfHealing: {
        enabled: true,
        strategies: ['text', 'role', 'testId', 'xpath', 'css'],
        maxAttempts: 5,
        saveHealedLocators: true,
    },
    reporting: {
        aiAnalysis: true,
        generateInsights: true,
        outputPath: './test-results',
    },
    timeouts: {
        default: 60000,
        navigation: 60000,
        action: 10000,
    },
};
class ConfigManager {
    constructor() {
        this.config = { ...exports.defaultConfig };
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    getConfig() {
        return this.config;
    }
    updateConfig(updates) {
        this.config = {
            ...this.config,
            ...updates,
            ai: { ...this.config.ai, ...updates.ai },
            selfHealing: { ...this.config.selfHealing, ...updates.selfHealing },
            reporting: { ...this.config.reporting, ...updates.reporting },
            timeouts: { ...this.config.timeouts, ...updates.timeouts },
        };
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map