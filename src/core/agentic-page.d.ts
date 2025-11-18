import { Page, Locator } from '@playwright/test';
import { SelfHealingService } from '../services/self-healing-service';
/**
 * AgenticPage - Base class for page objects with AI-powered self-healing capabilities
 */
export declare class AgenticPage {
    protected page: Page;
    protected selfHealingService: SelfHealingService;
    constructor(page: Page);
    /**
     * Navigate to a URL with error handling
     */
    goto(url: string, options?: {
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    }): Promise<void>;
    /**
     * Find element with self-healing capabilities
     */
    findElement(selector: string, description?: string): Promise<Locator | null>;
    /**
     * Click on an element with self-healing
     */
    click(selector: string, description?: string): Promise<void>;
    /**
     * Fill input field with self-healing
     */
    fill(selector: string, value: string, description?: string): Promise<void>;
    /**
     * Get text content with self-healing
     */
    getText(selector: string, description?: string): Promise<string>;
    /**
     * Check if element is visible with self-healing
     */
    isVisible(selector: string, description?: string): Promise<boolean>;
    /**
     * Wait for element with self-healing
     */
    waitForElement(selector: string, description?: string, options?: {
        timeout?: number;
        state?: 'visible' | 'hidden' | 'attached' | 'detached';
    }): Promise<Locator | null>;
    /**
     * Select option from dropdown with self-healing
     */
    selectOption(selector: string, value: string | string[], description?: string): Promise<void>;
    /**
     * Check/uncheck checkbox with self-healing
     */
    check(selector: string, description?: string): Promise<void>;
    uncheck(selector: string, description?: string): Promise<void>;
    /**
     * Take screenshot with automatic naming
     */
    takeScreenshot(name?: string): Promise<void>;
    /**
     * Execute JavaScript in page context
     */
    evaluate<R>(pageFunction: string | ((arg: unknown) => R), arg?: unknown): Promise<R>;
    /**
     * Get current URL
     */
    getCurrentUrl(): string;
    /**
     * Get page title
     */
    getTitle(): Promise<string>;
    /**
     * Reload the page
     */
    reload(): Promise<void>;
    /**
     * Go back in browser history
     */
    goBack(): Promise<void>;
    /**
     * Go forward in browser history
     */
    goForward(): Promise<void>;
    /**
     * Wait for navigation
     */
    waitForNavigation(options?: {
        timeout?: number;
        waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    }): Promise<void>;
}
//# sourceMappingURL=agentic-page.d.ts.map