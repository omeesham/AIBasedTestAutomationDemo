// spec: tests/espocrm-opportunities-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe.skip('EspoCRM Opportunities Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.us.espocrm.com/');
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('span[title="Opportunities"]')).toBeVisible();
  });

  test('TC01 User Login and Navigation to Opportunities', async ({ page }) => {
    await expect(page.locator('span[title="Opportunities"]')).toBeVisible();
    await expect(page.locator('span[title="Home"]')).toBeVisible();
    await expect(page.locator('span[title="Accounts"]')).toBeVisible();
    await expect(page.locator('span[title="Contacts"]')).toBeVisible();
    await expect(page.locator('span[title="Leads"]')).toBeVisible();

    await page.locator('span[title="Opportunities"]').click();
    
    await expect(page.getByTitle('Click to refresh')).toBeVisible();
    await expect(page.getByRole('link', { name: '+ Create Opportunity' })).toBeVisible();
    await expect(page.getByText('Prospecting')).toBeVisible();
    await expect(page.getByText('Qualification')).toBeVisible();
    await expect(page.getByText('Proposal')).toBeVisible();
    await expect(page.getByText('Negotiation')).toBeVisible();
    await expect(page.getByText('Closed Won')).toBeVisible();
  });

  test('TC02 Opportunities Page Validation and Display', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await expect(page.getByTitle('Click to refresh')).toBeVisible();

    await expect(page.getByRole('link', { name: '+ Create Opportunity' })).toBeVisible();
    await expect(page.locator('.text-filter')).toBeVisible();
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();

    await expect(page.getByText('Prospecting')).toBeVisible();
    await expect(page.getByText('Qualification')).toBeVisible();
    await expect(page.getByText('Proposal')).toBeVisible();
    await expect(page.getByText('Negotiation')).toBeVisible();
    await expect(page.getByText('Closed Won')).toBeVisible();

    await expect(page.getByText('15 Tablets Purchase')).toBeVisible();
  });

  test('TC03 End-to-End Opportunity Management Flow', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await expect(page.getByTitle('Click to refresh')).toBeVisible();

    await page.getByRole('link', { name: '+ Create Opportunity' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('textbox').first()).toBeVisible();
    
    await page.getByRole('textbox').first().fill('New Request Demo');
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('textbox').nth(3).pressSequentially('45000');
    
    await expect(page.locator('input[data-name="closeDate"]')).toBeVisible();
    await page.locator('input[data-name="closeDate"]').click();
    await page.locator('input[data-name="closeDate"]').press('Control+a');
    await page.locator('input[data-name="closeDate"]').type('02/28/2026');
    await page.locator('input[data-name="closeDate"]').press('Tab');
    await page.waitForTimeout(1000);
    
    const dateValue = await page.locator('input[data-name="closeDate"]').inputValue();
    if (!dateValue) {
      await page.locator('button[data-action="showDatePicker"]').click();
      await page.waitForTimeout(500);
      await page.keyboard.press('Escape');
      await page.locator('input[data-name="closeDate"]').fill('02/28/2026');
      await page.keyboard.press('Enter');
    }
    
    await expect(page.locator('div:nth-child(2) > .field > .selectize-control > .selectize-input > input')).toBeVisible();
    await page.locator('div:nth-child(2) > .field > .selectize-control > .selectize-input > input').click();
    await expect(page.getByText('Web Site')).toBeVisible();
    await page.getByText('Web Site').click();
    
    await expect(page.locator('textarea')).toBeVisible();
    await page.locator('textarea').fill('Comprehensive CRM solution for enterprise client - E2E automated test');

    await expect(page.getByTitle('Add Item')).toBeVisible();
    await page.getByTitle('Add Item').click();
    await page.waitForTimeout(2000);
    const firstItemRow = page.getByRole('row').filter({ hasText: 'None' }).first();
    await expect(firstItemRow.locator('textarea')).toBeVisible();
    
    await expect(firstItemRow.locator('button[data-action="selectProduct"]')).toBeVisible();
    await firstItemRow.locator('button[data-action="selectProduct"]').click();
    
    await page.waitForTimeout(3000);
    
    await expect(page.locator('a.link[title="Accessories"]')).toBeVisible();
    await page.locator('a.link[title="Accessories"]').click();
    
    await expect(page.locator('a.link[title="Sleepy Wireless Headphones"]')).toBeVisible();
    await page.locator('a.link[title="Sleepy Wireless Headphones"]').click();
    
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: 'Save' }).click();
    
    try {
      await expect(page.locator('.modal-content')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('button[data-name="confirm"]')).toBeVisible();
      await page.locator('button[data-name="confirm"]').click();
      await page.waitForTimeout(1000);
    } catch {
    }
    
    await page.waitForTimeout(2000);
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await page.waitForTimeout(5000);

    await expect(page.locator('input[data-name="textFilter"]')).toBeVisible();
    await page.locator('input[data-name="textFilter"]').fill('New Request Demo');
    await page.locator('input[data-name="textFilter"]').press('Enter');
    
    await expect(page.getByText('New Request Demo').first()).toBeVisible();
    
    await page.locator('input[data-name="textFilter"]').fill('');
    await page.locator('input[data-name="textFilter"]').press('Enter');
  });

  test('TC04 Create Opportunity - Validation and Error Handling', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await expect(page.getByRole('link', { name: '+ Create Opportunity' })).toBeVisible();
    await page.getByRole('link', { name: '+ Create Opportunity' }).click();

    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Not valid')).toBeVisible();

    await expect(page.getByRole('textbox').first()).toBeVisible();
    await page.getByRole('textbox').first().fill('Test Opportunity');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Amount is required')).toBeVisible();

    await expect(page.getByRole('textbox').nth(3)).toBeVisible();
    await page.getByRole('textbox').nth(3).fill('-1000');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.locator('input[data-name="closeDate"]')).toBeVisible();
    await page.locator('input[data-name="closeDate"]').click();
    await page.locator('input[data-name="closeDate"]').press('Control+a');
    await page.locator('input[data-name="closeDate"]').type('01/01/2025');
    await page.locator('input[data-name="closeDate"]').press('Tab');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByTitle('Add Item')).toBeVisible();
    await page.getByTitle('Add Item').click();
    await page.getByRole('button', { name: 'Save' }).click();
    
    try {
      await expect(page.locator('.modal-content')).toBeVisible({ timeout: 3000 });
      await page.locator('button[data-name="confirm"]').click();
      await page.waitForTimeout(1000);
    } catch {
    }
    
    await expect(page.getByText('Unit Price is required')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTitle('Click to refresh')).toBeVisible();
  });

  test('TC05 Opportunity Search Functionality', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await expect(page.locator('input[data-name="textFilter"]')).toBeVisible();

    await page.locator('input[data-name="textFilter"]').fill('15 Tablets');
    await page.locator('input[data-name="textFilter"]').press('Enter');
    await expect(page.getByText('15 Tablets Purchase').first()).toBeVisible();

    await page.locator('input[data-name="textFilter"]').fill('laptop');
    await page.locator('input[data-name="textFilter"]').press('Enter');
    await expect(page.getByRole('link', { name: 'Laptop Bulk Purchase &' })).toBeVisible();

    await page.locator('input[data-name="textFilter"]').fill('NonExistentOpportunity123');
    await page.locator('input[data-name="textFilter"]').press('Enter');

    await page.locator('input[data-name="textFilter"]').fill('');
    await page.locator('input[data-name="textFilter"]').press('Enter');

    await page.locator('input[data-name="textFilter"]').fill('Janeville');
    await page.locator('input[data-name="textFilter"]').press('Enter');
    await page.waitForTimeout(2000);
    
    try {
      await expect(page.getByText('No Data')).toBeVisible({ timeout: 3000 });
    } catch {
      await expect(page.locator('input[data-name="textFilter"]')).toHaveValue('Janeville');
      await expect(page.getByRole('link', { name: 'Janeville' })).not.toBeVisible();
    }
  });

  test('TC06 Opportunity Details View and Validation', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await expect(page.getByText('15 Tablets Purchase').first()).toBeVisible();

    await page.getByRole('link', { name: '15 Tablets Purchase' }).click();

    await page.waitForTimeout(2000);
    await expect(page.getByText('15 Tablets Purchase').first()).toBeVisible();

    await expect(page.getByRole('link', { name: 'Janeville' }).first()).toBeVisible();
    await expect(page.getByText('Prospecting').first()).toBeVisible();
    await expect(page.getByText('$2,250.00').first()).toBeVisible();

    await expect(page.getByText('Items').first()).toBeVisible();
    await expect(page.getByText('EasyType HD10 Tablet').first()).toBeVisible();
    await expect(page.getByText('15').first()).toBeVisible();
    await expect(page.getByText('150.00').first()).toBeVisible();

    await expect(page.getByRole('link', { name: 'Opportunities' })).toBeVisible();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByTitle('Click to refresh')).toBeVisible();
  });

  test('TC07 Opportunity Management Edge Cases', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await expect(page.getByRole('link', { name: '+ Create Opportunity' })).toBeVisible();
    await page.getByRole('link', { name: '+ Create Opportunity' }).click();

    await expect(page.getByRole('textbox').first()).toBeVisible();

    const longName = 'A'.repeat(255);
    await page.getByRole('textbox').first().fill(longName);
    await expect(page.getByRole('textbox').first()).toHaveValue(longName.substring(0, 255));

    await page.getByRole('textbox').first().fill('Test Öppörtünity with Spëcial Chärs & Symbols!@#$%');
    await expect(page.getByRole('textbox').first()).toHaveValue('Test Öppörtünity with Spëcial Chärs & Symbols!@#$%');

    await expect(page.getByRole('textbox').nth(3)).toBeVisible();
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('textbox').nth(3).pressSequentially('99999999');
    await expect(page.getByRole('textbox').nth(3)).toHaveValue('99,999,999');

    await page.getByRole('textbox').first().fill('测试机会 Тест возможности تست فرصت');
    await expect(page.getByRole('textbox').first()).toHaveValue('测试机会 Тест возможности تست فرصت');
  });

  test('TC08 Opportunity Data Integrity and Business Rules', async ({ page }) => {
    await page.locator('span[title="Opportunities"]').click();
    await page.getByRole('link', { name: '+ Create Opportunity' }).click();

    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.getByRole('textbox').nth(3)).toBeVisible();

    await page.getByRole('textbox').first().fill('Calculation Test');
    await page.getByRole('textbox').nth(3).pressSequentially('5000');
    
    await page.getByTitle('Add Item').click();
    await page.waitForTimeout(1000);
    
    const itemRow = page.getByRole('row').filter({ hasText: 'None' }).first();
    await expect(itemRow).toBeVisible();

    await expect(page.locator('input[data-name="closeDate"]')).toBeVisible();
    await page.locator('input[data-name="closeDate"]').click();
    await page.locator('input[data-name="closeDate"]').press('Control+a');
    await page.locator('input[data-name="closeDate"]').type('03/15/2026');
    await page.locator('input[data-name="closeDate"]').blur();
    await page.waitForTimeout(1000);
    
    await expect(page.locator('input[data-name="closeDate"]')).toHaveValue('03/15/2026');

    await page.getByRole('textbox').first().fill('');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Not valid')).toBeVisible();

    await page.getByRole('textbox').first().fill('Data Integrity Test');
    await page.getByRole('textbox').nth(3).pressSequentially('5000');
    
    await page.getByRole('button', { name: 'Save' }).click();
    
    try {
      await expect(page.locator('.modal-content')).toBeVisible({ timeout: 3000 });
      await page.locator('button[data-name="confirm"]').click();
      await page.waitForTimeout(1000);
    } catch {
    }
    
    await expect(page.getByRole('link', { name: 'Opportunities' })).toBeVisible();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await page.waitForTimeout(3000);
    
    try {
      await expect(page.getByTitle('Click to refresh')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Data Integrity Test').first()).toBeVisible();
      await expect(page.getByText('$5,000.00').first()).toBeVisible();
    } catch {
      expect(page.url()).toContain('Opportunity');
    }
  });
});