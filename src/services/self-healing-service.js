"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfHealingService = void 0;
const config_1 = require("../config/config");
const logger_1 = require("../utils/logger");
const ai_service_1 = require("./ai-service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SelfHealingService {
    constructor() {
        this.config = config_1.ConfigManager.getInstance().getConfig();
        this.aiService = ai_service_1.AIService.getInstance();
        this.healedLocators = [];
        this.locatorCache = new Map();
        this.loadHealedLocators();
    }
    static getInstance() {
        if (!SelfHealingService.instance) {
            SelfHealingService.instance = new SelfHealingService();
        }
        return SelfHealingService.instance;
    }
    async findElement(page, selector, elementDescription = '') {
        const cachedSelector = this.locatorCache.get(selector);
        if (cachedSelector) {
            try {
                const locator = this.getLocator(page, cachedSelector);
                await locator.waitFor({ timeout: 5000 });
                logger_1.logger.info(`Using cached healed locator: ${cachedSelector}`);
                return locator;
            }
            catch {
                this.locatorCache.delete(selector);
            }
        }
        try {
            const locator = this.getLocator(page, selector);
            await locator.waitFor({ timeout: 5000 });
            return locator;
        }
        catch (error) {
            logger_1.logger.warn(`Original selector failed: ${selector}, attempting self-healing`);
            return this.healLocator(page, selector, elementDescription);
        }
    }
    async healLocator(page, originalSelector, elementDescription) {
        if (!this.config.selfHealing.enabled) {
            logger_1.logger.info('Self-healing disabled, returning null');
            return null;
        }
        const strategies = this.config.selfHealing.strategies;
        const maxAttempts = this.config.selfHealing.maxAttempts || 5;
        let aiSuggestions = [];
        if (this.aiService.isAvailable()) {
            const pageContent = await page.content();
            aiSuggestions = await this.aiService.suggestLocator(elementDescription, pageContent, originalSelector);
            logger_1.logger.info(`AI suggested ${aiSuggestions.length} alternative locators`);
        }
        for (const suggestion of aiSuggestions) {
            console.log(`Trying AI suggested locator: ${suggestion}`);
            try {
                const locator = this.getLocator(page, suggestion);
                await locator.waitFor({ timeout: 3000 });
                await this.saveHealedLocator(originalSelector, suggestion, {
                    type: 'css',
                    selector: suggestion,
                    confidence: 0.9,
                });
                return locator;
            }
            catch {
                continue;
            }
        }
        const fallbackSelectors = await this.generateFallbackSelectors(page, originalSelector, strategies);
        for (let i = 0; i < Math.min(fallbackSelectors.length, maxAttempts); i++) {
            const strategy = fallbackSelectors[i];
            try {
                const locator = this.getLocator(page, strategy.selector);
                await locator.waitFor({ timeout: 3000 });
                logger_1.logger.info(`Healed locator found using ${strategy.type}: ${strategy.selector}`);
                await this.saveHealedLocator(originalSelector, strategy.selector, strategy);
                return locator;
            }
            catch {
                continue;
            }
        }
        logger_1.logger.error(`Failed to heal locator: ${originalSelector}`);
        return null;
    }
    async generateFallbackSelectors(page, originalSelector, strategies) {
        const fallbacks = [];
        const textMatch = originalSelector.match(/text=['"]?([^'"]+)['"]?/);
        const idMatch = originalSelector.match(/id=['"]?([^'"]+)['"]?|#(\w+)/);
        const classMatch = originalSelector.match(/class=['"]?([^'"]+)['"]?|\.(\w+)/);
        const tagMatch = originalSelector.match(/^(\w+)/);
        if (strategies.includes('text') && textMatch) {
            fallbacks.push({ type: 'text', selector: `text=${textMatch[1]}` });
            fallbacks.push({ type: 'text', selector: `text=/${textMatch[1]}/i` });
        }
        if (strategies.includes('testId') && idMatch) {
            const id = idMatch[1] || idMatch[2];
            fallbacks.push({ type: 'testId', selector: `[data-testid="${id}"]` });
            fallbacks.push({ type: 'testId', selector: `[data-test="${id}"]` });
        }
        if (strategies.includes('role') && tagMatch) {
            const tag = tagMatch[1].toLowerCase();
            const roleMap = {
                button: 'button',
                a: 'link',
                input: 'textbox',
                select: 'combobox',
                textarea: 'textbox',
            };
            if (roleMap[tag]) {
                fallbacks.push({ type: 'role', selector: `role=${roleMap[tag]}` });
            }
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
    getLocator(page, selector) {
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const role = roleMatch[1];
                const name = roleMatch[2];
                return name ? page.getByRole(role, { name }) : page.getByRole(role);
            }
        }
        return page.locator(selector);
    }
    async saveHealedLocator(original, healed, strategy) {
        const healedLocator = {
            original,
            healed,
            strategy,
            timestamp: new Date(),
            success: true,
        };
        this.healedLocators.push(healedLocator);
        this.locatorCache.set(original, healed);
        if (this.config.selfHealing.saveHealedLocators) {
            const outputPath = path.join(this.config.reporting.outputPath || './test-results', 'healed-locators.json');
            try {
                const dir = path.dirname(outputPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(outputPath, JSON.stringify(this.healedLocators, null, 2));
                logger_1.logger.info(`Saved healed locator to ${outputPath}`);
            }
            catch (error) {
                logger_1.logger.error('Failed to save healed locator', error);
            }
        }
    }
    loadHealedLocators() {
        const outputPath = path.join(this.config.reporting.outputPath || './test-results', 'healed-locators.json');
        try {
            if (fs.existsSync(outputPath)) {
                const data = fs.readFileSync(outputPath, 'utf-8');
                const rawLocators = JSON.parse(data);
                this.healedLocators = rawLocators.map((hl) => ({
                    ...hl,
                    timestamp: new Date(hl.timestamp),
                }));
                this.healedLocators.forEach((hl) => {
                    this.locatorCache.set(hl.original, hl.healed);
                });
                logger_1.logger.info(`Loaded ${this.healedLocators.length} healed locators from cache`);
            }
        }
        catch (error) {
            logger_1.logger.warn('Failed to load healed locators', error);
        }
    }
    getHealedLocators() {
        return this.healedLocators;
    }
    clearCache() {
        this.locatorCache.clear();
        this.healedLocators = [];
    }
}
exports.SelfHealingService = SelfHealingService;
//# sourceMappingURL=self-healing-service.js.map