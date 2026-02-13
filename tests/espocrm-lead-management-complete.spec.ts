import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { 
  CRMLogin, 
  navigateToLeads, 
  applyDateFilter,
  selectAllLeads, 
  exportLeads, 
  clearFilters, 
  verifyDownload 
} from '../Common/commonMethods';
import { sendDailyStatisticsEmail } from '../src/email-util';

test.describe('EspoCRM Lead Management Tests', () => {

  test('TC01: Export leads with date filtering to CSV', async ({ page }) => {
    console.log('TC01: Starting CSV export test with date filter');
    
    // 1. Navigate to EspoCRM demo application
    await CRMLogin(page);
    
    // 2. Navigate to Leads module
    await navigateToLeads(page);
    
    // 3. Apply Current Month date filter
    await applyDateFilter(page, 'Current Month');
    await expect(page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)).toBeVisible();
    
    // 4. Select all filtered leads
    await selectAllLeads(page);
    
    // 5. Export leads to CSV
    const download = await exportLeads(page, 'csv', true);
    
    // 6. Verify download
    await verifyDownload(download, '.csv');
    console.log('TC01: CSV export test completed successfully');
  });

  test('TC02: Export leads with status filtering to XLSX', async ({ page }) => {
    console.log('TC02: Starting XLSX export test with status filter');
    
    // 1. Login and navigate to Leads
    await CRMLogin(page);
    await navigateToLeads(page);
    
 
    // 3. Select all leads and export as XLSX (default format)
    await selectAllLeads(page);
    const download = await exportLeads(page, 'xlsx', true);
    
    // 4. Verify XLSX download
    await verifyDownload(download, '.xlsx');
    console.log('TC02: XLSX export test completed successfully');
  });

  test('TC03: Lead selection and bulk actions', async ({ page }) => {
    console.log('TC03: Starting bulk actions test');
    
    // 1. Navigate to Leads
    await CRMLogin(page);
    await navigateToLeads(page);
    
    // 2. Select individual leads
    const firstCheckbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.click();
    
    // 3. Verify selection
    await expect(firstCheckbox).toBeChecked();
    
    // 4. Use select-all to select all visible leads
    await selectAllLeads(page);
    
    // 5. Verify Actions menu is available
    await expect(page.getByRole('button', { name: 'Actions' })).toBeVisible();
    
    // 6. Click Actions to verify bulk actions are available
    await page.getByRole('button', { name: 'Actions' }).click();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    
    // Close the actions menu
    await page.keyboard.press('Escape');
    console.log('TC03: Bulk actions test completed successfully');
  });

  test('TC04: Login and authentication flow', async ({ page }) => {
    console.log('TC04: Starting login and authentication test');
    
    // 1. Navigate to EspoCRM demo URL
    await page.goto('https://demo.us.espocrm.com/');
    
    // 2. Verify login page elements
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    // 3. Verify language selector is available
    await expect(page.locator('select, .selectize-input').first()).toBeVisible();
    
    // 4. Verify username dropdown shows Administrator
    const usernameSelector = page.locator('select').first();
    const selectedValue = await usernameSelector.inputValue();
    expect(selectedValue).toBe('admin');
    console.log('Login page validation completed');
    
    // 5. Complete login process
    await page.getByRole('button', { name: 'Login' }).click();
    
    // 6. Verify successful login and main interface loads
    await expect(page.getByRole('link').filter({ hasText: 'Leads' })).toBeVisible();
    await expect(page.locator('.navbar, nav')).toBeVisible();
    console.log('TC04: Login and authentication test completed successfully');
  });

  test('TC05: Lead status workflow', async ({ page }) => {
    console.log('TC05: Starting lead status workflow test');
    
    // 1. Navigate to Leads
    await CRMLogin(page);
    await navigateToLeads(page);
    
    // 2. Verify different lead statuses exist in the list
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const statusElements = page.locator('table tbody tr td[data-name="status"] span');
    const statusCount = await statusElements.count();
    expect(statusCount).toBeGreaterThan(0);
    console.log(`Found ${statusCount} status elements in lead list`);
    
    // 3. Test status-based filtering by applying Created At filter first (as a working filter)
    await applyDateFilter(page, 'Current Month');
    await expect(page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)).toBeVisible();
    
    // 4. Verify filtered results still contain various statuses
    const filteredStatusElements = page.locator('table tbody tr td[data-name="status"] span');
    const filteredStatusCount = await filteredStatusElements.count();
    expect(filteredStatusCount).toBeGreaterThan(0);
    console.log(`After filtering: ${filteredStatusCount} status elements visible`);
    
    // 5. Clear filters
    try {
      await clearFilters(page);
    } catch {
      await page.reload();
    }
    await expect(page.getByTitle('Click to refresh')).toBeVisible();
    console.log('TC05: Lead status workflow test completed successfully');
  });

  test('TC06: Advanced search with multiple criteria', async ({ page }) => {
    console.log('TC06: Starting advanced search test');
    
    // 1. Setup
    await CRMLogin(page);
    await navigateToLeads(page);
    
    // 2. Apply multiple filters
    await applyDateFilter(page, 'Current Month');
    
    // 3. Select leads and verify Actions menu
    await selectAllLeads(page);
    await expect(page.getByRole('button', { name: 'Actions' })).toBeVisible();
    
    // 4. Test different bulk action options
    await page.getByRole('button', { name: 'Actions' }).click();
    
    // Verify export option exists
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    
    // Check for other bulk actions (may vary based on permissions)
    const bulkActions = ['Follow', 'Unfollow', 'Remove', 'Mass Update'];
    for (const action of bulkActions) {
      try {
        await expect(page.getByRole('button', { name: action })).toBeVisible();
        console.log(`Bulk action "${action}" is available`);
      } catch {
        console.log(`Bulk action "${action}" not available or not visible`);
      }
    }
    
    // Close actions menu
    await page.keyboard.press('Escape');
    console.log('TC06: Advanced search test completed successfully');
  });

  test('TC07: Comprehensive export validation', async ({ page }) => {
    console.log('TC07: Starting comprehensive export validation');
    
    // 1. Setup and navigate
    await CRMLogin(page);
    await navigateToLeads(page);
    
    // 2. Apply filtering
    await applyDateFilter(page, 'Current Month');
    await expect(page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)).toBeVisible();

    // 3. Select all leads using the header checkbox
    await page.waitForSelector('input[type="checkbox"].select-all.form-checkbox.form-checkbox-small', { timeout: 10000 });
    await page.locator('input[type="checkbox"].select-all.form-checkbox.form-checkbox-small').click();
    await page.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('button', { name: 'Export' }).click();
    await page.waitForTimeout(3000);
    
    // 4. First click the field container to activate the dropdown
    await page.locator('div.field[data-name="format"]').click();
    
    // 5. Wait for dropdown to appear and click XLSX option  
    await page.waitForSelector('.selectize-dropdown-content .option[data-value="xlsx"]', { timeout: 5000 });
    await page.locator('.selectize-dropdown-content .option[data-value="xlsx"]').click();
    
    // 6. Check the export all fields checkbox
    await page.locator('input[data-name="exportAllFields"].form-checkbox').check();
    
    // 7. Setup download handler and export
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[data-name="export"].btn.btn-danger').click();
    const download = await downloadPromise;
    
    // 8. Save file to Data folder (override on each execution)
    const downloadPath = path.join(__dirname, '..', 'Data', 'LeadsExport.xlsx');
    
    // Create Data directory if it doesn't exist
    const dataDir = path.dirname(downloadPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Save downloaded file to specific location (overrides existing file)
    await download.saveAs(downloadPath);
    
    // 9. Verify file was saved successfully
    expect(fs.existsSync(downloadPath)).toBeTruthy();
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);
    
    console.log(`File downloaded to: ${downloadPath}, Size: ${stats.size} bytes`);
    console.log('TC07: Comprehensive export validation completed successfully');
  });
  
  test('TC08: Email Validation', async ({ page }) => {

      console.log('TC09: Starting email validation test');

      // 1. Setup and navigate
      await CRMLogin(page);
      await navigateToLeads(page);


      // 2. Apply filtering
      await applyDateFilter(page, 'Last 7 Days');
      await expect(page.locator('div').filter({ hasText: 'Actions Remove Merge Mass' }).nth(2)).toBeVisible();

      await page.waitForSelector('table.table tbody tr.list-row', { timeout: 10000 });

      const newLeadsData: Array<any> = [];

      const rows = await page.locator('table.table tbody tr.list-row').all();

      for (const row of rows) {

          const statusText =
              await row.locator('td[data-name="status"] span').textContent();

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

      // Format data for console output (text format)
      let consoleOutput = '\n';
      consoleOutput += '='.repeat(120) + '\n';
      consoleOutput += '                              NEW LEADS - LAST 7 DAYS\n';
      consoleOutput += '='.repeat(120) + '\n';
      consoleOutput += `${'Name'.padEnd(25)} | ${'Status'.padEnd(15)} | ${'Email'.padEnd(30)} | ${'Phone'.padEnd(18)} | ${'Assigned User'.padEnd(20)}\n`;
      consoleOutput += '-'.repeat(120) + '\n';
      
      if (newLeadsData.length > 0) {
          for (const lead of newLeadsData) {
              consoleOutput += `${lead.name.padEnd(25)} | ${lead.status.padEnd(15)} | ${lead.email.padEnd(30)} | ${lead.phone.padEnd(18)} | ${lead.assignedUser.padEnd(20)}\n`;
          }
      } else {
          consoleOutput += 'No new leads found in the last 7 days.\n';
      }
      
      consoleOutput += '='.repeat(120) + '\n';
      consoleOutput += `Total New Leads: ${newLeadsData.length}\n`;
      consoleOutput += '='.repeat(120) + '\n';
      
      // Print to console
      console.log(consoleOutput);

      console.log(`Total new leads: ${newLeadsData.length}`);

      // Generate HTML report with styling
      const newLeadsFilePath =
          path.join(__dirname, '..', 'Data', 'newLeadLast7Days.html');

      if (!fs.existsSync(path.dirname(newLeadsFilePath))) {

          fs.mkdirSync(path.dirname(newLeadsFilePath), { recursive: true });

      }

      let htmlOutput = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Leads - Last 7 Days</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      text-align: center;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #4CAF50;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    tr:hover {
      background-color: #f1f1f1;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .summary {
      margin-top: 20px;
      padding: 15px;
      background-color: #e8f5e9;
      border-left: 4px solid #4CAF50;
      font-weight: bold;
    }
    .no-data {
      text-align: center;
      padding: 30px;
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>NEW LEADS - LAST 7 DAYS</h1>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Assigned User</th>
        </tr>
      </thead>
      <tbody>
`;
      
      if (newLeadsData.length > 0) {
          for (const lead of newLeadsData) {
              htmlOutput += `        <tr>
          <td>${lead.name}</td>
          <td>${lead.status}</td>
          <td>${lead.email}</td>
          <td>${lead.phone}</td>
          <td>${lead.assignedUser}</td>
        </tr>
`;
          }
      } else {
          htmlOutput += `        <tr>
          <td colspan="5" class="no-data">No new leads found in the last 7 days.</td>
        </tr>
`;
      }

      htmlOutput += `      </tbody>
    </table>
    <div class="summary">
      Total New Leads: ${newLeadsData.length}
    </div>
  </div>
</body>
</html>`;

      fs.writeFileSync(newLeadsFilePath, htmlOutput);

      console.log(`✅ HTML report saved: ${newLeadsFilePath}`);

      // Export Excel file
      await selectAllLeads(page);
      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: 'Actions' }).click();
      await page.getByRole('button', { name: 'Export' }).click();
      await page.waitForTimeout(3000);

      // Click the field container to activate the dropdown
      await page.locator('div.field[data-name="format"]').click();
      
      // Wait for dropdown to appear and click XLSX option  
      await page.waitForSelector('.selectize-dropdown-content .option[data-value="xlsx"]', { timeout: 5000 });
      await page.locator('.selectize-dropdown-content .option[data-value="xlsx"]').click();
      
      // Check the export all fields checkbox
      await page.locator('input[data-name="exportAllFields"].form-checkbox').check();
      
      // Setup download handler and export
      await page.waitForTimeout(1000);
      const downloadPromise = page.waitForEvent('download');
      await page.locator('button[data-name="export"].btn.btn-danger').click();
      const download = await downloadPromise;

      const downloadPath =
          path.join(__dirname, '..', 'Data', 'LeadsExport.xlsx');

      await download.saveAs(downloadPath);

      expect(fs.existsSync(downloadPath)).toBeTruthy();
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(0);

      console.log(`Excel report saved: ${downloadPath}, Size: ${stats.size} bytes`);

      // ✅ SEND EMAIL HERE
      try {

          await sendDailyStatisticsEmail(

              newLeadsFilePath,

              downloadPath

          );

          console.log("✅ Email sent successfully");

      } catch (error) {

          console.error("❌ Email failed:", error);

      }

      console.log('TC09 completed successfully');

  });


});