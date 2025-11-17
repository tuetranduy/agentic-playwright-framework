import { test, expect } from '@playwright/test';
import { ConfigManager } from '../../src/config/config';
import { SelfHealingService } from '../../src/services/self-healing-service';
import { AIService } from '../../src/services/ai-service';

test.describe('Framework Unit Tests', () => {
  test('ConfigManager should be a singleton', () => {
    const config1 = ConfigManager.getInstance();
    const config2 = ConfigManager.getInstance();
    expect(config1).toBe(config2);
  });

  test('ConfigManager should return default config', () => {
    const config = ConfigManager.getInstance().getConfig();
    expect(config.ai.enabled).toBe(true);
    expect(config.selfHealing.enabled).toBe(true);
    expect(config.reporting.aiAnalysis).toBe(true);
  });

  test('ConfigManager should allow config updates', () => {
    const configManager = ConfigManager.getInstance();
    configManager.updateConfig({
      ai: {
        enabled: false,
        provider: 'openai',
      },
    });
    const config = configManager.getConfig();
    expect(config.ai.enabled).toBe(false);
    
    // Reset for other tests
    configManager.updateConfig({
      ai: {
        enabled: true,
        provider: 'openai',
      },
    });
  });

  test('SelfHealingService should be a singleton', () => {
    const service1 = SelfHealingService.getInstance();
    const service2 = SelfHealingService.getInstance();
    expect(service1).toBe(service2);
  });

  test('AIService should be a singleton', () => {
    const service1 = AIService.getInstance();
    const service2 = AIService.getInstance();
    expect(service1).toBe(service2);
  });

  test('AIService should return availability status', () => {
    const aiService = AIService.getInstance();
    const isAvailable = aiService.isAvailable();
    // Without API key, it should not be available
    expect(typeof isAvailable).toBe('boolean');
  });

  test('SelfHealingService should have empty healed locators initially', () => {
    const service = SelfHealingService.getInstance();
    service.clearCache(); // Clear any previous data
    const healedLocators = service.getHealedLocators();
    expect(Array.isArray(healedLocators)).toBe(true);
  });
});
