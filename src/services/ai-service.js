"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const generative_ai_1 = require("@google/generative-ai");
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
class AIService {
    constructor() {
        this.client = null;
        this.config = config_1.ConfigManager.getInstance().getConfig();
        if (this.config.ai.enabled && this.config.ai.apiKey) {
            try {
                switch (this.config.ai.provider?.toLowerCase?.()) {
                    case 'gemini':
                        this.client = new generative_ai_1.GoogleGenerativeAI(this.config.ai.apiKey);
                        break;
                    case 'openai':
                    default:
                        if (this.config.ai.provider && this.config.ai.provider.toLowerCase() !== 'openai') {
                            logger_1.logger.warn(`Unknown AI provider "${this.config.ai.provider}", defaulting to OpenAI`);
                        }
                        this.client = new openai_1.default({
                            apiKey: this.config.ai.apiKey,
                        });
                        break;
                }
                logger_1.logger.info(`AI Service initialized successfully for provider: ${this.config.ai.provider}`);
            }
            catch (error) {
                logger_1.logger.error('Failed to initialize AI Service', error);
            }
        }
        else {
            logger_1.logger.warn('AI Service disabled or API key not provided');
        }
    }
    static getInstance() {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }
    async suggestLocator(elementDescription, pageContent, failedSelector) {
        if (!this.client) {
            logger_1.logger.warn('AI Service not available, returning default suggestions');
            return this.getDefaultSuggestions(failedSelector);
        }
        try {
            const prompt = `You are an expert in web automation and Playwright selectors. 
                      A test failed because the selector "${failedSelector}" could not find the element.
                      Element description: ${elementDescription}
                      Page HTML snippet: ${pageContent}

                      Please suggest 3-5 alternative Playwright selectors that might work better. Focus on:
                      1. Text-based selectors
                      2. Role-based selectors (getByRole)
                      3. Test IDs
                      4. Robust CSS selectors
                      5. XPath as last resort

                      Return ONLY the selectors, one per line, without explanation.`;
            let suggestions;
            switch (true) {
                case this.client instanceof generative_ai_1.GoogleGenerativeAI: {
                    const model = this.client.getGenerativeModel({ model: this.config.ai.model || 'gemini-pro' });
                    const result = await model.generateContent(prompt);
                    const response = result.response;
                    suggestions = response.text()
                        ?.split('\n')
                        .filter(line => line.trim().length > 0)
                        .map(line => line.trim().replace(/^[-*]\s*/, ''))
                        .filter(line => !/^\d+\./.test(line));
                    break;
                }
                case this.client instanceof openai_1.default: {
                    const response = await this.client.chat.completions.create({
                        model: this.config.ai.model || 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.3,
                        max_tokens: 500,
                    });
                    suggestions = response.choices[0]?.message?.content
                        ?.split('\n')
                        .filter(line => line.trim().length > 0)
                        .map(line => line.trim().replace(/^[-*]\s*/, ''))
                        .filter(line => !/^\d+\./.test(line));
                    break;
                }
                default:
                    suggestions = this.getDefaultSuggestions(failedSelector);
            }
            return suggestions || this.getDefaultSuggestions(failedSelector);
        }
        catch (error) {
            logger_1.logger.error('AI locator suggestion failed', error);
            return this.getDefaultSuggestions(failedSelector);
        }
    }
    async analyzeTestFailures(failures) {
        if (!this.client || failures.length === 0) {
            return {
                summary: 'No AI analysis available',
                suggestions: [],
                confidence: 0,
            };
        }
        try {
            const failureDetails = failures
                .map((f, i) => `Test ${i + 1}: ${f.testName}\nError: ${f.error}\nTime: ${f.timestamp.toISOString()}`)
                .join('\n\n');
            const prompt = `You are an expert test automation analyst. Analyze these test failures and provide insights:

                      ${failureDetails}

                      Provide:
                      1. A concise summary of the failures
                      2. The likely root cause
                      3. 3-5 actionable suggestions to fix the issues
                      4. Your confidence level (0-1)

                      Format your response as JSON:
                      {
                        "summary": "brief summary",
                        "rootCause": "likely root cause",
                        "suggestions": ["suggestion 1", "suggestion 2", ...],
                        "confidence": 0.85
                      }`;
            let content;
            switch (true) {
                case this.client instanceof generative_ai_1.GoogleGenerativeAI: {
                    const model = this.client.getGenerativeModel({ model: this.config.ai.model || 'gemini-pro' });
                    const result = await model.generateContent(prompt);
                    const response = result.response;
                    content = response.text();
                    break;
                }
                case this.client instanceof openai_1.default: {
                    const response = await this.client.chat.completions.create({
                        model: this.config.ai.model || 'gpt-3.5-turbo',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.5,
                        max_tokens: 1000,
                        response_format: { type: 'json_object' },
                    });
                    content = response.choices[0]?.message?.content;
                    break;
                }
            }
            if (content) {
                const jsonMatch = content.match(/{[\s\S]*}/);
                if (jsonMatch) {
                    try {
                        return JSON.parse(jsonMatch[0]);
                    }
                    catch (e) {
                        logger_1.logger.error('Failed to parse JSON from AI response', e);
                    }
                }
            }
            return this.getDefaultAnalysis();
        }
        catch (error) {
            logger_1.logger.error('AI failure analysis failed', error);
            return this.getDefaultAnalysis();
        }
    }
    getDefaultSuggestions(failedSelector) {
        return [
            failedSelector.replace(/^#/, '[data-testid="') + '"]',
            `text=${failedSelector}`,
            `role=button[name="${failedSelector}"]`,
        ];
    }
    getDefaultAnalysis() {
        return {
            summary: 'Multiple test failures detected',
            rootCause: 'Unable to determine root cause',
            suggestions: [
                'Review test logs for detailed error messages',
                'Check if application changes broke the tests',
                'Verify test environment is properly configured',
            ],
            confidence: 0.3,
        };
    }
    isAvailable() {
        return this.client !== null;
    }
}
exports.AIService = AIService;
//# sourceMappingURL=ai-service.js.map