import { Page, expect } from '@playwright/test';
import { Logger } from '../utils/logger';

/**
 * LoginPage - Page Object Model for CRM Login
 * 
 * Encapsulates all login-related interactions.
 * Clients receive compiled/obfuscated version — source remains protected.
 */
export class LoginPage {
    private page: Page;
    private logger: Logger;

    // Selectors (private — not exposed in dist)
    private readonly loginButton = 'button:has-text("Login")';
    private readonly usernameSelector = 'select';
    private readonly leadsNavLink = 'Leads';
    private readonly navbar = '.navbar, nav';

    constructor(page: Page) {
        this.page = page;
        this.logger = new Logger('LoginPage');
    }

    /**
     * Navigate to the CRM application URL
     */
    async navigate(url: string): Promise<void> {
        this.logger.info(`Navigating to: ${url}`);
        await this.page.goto(url);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Verify login page elements are visible
     */
    async verifyLoginPage(): Promise<void> {
        this.logger.info('Verifying login page elements');
        await expect(this.page.getByRole('button', { name: 'Login' })).toBeVisible();
        await expect(this.page.locator('select, .selectize-input').first()).toBeVisible();
    }

    /**
     * Get selected username value from dropdown
     */
    async getSelectedUsername(): Promise<string> {
        const usernameSelect = this.page.locator(this.usernameSelector).first();
        return await usernameSelect.inputValue();
    }

    /**
     * Perform login action
     */
    async login(): Promise<void> {
        this.logger.info('Performing login');
        await this.page.getByRole('button', { name: 'Login' }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Verify successful login — dashboard elements visible
     */
    async verifyLoginSuccess(): Promise<void> {
        await expect(this.page.getByRole('link').filter({ hasText: this.leadsNavLink })).toBeVisible();
        await expect(this.page.locator(this.navbar)).toBeVisible();
        this.logger.info('Login verified successfully');
    }

    /**
     * Full login flow: navigate → login → verify
     */
    async fullLogin(url: string): Promise<void> {
        await this.navigate(url);
        await this.login();
        await this.verifyLoginSuccess();
        this.logger.info(`Login successful — URL: ${this.page.url()}`);
    }
}
