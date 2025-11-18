import { AgenticPage } from '../../src/core/agentic-page';
import { Page } from '@playwright/test';
export declare class ExampleLoginPage extends AgenticPage {
    private readonly usernameInput;
    private readonly passwordInput;
    private readonly loginButton;
    private readonly errorMessage;
    private readonly successMessage;
    private readonly loginLink;
    constructor(page: Page);
    navigateToBook(): Promise<void>;
    navigateToLogin(): Promise<void>;
    login(username: string, password: string): Promise<void>;
    getErrorMessage(): Promise<string>;
    isLoggedIn(): Promise<boolean>;
    waitForLoginComplete(): Promise<void>;
}
//# sourceMappingURL=example-login.page.d.ts.map