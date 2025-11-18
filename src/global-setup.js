"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
require("dotenv/config");
async function globalSetup() {
    const configManager = config_1.ConfigManager.getInstance();
    configManager.updateConfig({
        ai: {
            enabled: true,
            provider: 'gemini',
            apiKey: process.env.GEMINI_API_KEY,
            model: 'gemini-2.5-flash-lite',
        },
        selfHealing: {
            enabled: true,
            strategies: ['text', 'role', 'testId', 'css', 'xpath'],
            maxAttempts: 7,
            saveHealedLocators: true,
        },
        reporting: {
            aiAnalysis: true,
            generateInsights: true,
        },
    });
}
exports.default = globalSetup;
//# sourceMappingURL=global-setup.js.map