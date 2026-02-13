import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Navigate with domcontentloaded (less strict, faster)
  try {
    await page.goto('https://demo.us.espocrm.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
  } catch (error) {
    console.error('Page load error, continuing anyway:', error);
  }
  
  // Wait for and click login button
  const loginButton = page.getByRole('button', { name: 'Login' });
  await loginButton.waitFor({ state: 'visible', timeout: 30000 });
  await loginButton.click();
  
  // Wait for navigation after login - check for Leads link in navigation
  await page.waitForSelector('a[href="#Lead"]', { timeout: 30000 });
  
  console.log(`✅ Login successful - Current URL: ${await page.url()}`);
  //await expect(page.getByRole('link').filter({ hasText: 'Leads' })).toBeVisible();
  await page.getByRole('link').filter({ hasText: 'Leads' }).click();
  await expect(page.getByTitle('Click to refresh')).toBeVisible();
  //await expect(page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)).toBeVisible();
  await page.locator('button').nth(3).click();
  await page.getByRole('button', { name: 'Created At' }).click();
  await page.locator('div').filter({ hasText: /^Last 7 Days$/ }).nth(1).click();
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);
  await page.locator('[data-action="applyFilters"]').click();
  await page.waitForTimeout(2000); // Wait for filter to apply
  await expect(page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)).toBeVisible();
  
  // Select all leads using the header checkbox
  await page.waitForSelector('input[type="checkbox"].select-all.form-checkbox.form-checkbox-small', { timeout: 10000 });
  await page.locator('input[type="checkbox"].select-all.form-checkbox.form-checkbox-small').click();
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('button', { name: 'Export' }).click();
  await page.waitForTimeout(3000); // Wait for export options to load
  
  // First click the field container to activate the dropdown
  await page.locator('div.field[data-name="format"]').click();
  
  // Then click the selectize input to open the dropdown
  //await page.locator('.selectize-input.items.has-options.full.has-items').click();
  
  // Wait for dropdown to appear and click CSV option
  await page.waitForSelector('.selectize-dropdown-content .option[data-value="csv"]', { timeout: 5000 });
  await page.locator('.selectize-dropdown-content .option[data-value="csv"]').click();
  
  // Check the export all fields checkbox
  await page.locator('input[data-name="exportAllFields"].form-checkbox').check();
  
  // Setup download handler
  const downloadPromise = page.waitForEvent('download');
  
  // Click the Export button
  await page.locator('button[data-name="export"].btn.btn-danger').click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  console.log('Downloaded file path:', downloadPath);
});