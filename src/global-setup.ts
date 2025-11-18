import { ConfigManager } from './config/config';
import 'dotenv/config';

async function globalSetup() {
    const configManager = ConfigManager.getInstance();
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

export default globalSetup;
