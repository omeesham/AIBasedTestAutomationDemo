# EspoCRM Lead Export Test Steps

## Test Objective
Export leads from EspoCRM as a CSV file with date filtering applied

## Test Steps

### 1. Navigate to Application
- Go to `https://demo.us.espocrm.com/`

### 2. Login
- Click the "Login" button
- Verify successful login by checking for Leads link visibility

### 3. Access Leads Module
- Click on "Leads" link in the navigation
- Wait for the page to load (verify refresh button is visible)

### 4. Apply Date Filter
- Click the search/filter button (3rd button)
- Click "Created At" filter button
- Change from "Last 7 Days" to "Current Month"
- Click "Apply" button
- Wait 2 seconds for filter to apply
- Verify the Actions menu is visible

### 5. Select All Leads
- Wait for the select-all checkbox to be available
- Click the select-all checkbox with classes: `select-all form-checkbox form-checkbox-small`

### 6. Initiate Export Process
- Click "Actions" button
- Click "Export" button
- Wait 3 seconds for export options to load

### 7. Configure Export Settings
- Click the format field container `div.field[data-name="format"]`
- Wait for dropdown content to appear
- Select CSV format by clicking `.selectize-dropdown-content .option[data-value="csv"]`

### 8. Select Export Options
- Check the "Export All Fields" checkbox `input[data-name="exportAllFields"].form-checkbox`

### 9. Execute Export
- Set up download event listener
- Click the Export button `button[data-name="export"].btn.btn-danger`
- Wait for download to complete
- Log the downloaded file path

## Expected Results
- CSV file should be downloaded successfully
- File should contain lead data filtered by current month
- Console should display the downloaded file path

## Key Locators Used

| Element | Locator |
|---------|---------|
| Select All Checkbox | `input[type="checkbox"].select-all.form-checkbox.form-checkbox-small` |
| Format Field | `div.field[data-name="format"]` |
| CSV Option | `.selectize-dropdown-content .option[data-value="csv"]` |
| Export All Fields | `input[data-name="exportAllFields"].form-checkbox` |
| Export Button | `button[data-name="export"].btn.btn-danger` |

## Test Environment
- **Application**: EspoCRM Demo
- **URL**: https://demo.us.espocrm.com/
- **Browser**: Chromium (via Playwright)
- **Test Framework**: Playwright with TypeScript