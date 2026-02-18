import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { config } from '../utils/config';

/**
 * Login & Authentication Tests
 * 
 * TC04: Login and authentication flow
 */
test.describe('Login & Authentication Tests', () => {

    const cfg = config();

    test('TC04: Login and authentication flow', async ({ page }) => {
        console.log('TC04: Starting login and authentication test');

        const loginPage = new LoginPage(page);

        // 1. Navigate to CRM demo URL
        await loginPage.navigate(cfg.crmUrl);

        // 2. Verify login page elements
        await loginPage.verifyLoginPage();

        // 3. Verify username dropdown shows Administrator
        const selectedValue = await loginPage.getSelectedUsername();
        expect(selectedValue).toBe('admin');
        console.log('Login page validation completed');

        // 4. Complete login process
        await loginPage.login();

        // 5. Verify successful login and main interface loads
        await loginPage.verifyLoginSuccess();

        console.log('TC04: Login and authentication test completed successfully');
    });

});
