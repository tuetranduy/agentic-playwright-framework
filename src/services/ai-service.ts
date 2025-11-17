import OpenAI from 'openai';
import { ConfigManager } from '../config/config';
import { logger } from '../utils/logger';
import { AIAnalysisResult, TestFailure } from '../types';

export class AIService {
  private static instance: AIService;
  private client: OpenAI | null = null;
  private config = ConfigManager.getInstance().getConfig();

  private constructor() {
    if (this.config.ai.enabled && this.config.ai.apiKey) {
      try {
        this.client = new OpenAI({
          apiKey: this.config.ai.apiKey,
        });
        logger.info('AI Service initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize AI Service', error);
      }
    } else {
      logger.warn('AI Service disabled or API key not provided');
    }
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async suggestLocator(
    elementDescription: string,
    pageContent: string,
    failedSelector: string
  ): Promise<string[]> {
    if (!this.client) {
      logger.warn('AI Service not available, returning default suggestions');
      return this.getDefaultSuggestions(failedSelector);
    }

    try {
      const prompt = `You are an expert in web automation and Playwright selectors. 
A test failed because the selector "${failedSelector}" could not find the element.

Element description: ${elementDescription}

Page HTML snippet:
${pageContent.substring(0, 2000)}

Please suggest 3-5 alternative Playwright selectors that might work better. Focus on:
1. Text-based selectors
2. Role-based selectors (getByRole)
3. Test IDs
4. Robust CSS selectors
5. XPath as last resort

Return ONLY the selectors, one per line, without explanation.`;

      const response = await this.client.chat.completions.create({
        model: this.config.ai.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const suggestions = response.choices[0]?.message?.content
        ?.split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.trim().replace(/^[-*]\s*/, ''))
        .filter((line) => !line.match(/^\d+\./));

      return suggestions || this.getDefaultSuggestions(failedSelector);
    } catch (error) {
      logger.error('AI locator suggestion failed', error);
      return this.getDefaultSuggestions(failedSelector);
    }
  }

  async analyzeTestFailures(failures: TestFailure[]): Promise<AIAnalysisResult> {
    if (!this.client || failures.length === 0) {
      return {
        summary: 'No AI analysis available',
        suggestions: [],
        confidence: 0,
      };
    }

    try {
      const failureDetails = failures
        .map(
          (f, i) =>
            `Test ${i + 1}: ${f.testName}\nError: ${f.error}\nTime: ${f.timestamp.toISOString()}`
        )
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

      const response = await this.client.chat.completions.create({
        model: this.config.ai.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return JSON.parse(content) as AIAnalysisResult;
      }

      return this.getDefaultAnalysis();
    } catch (error) {
      logger.error('AI failure analysis failed', error);
      return this.getDefaultAnalysis();
    }
  }

  private getDefaultSuggestions(failedSelector: string): string[] {
    return [
      failedSelector.replace(/^#/, '[data-testid="') + '"]',
      `text=${failedSelector}`,
      `role=button[name="${failedSelector}"]`,
    ];
  }

  private getDefaultAnalysis(): AIAnalysisResult {
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

  isAvailable(): boolean {
    return this.client !== null;
  }
}
