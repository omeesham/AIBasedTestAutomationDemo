
import { Page, expect, Download } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as testDataArray from '../Data/testdata.json';

// Get the first test data entry (or you can modify this logic as needed)
const testData = testDataArray[0];

// Load environment variables from .env file
dotenv.config();

/**
 * Logs into the CRM demo application.
 * Navigates to the dashboard after successful login.
 *
 * @param page Playwright Page object
 */
export async function CRMLogin(page: Page) {
  // Navigate with domcontentloaded (less strict, faster)
  try {
    await page.goto('https://demo.us.espocrm.com/', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
  } catch (error) {
    console.error('Page load error, continuing anyway:', error);
  }
  
  // Wait for the login form to load and click login button
  try {
    // First try the specific ID selector which we know exists
    const loginButton = page.locator('#btn-login');
    await loginButton.waitFor({ state: 'visible', timeout: 30000 });
    await loginButton.click();
  } catch (error) {
    // Fallback to the original selector if the ID doesn't work
    const loginButton = page.getByRole('button', { name: 'Login' });
    await loginButton.waitFor({ state: 'visible', timeout: 30000 });
    await loginButton.click();
  }
  
  // Wait for navigation after login - check for Leads link in navigation
  await page.waitForSelector('a[href="#Lead"]', { timeout: 30000 });
  
  console.log(`✅ Login successful - Current URL: ${await page.url()}`);
}

/**
 * Navigates to the Leads module
 * @param page Playwright Page object
 */
export async function navigateToLeads(page: Page) {
  await page.getByRole('link').filter({ hasText: 'Leads' }).click();
  await expect(page.getByTitle('Click to refresh')).toBeVisible();
}

/**
 * Opens the advanced filter panel
 * @param page Playwright Page object
 */
export async function openAdvancedFilters(page: Page) {
  await page.locator('button').nth(3).click();
}

/**
 * Applies a Created At date filter
 * @param page Playwright Page object
 * @param dateRange Date range to select (e.g., 'Current Month', 'Last Month', 'Last 7 Days')
 */
export async function applyDateFilter(page: Page, dateRange: string) {
  await openAdvancedFilters(page);
  
  // Wait a moment for the filters panel to fully load
  await page.waitForTimeout(1000);
  
  // Check if the dropdown is already open by looking for the options
  const dropdownVisible = await page.locator('div').filter({ hasText: new RegExp(`^${dateRange}$`) }).first().isVisible();
  
  if (!dropdownVisible) {
    // If dropdown is not visible, try to open it by clicking on the Created At area
    const createdAtArea = page.locator('text=Created At').first();
    if (await createdAtArea.isVisible()) {
      await createdAtArea.click();
      await page.waitForTimeout(500);
    }
  }
  
  // Click on the specific date range option
  try {
    const dateOption = page.locator('div').filter({ hasText: new RegExp(`^${dateRange}$`) }).first();
    await page.waitForTimeout(1000);
    await dateOption.click();
  } catch {
    // Fallback to a different selector if the first approach doesn't work
    await page.locator('div.item, div.option').filter({ hasText: new RegExp(`^${dateRange}$`) }).first().click();
  }
  
  // Close the dropdown by pressing Escape key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // If Escape didn't work, check if dropdown is still open using a more specific selector
  try {
    const isDropdownStillOpen = await page.locator('.selectize-dropdown-content div').filter({ hasText: 'Ever' }).first().isVisible();
    if (isDropdownStillOpen) {
      // Click on the "Created At" label area to close dropdown
      await page.locator('text=Created At').first().click();
      await page.waitForTimeout(500);
    }
  } catch {
    // If the check fails, just continue - the dropdown might already be closed
  }
  
  // Click Apply button using data-action attribute (more reliable)
  await page.locator('[data-action="applyFilters"]').click();
  await page.waitForTimeout(2000); // Wait for filter to apply
}

/**
 * Selects all leads in the current view
 * @param page Playwright Page object
 */
export async function selectAllLeads(page: Page) {
  await page.waitForSelector('input[type="checkbox"].select-all.form-checkbox.form-checkbox-small', { timeout: 10000 });
  await page.locator('input[type="checkbox"].select-all.form-checkbox.form-checkbox-small').click();
  await expect(page.getByRole('button', { name: 'Actions' })).toBeVisible();
}

/**
 * Exports leads to the specified format
 * @param page Playwright Page object
 * @param format Export format ('csv' or 'xlsx')
 * @param exportAllFields Whether to export all fields
 * @returns Promise<Download> Download object
 */
export async function exportLeads(page: Page, format: 'csv' | 'xlsx', exportAllFields: boolean = true): Promise<Download> {
  await page.getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('button', { name: 'Export' }).click();
  await page.waitForTimeout(3000); // Wait for export options to load
  
  if (format === 'csv') {
    // Click the field container to activate the dropdown
    await page.locator('div.field[data-name="format"]').click();
    // Wait for dropdown and select CSV
    await page.waitForSelector('.selectize-dropdown-content .option[data-value="csv"]', { timeout: 5000 });
    await page.locator('.selectize-dropdown-content .option[data-value="csv"]').click();
  }
  
  if (exportAllFields) {
    await page.locator('input[data-name="exportAllFields"].form-checkbox').check();
  }
  
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button[data-name="export"].btn.btn-danger').click();
  return await downloadPromise;
}

/**
 * Searches for leads using the search box
 * @param page Playwright Page object
 * @param searchTerm Term to search for
 */
export async function searchLeads(page: Page, searchTerm: string) {
  await page.locator('input[type="search"], input.form-control').fill(searchTerm);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
}

/**
 * Clears all active filters
 * @param page Playwright Page object
 */
export async function clearFilters(page: Page) {
  // Try to find and click reset/clear filters button
  try {
    await page.locator('button[title="Reset"], .btn-link[data-action="reset"]').first().click({ timeout: 2000 });
  } catch {
    // Alternative method - refresh the page
    await page.reload();
    await page.waitForTimeout(2000);
  }
}

/**
 * Verifies that the main navigation modules are accessible
 * @param page Playwright Page object
 * @param modules Array of module names to verify
 */
export async function verifyNavigationModules(page: Page, modules: string[]) {
  for (const module of modules) {
    await expect(page.getByRole('link').filter({ hasText: module })).toBeVisible();
  }
}

/**
 * Navigates to a specific module
 * @param page Playwright Page object
 * @param moduleName Name of the module to navigate to
 */
export async function navigateToModule(page: Page, moduleName: string) {
  await page.getByRole('link').filter({ hasText: moduleName }).click();
  await page.waitForTimeout(1500);
}

/**
 * Creates a new lead
 * @param page Playwright Page object
 * @param leadData Lead information object
 */
export async function createLead(page: Page, leadData: any) {
  await page.getByRole('link', { name: '+ Create Lead' }).click();
  await page.waitForTimeout(2000);
  
  // Fill lead form (implementation depends on actual form fields)
  if (leadData.name) {
    await page.locator('input[data-name="name"]').fill(leadData.name);
  }
  if (leadData.email) {
    await page.locator('input[data-name="emailAddress"]').fill(leadData.email);
  }
  if (leadData.phone) {
    await page.locator('input[data-name="phoneNumber"]').fill(leadData.phone);
  }
  
  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(2000);
}

/**
 * Verifies the downloaded file
 * @param download Download object from Playwright
 * @param expectedFormat Expected file format
 * @returns File path of downloaded file
 */
export async function verifyDownload(download: Download, expectedFormat: string): Promise<string> {
  const fileName = download.suggestedFilename();
  expect(fileName).toContain(expectedFormat);
  
  // Ensure output directory exists
  const outputDir = './output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const downloadPath = path.join(outputDir, fileName);
  await download.saveAs(downloadPath);
  
  // Verify file exists and has content
  expect(fs.existsSync(downloadPath)).toBeTruthy();
  const stats = fs.statSync(downloadPath);
  expect(stats.size).toBeGreaterThan(0);
  
  console.log(`Downloaded file: ${fileName}, Size: ${stats.size} bytes`);
  return downloadPath;
}
