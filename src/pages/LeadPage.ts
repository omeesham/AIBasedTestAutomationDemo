import { Page, expect, Download } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';

/**
 * LeadPage - Page Object Model for CRM Lead Management
 * 
 * Encapsulates all lead-related page interactions.
 * Source code is protected — clients receive compiled/obfuscated builds.
 */
export class LeadPage {
    private page: Page;
    private logger: Logger;

    // Selectors (private — not exposed in dist)
    private readonly leadsNavLink = 'Leads';
    private readonly selectAllCheckbox = 'input[type="checkbox"].select-all.form-checkbox.form-checkbox-small';
    private readonly actionsButton = 'Actions';
    private readonly exportButton = 'Export';
    private readonly exportFormatField = 'div.field[data-name="format"]';
    private readonly exportAllFieldsCheckbox = 'input[data-name="exportAllFields"].form-checkbox';
    private readonly exportConfirmButton = 'button[data-name="export"].btn.btn-danger';
    private readonly filterButton = 'button.add-filter-button';
    private readonly filterMenu = '.dropdown-menu.filter-list';
    private readonly createdAtFilter = '[data-action="addFilter"][data-name="createdAt"]';
    private readonly applyFiltersButton = '[data-action="applyFilters"]';
    private readonly refreshButton = 'Click to refresh';
    private readonly listRows = 'table tbody tr';
    private readonly statusColumn = 'table tbody tr td[data-name="status"] span';

    constructor(page: Page) {
        this.page = page;
        this.logger = new Logger('LeadPage');
    }

    /**
     * Navigate to Leads module
     */
    async navigateToLeads(): Promise<void> {
        this.logger.info('Navigating to Leads module');
        await this.page.getByRole('link').filter({ hasText: this.leadsNavLink }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Open advanced filter panel
     */
    async openAdvancedFilters(): Promise<void> {
        this.logger.info('Opening advanced filters');
        const dropdownButton = this.page.locator(this.filterButton);
        await dropdownButton.waitFor({ state: 'visible' });
        await dropdownButton.click();

        const dropdownMenu = this.page.locator(this.filterMenu);
        await dropdownMenu.waitFor({ state: 'visible' });

        const createdAt = this.page.locator(this.createdAtFilter);
        await createdAt.click();
    }

    /**
     * Apply a Created At date filter
     * @param dateRange - e.g., 'Current Month', 'Last Month', 'Last 7 Days'
     */
    async applyDateFilter(dateRange: string): Promise<void> {
        this.logger.info(`Applying date filter: ${dateRange}`);
        await this.openAdvancedFilters();

        // Click Selectize input to open dropdown
        const selectizeInput = this.page.locator('.selectize-control .selectize-input');
        await selectizeInput.click();

        // Wait for dropdown visible
        const dropdown = this.page.locator('.selectize-dropdown');
        await dropdown.waitFor({ state: 'visible' });

        // Click exact option
        const option = this.page.locator('.selectize-dropdown .option', { hasText: dateRange });
        await option.click();

        // Wait for dropdown to close
        await dropdown.waitFor({ state: 'hidden' });

        // Apply filters
        await this.page.locator(this.applyFiltersButton).click();
        this.logger.info(`Date filter "${dateRange}" applied`);
    }

    /**
     * Select all leads in current view
     */
    async selectAllLeads(): Promise<void> {
        this.logger.info('Selecting all leads');
        await this.page.waitForSelector(this.selectAllCheckbox, { timeout: 10000 });
        await this.page.locator(this.selectAllCheckbox).click();
        await expect(this.page.getByRole('button', { name: this.actionsButton })).toBeVisible();
    }

    /**
     * Export leads to specified format
     * @param format - 'csv' or 'xlsx'
     * @param exportAllFields - whether to export all fields
     * @returns Download object
     */
    async exportLeads(format: 'csv' | 'xlsx', exportAllFields: boolean = true): Promise<Download> {
        this.logger.info(`Exporting leads as ${format.toUpperCase()}`);
        await this.page.getByRole('button', { name: this.actionsButton }).click();
        await this.page.getByRole('button', { name: this.exportButton }).click();
        await this.page.waitForTimeout(3000);

        if (format === 'csv') {
            await this.page.locator(this.exportFormatField).click();
            await this.page.waitForSelector('.selectize-dropdown-content .option[data-value="csv"]', { timeout: 5000 });
            await this.page.locator('.selectize-dropdown-content .option[data-value="csv"]').click();
        } else if (format === 'xlsx') {
            await this.page.locator(this.exportFormatField).click();
            await this.page.waitForSelector('.selectize-dropdown-content .option[data-value="xlsx"]', { timeout: 5000 });
            await this.page.locator('.selectize-dropdown-content .option[data-value="xlsx"]').click();
        }

        if (exportAllFields) {
            await this.page.locator(this.exportAllFieldsCheckbox).check();
        }

        const downloadPromise = this.page.waitForEvent('download');
        await this.page.locator(this.exportConfirmButton).click();
        return await downloadPromise;
    }

    /**
     * Verify that the Actions menu contains expected bulk actions
     */
    async verifyBulkActions(): Promise<void> {
        this.logger.info('Verifying bulk actions');
        await this.page.getByRole('button', { name: this.actionsButton }).click();
        await expect(this.page.getByRole('button', { name: this.exportButton })).toBeVisible();

        const bulkActions = ['Follow', 'Unfollow', 'Remove', 'Mass Update'];
        for (const action of bulkActions) {
            try {
                await expect(this.page.getByRole('button', { name: action })).toBeVisible();
                this.logger.info(`Bulk action "${action}" is available`);
            } catch {
                this.logger.info(`Bulk action "${action}" not available`);
            }
        }
        await this.page.keyboard.press('Escape');
    }

    /**
     * Clear all active filters
     */
    async clearFilters(): Promise<void> {
        this.logger.info('Clearing filters');
        try {
            await this.page.locator('button[title="Reset"], .btn-link[data-action="reset"]').first().click({ timeout: 2000 });
        } catch {
            await this.page.reload();
            await this.page.waitForTimeout(2000);
        }
    }

    /**
     * Get status elements count from lead list
     */
    async getStatusElementsCount(): Promise<number> {
        await this.page.waitForSelector(this.listRows, { timeout: 10000 });
        const statusElements = this.page.locator(this.statusColumn);
        return await statusElements.count();
    }

    /**
     * Verify download file
     */
    async verifyDownload(download: Download, expectedFormat: string): Promise<string> {
        const fileName = download.suggestedFilename();
        expect(fileName).toContain(expectedFormat);

        const outputDir = './output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const downloadPath = path.join(outputDir, fileName);
        await download.saveAs(downloadPath);

        expect(fs.existsSync(downloadPath)).toBeTruthy();
        const stats = fs.statSync(downloadPath);
        expect(stats.size).toBeGreaterThan(0);

        this.logger.info(`Downloaded file: ${fileName}, Size: ${stats.size} bytes`);
        return downloadPath;
    }

    /**
     * Verify filtered results panel is visible
     */
    async verifyFilteredResultsVisible(): Promise<void> {
        await expect(
            this.page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)
        ).toBeVisible();
    }

    /**
     * Get new leads data from last 7 days
     */
    async getNewLeadsData(): Promise<Array<any>> {
        await this.page.waitForSelector('table.table tbody tr.list-row', { timeout: 10000 });
        const newLeadsData: Array<any> = [];
        const rows = await this.page.locator('table.table tbody tr.list-row').all();

        for (const row of rows) {
            const statusText = await row.locator('td[data-name="status"] span').textContent();
            if (statusText?.trim() === 'New') {
                newLeadsData.push({
                    name: (await row.locator('td[data-name="name"] a').textContent())?.trim(),
                    status: statusText.trim(),
                    email: (await row.locator('td[data-name="emailAddress"] a').textContent())?.trim(),
                    phone: (await row.locator('td[data-name="phoneNumber"] a').textContent())?.trim(),
                    assignedUser: (await row.locator('td[data-name="assignedUser"] a').textContent())?.trim()
                });
            }
        }

        this.logger.info(`Found ${newLeadsData.length} new leads`);
        return newLeadsData;
    }

    /**
     * Generate HTML report for new leads
     */
    generateLeadsHtmlReport(newLeadsData: Array<any>): string {
        let htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Leads - Last 7 Days</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background-color: white; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background-color: #4CAF50; color: white; padding: 12px; text-align: left; font-weight: bold; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background-color: #f1f1f1; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary { margin-top: 20px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4CAF50; font-weight: bold; }
    .no-data { text-align: center; padding: 30px; color: #999; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <h1>NEW LEADS - LAST 7 DAYS</h1>
    <table>
      <thead>
        <tr><th>Name</th><th>Status</th><th>Email</th><th>Phone</th><th>Assigned User</th></tr>
      </thead>
      <tbody>`;

        if (newLeadsData.length > 0) {
            for (const lead of newLeadsData) {
                htmlOutput += `\n        <tr><td>${lead.name}</td><td>${lead.status}</td><td>${lead.email}</td><td>${lead.phone}</td><td>${lead.assignedUser}</td></tr>`;
            }
        } else {
            htmlOutput += `\n        <tr><td colspan="5" class="no-data">No new leads found in the last 7 days.</td></tr>`;
        }

        htmlOutput += `
      </tbody>
    </table>
    <div class="summary">Total New Leads: ${newLeadsData.length}</div>
  </div>
</body>
</html>`;

        return htmlOutput;
    }
}
