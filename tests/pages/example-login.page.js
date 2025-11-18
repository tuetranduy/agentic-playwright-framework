"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleLoginPage = void 0;
const agentic_page_1 = require("../../src/core/agentic-page");
class ExampleLoginPage extends agentic_page_1.AgenticPage {
    constructor(page) {
        super(page);
        this.usernameInput = '#username';
        this.passwordInput = '#password';
        this.loginButton = 'button[type="submit"]';
        this.errorMessage = '.error-message';
        this.successMessage = '.success-message';
        this.loginLink = '//link[text()="Log in"]';
    }
    async navigateToBook() {
        await this.goto('/books');
    }
    async navigateToLogin() {
        await this.click(this.loginLink, 'Login link');
    }
    async login(username, password) {
        await this.fill(this.usernameInput, username, 'Username field');
        await this.fill(this.passwordInput, password, 'Password field');
        await this.click(this.loginButton, 'Login button');
    }
    async getErrorMessage() {
        return this.getText(this.errorMessage, 'Error message');
    }
    async isLoggedIn() {
        return this.isVisible(this.successMessage, 'Success message');
    }
    async waitForLoginComplete() {
        await this.waitForElement(this.successMessage, 'Success message', { timeout: 10000 });
    }
}
exports.ExampleLoginPage = ExampleLoginPage;
//# sourceMappingURL=example-login.page.js.map