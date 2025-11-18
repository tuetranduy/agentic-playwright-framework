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

export const defaultConfig: FrameworkConfig = {
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

export class ConfigManager {
  private static instance: ConfigManager;
  private config: FrameworkConfig;

  private constructor() {
    this.config = { ...defaultConfig };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): FrameworkConfig {
    return this.config;
  }

  updateConfig(updates: Partial<FrameworkConfig>): void {
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
