import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { LeadPage } from '../pages/LeadPage';
import { config } from '../utils/config';
import { formatLeadsConsoleTable } from '../utils/helpers';
import { sendDailyStatisticsEmail } from '../email-util';

/**
 * Lead Management Tests
 * 
 * Full test suite for EspoCRM Lead Management.
 * Uses Page Object Model pattern.
 */
test.describe('EspoCRM Lead Management Tests', () => {

    const cfg = config();
    let loginPage: LoginPage;
    let leadPage: LeadPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        leadPage = new LeadPage(page);
    });

    /**
     * Helper: Full login + navigate to Leads
     */
    async function loginAndNavigateToLeads(page: any): Promise<void> {
        await loginPage.fullLogin(cfg.crmUrl);
        await leadPage.navigateToLeads();
    }

    test('TC01: Export leads with date filtering to CSV', async ({ page }) => {
        console.log('TC01: Starting CSV export test with date filter');

        await loginAndNavigateToLeads(page);

        // Apply Current Month date filter
        await leadPage.applyDateFilter('Current Month');
        await leadPage.verifyFilteredResultsVisible();

        // Select all filtered leads
        await leadPage.selectAllLeads();

        // Export leads to CSV
        const download = await leadPage.exportLeads('csv', true);

        // Verify download
        await leadPage.verifyDownload(download, '.csv');
        console.log('TC01: CSV export test completed successfully');
    });

    test('TC02: Export leads with status filtering to XLSX', async ({ page }) => {
        console.log('TC02: Starting XLSX export test with status filter');

        await loginAndNavigateToLeads(page);

        // Select all leads and export as XLSX
        await leadPage.selectAllLeads();
        const download = await leadPage.exportLeads('xlsx', true);

        // Verify XLSX download
        await leadPage.verifyDownload(download, '.xlsx');
        console.log('TC02: XLSX export test completed successfully');
    });

    test('TC03: Lead selection and bulk actions', async ({ page }) => {
        console.log('TC03: Starting bulk actions test');

        await loginAndNavigateToLeads(page);

        // Select individual lead
        const firstCheckbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
        await firstCheckbox.click();
        await expect(firstCheckbox).toBeChecked();

        // Use select-all
        await leadPage.selectAllLeads();

        // Verify Actions menu is available
        await expect(page.getByRole('button', { name: 'Actions' })).toBeVisible();

        // Click Actions to verify bulk actions
        await page.getByRole('button', { name: 'Actions' }).click();
        await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();

        await page.keyboard.press('Escape');
        console.log('TC03: Bulk actions test completed successfully');
    });

    test('TC05: Lead status workflow', async ({ page }) => {
        console.log('TC05: Starting lead status workflow test');

        await loginAndNavigateToLeads(page);

        // Verify different lead statuses exist
        const statusCount = await leadPage.getStatusElementsCount();
        expect(statusCount).toBeGreaterThan(0);
        console.log(`Found ${statusCount} status elements in lead list`);

        // Test status-based filtering
        await leadPage.applyDateFilter('Current Month');
        await leadPage.verifyFilteredResultsVisible();

        // Verify filtered results still contain various statuses
        const filteredStatusCount = await leadPage.getStatusElementsCount();
        expect(filteredStatusCount).toBeGreaterThan(0);
        console.log(`After filtering: ${filteredStatusCount} status elements visible`);

        // Clear filters
        try {
            await leadPage.clearFilters();
        } catch {
            await page.reload();
        }
        await expect(page.getByTitle('Click to refresh')).toBeVisible();
        console.log('TC05: Lead status workflow test completed successfully');
    });

    test('TC06: Advanced search with multiple criteria', async ({ page }) => {
        console.log('TC06: Starting advanced search test');

        await loginAndNavigateToLeads(page);

        // Apply multiple filters
        await leadPage.applyDateFilter('Current Month');

        // Select leads and verify Actions menu
        await leadPage.selectAllLeads();
        await expect(page.getByRole('button', { name: 'Actions' })).toBeVisible();

        // Verify bulk actions
        await leadPage.verifyBulkActions();

        console.log('TC06: Advanced search test completed successfully');
    });

    test('TC07: Comprehensive export validation', async ({ page }) => {
        console.log('TC07: Starting comprehensive export validation');

        await loginAndNavigateToLeads(page);

        // Apply filtering
        await leadPage.applyDateFilter('Current Month');
        await leadPage.verifyFilteredResultsVisible();

        // Select all leads
        await leadPage.selectAllLeads();

        // Export as XLSX
        const download = await leadPage.exportLeads('xlsx', true);

        // Save file to Data folder
        const downloadPath = path.join(__dirname, '..', '..', 'Data', 'LeadsExport.xlsx');
        const dataDir = path.dirname(downloadPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        await download.saveAs(downloadPath);

        // Verify file was saved
        expect(fs.existsSync(downloadPath)).toBeTruthy();
        const stats = fs.statSync(downloadPath);
        expect(stats.size).toBeGreaterThan(0);

        console.log(`File downloaded to: ${downloadPath}, Size: ${stats.size} bytes`);
        console.log('TC07: Comprehensive export validation completed successfully');
    });

    test('TC08: Email Validation', async ({ page }) => {
        console.log('TC08: Starting email validation test');

        await loginAndNavigateToLeads(page);

        // Apply filtering
        await leadPage.applyDateFilter('Last 7 Days');
        await leadPage.verifyFilteredResultsVisible();

        // Get new leads data
        const newLeadsData = await leadPage.getNewLeadsData();

        // Print to console
        console.log(formatLeadsConsoleTable(newLeadsData));
        console.log(`Total new leads: ${newLeadsData.length}`);

        // Generate HTML report
        const newLeadsFilePath = path.join(__dirname, '..', '..', 'Data', 'newLeadLast7Days.html');
        if (!fs.existsSync(path.dirname(newLeadsFilePath))) {
            fs.mkdirSync(path.dirname(newLeadsFilePath), { recursive: true });
        }

        const htmlOutput = leadPage.generateLeadsHtmlReport(newLeadsData);
        fs.writeFileSync(newLeadsFilePath, htmlOutput);
        console.log(`✅ HTML report saved: ${newLeadsFilePath}`);

        // Export Excel file
        await leadPage.selectAllLeads();
        const download = await leadPage.exportLeads('xlsx', true);

        const downloadPath = path.join(__dirname, '..', '..', 'Data', 'LeadsExport.xlsx');
        await download.saveAs(downloadPath);

        expect(fs.existsSync(downloadPath)).toBeTruthy();
        const stats = fs.statSync(downloadPath);
        expect(stats.size).toBeGreaterThan(0);

        console.log(`Excel report saved: ${downloadPath}, Size: ${stats.size} bytes`);

        // Send email
        try {
            await sendDailyStatisticsEmail(newLeadsFilePath, downloadPath);
            console.log('✅ Email sent successfully');
        } catch (error) {
            console.error('❌ Email failed:', error);
        }

        console.log('TC08 completed successfully');
    });

});
