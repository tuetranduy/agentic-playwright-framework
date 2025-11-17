import { Page, Locator } from '@playwright/test';
import { ConfigManager } from '../config/config';
import { logger } from '../utils/logger';
import { AIService } from './ai-service';
import { HealedLocator, LocatorStrategy } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class SelfHealingService {
  private static instance: SelfHealingService;
  private config = ConfigManager.getInstance().getConfig();
  private aiService = AIService.getInstance();
  private healedLocators: HealedLocator[] = [];
  private locatorCache = new Map<string, string>();

  private constructor() {
    this.loadHealedLocators();
  }

  static getInstance(): SelfHealingService {
    if (!SelfHealingService.instance) {
      SelfHealingService.instance = new SelfHealingService();
    }
    return SelfHealingService.instance;
  }

  async findElement(
    page: Page,
    selector: string,
    elementDescription: string = ''
  ): Promise<Locator | null> {
    // First, try the cached healed locator if it exists
    const cachedSelector = this.locatorCache.get(selector);
    if (cachedSelector) {
      try {
        const locator = this.getLocator(page, cachedSelector);
        await locator.waitFor({ timeout: 5000 });
        logger.info(`Using cached healed locator: ${cachedSelector}`);
        return locator;
      } catch {
        this.locatorCache.delete(selector);
      }
    }

    // Try the original selector
    try {
      const locator = this.getLocator(page, selector);
      await locator.waitFor({ timeout: 5000 });
      return locator;
    } catch (error) {
      logger.warn(`Original selector failed: ${selector}, attempting self-healing`);
      return this.healLocator(page, selector, elementDescription);
    }
  }

  private async healLocator(
    page: Page,
    originalSelector: string,
    elementDescription: string
  ): Promise<Locator | null> {
    if (!this.config.selfHealing.enabled) {
      logger.info('Self-healing disabled, returning null');
      return null;
    }

    const strategies = this.config.selfHealing.strategies;
    const maxAttempts = this.config.selfHealing.maxAttempts || 5;

    // Get AI suggestions if available
    let aiSuggestions: string[] = [];
    if (this.aiService.isAvailable()) {
      const pageContent = await page.content();
      aiSuggestions = await this.aiService.suggestLocator(
        elementDescription,
        pageContent,
        originalSelector
      );
      logger.info(`AI suggested ${aiSuggestions.length} alternative locators`);
    }

    // Try AI suggestions first
    for (const suggestion of aiSuggestions.slice(0, 3)) {
      try {
        const locator = this.getLocator(page, suggestion);
        await locator.waitFor({ timeout: 3000 });
        await this.saveHealedLocator(originalSelector, suggestion, {
          type: 'css',
          selector: suggestion,
          confidence: 0.9,
        });
        return locator;
      } catch {
        continue;
      }
    }

    // Fallback to traditional strategies
    const fallbackSelectors = await this.generateFallbackSelectors(
      page,
      originalSelector,
      strategies
    );

    for (let i = 0; i < Math.min(fallbackSelectors.length, maxAttempts); i++) {
      const strategy = fallbackSelectors[i];
      try {
        const locator = this.getLocator(page, strategy.selector);
        await locator.waitFor({ timeout: 3000 });
        logger.info(`Healed locator found using ${strategy.type}: ${strategy.selector}`);
        await this.saveHealedLocator(originalSelector, strategy.selector, strategy);
        return locator;
      } catch {
        continue;
      }
    }

    logger.error(`Failed to heal locator: ${originalSelector}`);
    return null;
  }

  private async generateFallbackSelectors(
    page: Page,
    originalSelector: string,
    strategies: Array<'text' | 'role' | 'testId' | 'xpath' | 'css' | 'visual'>
  ): Promise<LocatorStrategy[]> {
    const fallbacks: LocatorStrategy[] = [];

    // Extract potential text from selector
    const textMatch = originalSelector.match(/text=['"]?([^'"]+)['"]?/);
    const idMatch = originalSelector.match(/id=['"]?([^'"]+)['"]?|#(\w+)/);
    const classMatch = originalSelector.match(/class=['"]?([^'"]+)['"]?|\.(\w+)/);

    if (strategies.includes('text') && textMatch) {
      fallbacks.push({ type: 'text', selector: `text=${textMatch[1]}` });
      fallbacks.push({ type: 'text', selector: `text=/${textMatch[1]}/i` });
    }

    if (strategies.includes('testId') && idMatch) {
      const id = idMatch[1] || idMatch[2];
      fallbacks.push({ type: 'testId', selector: `[data-testid="${id}"]` });
      fallbacks.push({ type: 'testId', selector: `[data-test="${id}"]` });
    }

    if (strategies.includes('role')) {
      fallbacks.push({ type: 'role', selector: 'role=button' });
      fallbacks.push({ type: 'role', selector: 'role=link' });
      fallbacks.push({ type: 'role', selector: 'role=textbox' });
    }

    if (strategies.includes('css') && classMatch) {
      const className = classMatch[1] || classMatch[2];
      fallbacks.push({ type: 'css', selector: `.${className}` });
    }

    if (strategies.includes('xpath')) {
      if (textMatch) {
        fallbacks.push({
          type: 'xpath',
          selector: `//*[contains(text(), "${textMatch[1]}")]`,
        });
      }
    }

    return fallbacks;
  }

  private getLocator(page: Page, selector: string): Locator {
    // Handle special Playwright selectors
    if (selector.startsWith('text=')) {
      const text = selector.substring(5);
      if (text.startsWith('/') && text.endsWith('/i')) {
        const regex = new RegExp(text.substring(1, text.length - 2), 'i');
        return page.getByText(regex);
      }
      return page.getByText(text);
    }

    if (selector.startsWith('role=')) {
      const roleMatch = selector.match(/role=(\w+)(?:\[name="([^"]+)"\])?/);
      if (roleMatch) {
        const role = roleMatch[1] as any;
        const name = roleMatch[2];
        return name ? page.getByRole(role, { name }) : page.getByRole(role);
      }
    }

    return page.locator(selector);
  }

  private async saveHealedLocator(
    original: string,
    healed: string,
    strategy: LocatorStrategy
  ): Promise<void> {
    const healedLocator: HealedLocator = {
      original,
      healed,
      strategy,
      timestamp: new Date(),
      success: true,
    };

    this.healedLocators.push(healedLocator);
    this.locatorCache.set(original, healed);

    if (this.config.selfHealing.saveHealedLocators) {
      const outputPath = path.join(
        this.config.reporting.outputPath || './test-results',
        'healed-locators.json'
      );

      try {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(outputPath, JSON.stringify(this.healedLocators, null, 2));
        logger.info(`Saved healed locator to ${outputPath}`);
      } catch (error) {
        logger.error('Failed to save healed locator', error);
      }
    }
  }

  private loadHealedLocators(): void {
    const outputPath = path.join(
      this.config.reporting.outputPath || './test-results',
      'healed-locators.json'
    );

    try {
      if (fs.existsSync(outputPath)) {
        const data = fs.readFileSync(outputPath, 'utf-8');
        this.healedLocators = JSON.parse(data);
        this.healedLocators.forEach((hl) => {
          this.locatorCache.set(hl.original, hl.healed);
        });
        logger.info(`Loaded ${this.healedLocators.length} healed locators from cache`);
      }
    } catch (error) {
      logger.warn('Failed to load healed locators', error);
    }
  }

  getHealedLocators(): HealedLocator[] {
    return this.healedLocators;
  }

  clearCache(): void {
    this.locatorCache.clear();
    this.healedLocators = [];
  }
}
