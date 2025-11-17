import { AgenticPage } from '../../src/core/agentic-page';
import { Page } from '@playwright/test';

export class ExampleLoginPage extends AgenticPage {
  // Selectors
  private readonly usernameInput = '#username';
  private readonly passwordInput = '#password';
  private readonly loginButton = 'button[type="submit"]';
  private readonly errorMessage = '.error-message';
  private readonly successMessage = '.success-message';
  private readonly loginLink = '//a[text()="Log in"]';

  constructor(page: Page) {
    super(page);
  }

  async navigateToBook(): Promise<void> {
    await this.goto('/books');
  }

  async navigateToLogin(): Promise<void> {
    await this.click(this.loginLink, 'Login link');
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username, 'Username field');
    await this.fill(this.passwordInput, password, 'Password field');
    await this.click(this.loginButton, 'Login button');
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage, 'Error message');
  }

  async isLoggedIn(): Promise<boolean> {
    return this.isVisible(this.successMessage, 'Success message');
  }

  async waitForLoginComplete(): Promise<void> {
    await this.waitForElement(this.successMessage, 'Success message', { timeout: 10000 });
  }
}
