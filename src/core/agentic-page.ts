import { Page, Locator } from '@playwright/test';
import { SelfHealingService } from '../services/self-healing-service';
import { logger } from '../utils/logger';


export class AgenticPage {
  protected page: Page;
  protected selfHealingService: SelfHealingService;

  constructor(page: Page) {
    this.page = page;
    this.selfHealingService = SelfHealingService.getInstance();
  }

  async goto(url: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    try {
      await this.page.goto(url, options);
      logger.info(`Navigated to: ${url}`);
    } catch (error) {
      logger.error(`Failed to navigate to ${url}`, error);
      throw error;
    }
  }

  async findElement(selector: string, description?: string): Promise<Locator | null> {
    return this.selfHealingService.findElement(this.page, selector, description || selector);
  }

  async click(selector: string, description?: string): Promise<void> {
    const locator = await this.findElement(selector, description || `Click ${selector}`);
    if (locator) {
      await locator.click();
      logger.info(`Clicked: ${description || selector}`);
    } else {
      throw new Error(`Could not find element to click: ${selector}`);
    }
  }

  async fill(selector: string, value: string, description?: string): Promise<void> {
    const locator = await this.findElement(selector, description || `Fill ${selector}`);
    if (locator) {
      await locator.fill(value);
      logger.info(`Filled ${description || selector} with: ${value}`);
    } else {
      throw new Error(`Could not find element to fill: ${selector}`);
    }
  }

  async getText(selector: string, description?: string): Promise<string> {
    const locator = await this.findElement(selector, description || `Get text from ${selector}`);
    if (locator) {
      const text = await locator.textContent();
      logger.info(`Got text from ${description || selector}: ${text}`);
      return text || '';
    } else {
      throw new Error(`Could not find element to get text: ${selector}`);
    }
  }

  async isVisible(selector: string, description?: string): Promise<boolean> {
    const locator = await this.findElement(selector, description || `Check visibility ${selector}`);
    if (locator) {
      const visible = await locator.isVisible();
      logger.info(`Element ${description || selector} visible: ${visible}`);
      return visible;
    }
    return false;
  }

  async waitForElement(
    selector: string,
    description?: string,
    options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' | 'detached' }
  ): Promise<Locator | null> {
    const locator = await this.findElement(selector, description || `Wait for ${selector}`);
    if (locator) {
      await locator.waitFor(options);
      logger.info(`Element found and ready: ${description || selector}`);
    }
    return locator;
  }

  async selectOption(
    selector: string,
    value: string | string[],
    description?: string
  ): Promise<void> {
    const locator = await this.findElement(selector, description || `Select ${selector}`);
    if (locator) {
      await locator.selectOption(value);
      logger.info(`Selected option in ${description || selector}: ${value}`);
    } else {
      throw new Error(`Could not find element to select option: ${selector}`);
    }
  }

  async check(selector: string, description?: string): Promise<void> {
    const locator = await this.findElement(selector, description || `Check ${selector}`);
    if (locator) {
      await locator.check();
      logger.info(`Checked: ${description || selector}`);
    } else {
      throw new Error(`Could not find element to check: ${selector}`);
    }
  }

  async uncheck(selector: string, description?: string): Promise<void> {
    const locator = await this.findElement(selector, description || `Uncheck ${selector}`);
    if (locator) {
      await locator.uncheck();
      logger.info(`Unchecked: ${description || selector}`);
    } else {
      throw new Error(`Could not find element to uncheck: ${selector}`);
    }
  }

  async takeScreenshot(name?: string): Promise<void> {
    const screenshotName = name || `screenshot-${Date.now()}.png`;
    await this.page.screenshot({ path: `test-results/${screenshotName}`, fullPage: true });
    logger.info(`Screenshot saved: ${screenshotName}`);
  }

  async evaluate<R>(pageFunction: string | ((arg: unknown) => R), arg?: unknown): Promise<R> {
    const evalFn = this.page.evaluate as unknown as (
      fn: string | ((arg: unknown) => R),
      argument?: unknown
    ) => Promise<R>;
    return evalFn(pageFunction, arg);
  }

  getCurrentUrl(): string {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async reload(): Promise<void> {
    await this.page.reload();
    logger.info('Page reloaded');
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
    logger.info('Navigated back');
  }

  async goForward(): Promise<void> {
    await this.page.goForward();
    logger.info('Navigated forward');
  }

  async waitForNavigation(options?: { timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }): Promise<void> {
    await this.page.waitForLoadState(options?.waitUntil || 'load', { timeout: options?.timeout });
    logger.info('Navigation completed');
  }
}
