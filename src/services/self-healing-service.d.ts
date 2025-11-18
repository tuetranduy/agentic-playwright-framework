import { Page, Locator } from '@playwright/test';
import { HealedLocator } from '../types';
export declare class SelfHealingService {
    private static instance;
    private config;
    private aiService;
    private healedLocators;
    private locatorCache;
    private constructor();
    static getInstance(): SelfHealingService;
    findElement(page: Page, selector: string, elementDescription?: string): Promise<Locator | null>;
    private healLocator;
    private generateFallbackSelectors;
    private getLocator;
    private saveHealedLocator;
    private loadHealedLocators;
    getHealedLocators(): HealedLocator[];
    clearCache(): void;
}
//# sourceMappingURL=self-healing-service.d.ts.map