
import { Page, expect } from '@playwright/test';
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
  await page.goto('https://demo.us.espocrm.com/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('span[title="Opportunities"]')).toBeVisible();
}
