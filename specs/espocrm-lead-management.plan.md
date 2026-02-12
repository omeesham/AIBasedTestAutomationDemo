# EspoCRM Lead Management Test Plan

## Application Overview

A comprehensive test plan for EspoCRM's lead management functionality including lead list filtering, selection, and export features. The application includes various modules like Leads, Accounts, Contacts, Opportunities, and more with robust filtering and export capabilities.

## Test Scenarios

### 1. Lead Export Functionality

**Seed:** `tests/seed.spec.ts`

#### 1.1. Export leads with date filtering to CSV

**File:** `tests/leads/export-leads-csv.spec.ts`

**Steps:**
  1. Navigate to EspoCRM demo application
    - expect: Page loads successfully
    - expect: Login page is displayed
  2. Click Login button to authenticate
    - expect: User is successfully logged in
    - expect: Main dashboard navigation is visible
    - expect: Leads link is accessible
  3. Click on 'Leads' link in the main navigation
    - expect: Leads module opens
    - expect: Lead list page displays
    - expect: Refresh button is visible
    - expect: Lead data table is loaded
  4. Click on the advanced filter button to access search filters
    - expect: Filter dropdown opens
    - expect: 'Add Field' option is available
    - expect: Various filter fields like 'Created At', 'Status', 'Assigned User' are displayed
  5. Select 'Created At' filter from the dropdown
    - expect: Created At filter is added
    - expect: Default 'Last 7 Days' filter is displayed
    - expect: Date range selector is available
  6. Click on the date range selector and change from 'Last 7 Days' to 'Current Month'
    - expect: Date range dropdown opens
    - expect: 'Current Month' option is visible and selectable
    - expect: Date range changes to 'Current Month'
  7. Click Apply button to apply the date filter
    - expect: Filter is applied to the lead list
    - expect: Lead list refreshes with filtered results
    - expect: Current Month filter is active
  8. Click the select-all checkbox in the table header to select all filtered leads
    - expect: All visible lead checkboxes are selected
    - expect: Actions button becomes available
    - expect: Selection count is displayed
  9. Click the 'Actions' button to open the actions menu
    - expect: Actions dropdown opens
    - expect: Export option is visible
    - expect: Other options like Remove, Merge, Mass Update are available
  10. Click 'Export' from the actions menu
    - expect: Export dialog opens
    - expect: Format selection dropdown shows 'XLSX · Spreadsheet' by default
    - expect: 'Export all fields' checkbox is available
    - expect: Field list is displayed
  11. Click on the format dropdown to change export format
    - expect: Format dropdown opens
    - expect: CSV option is available
    - expect: XLSX option is visible
  12. Select CSV format from the dropdown
    - expect: CSV format is selected
    - expect: Format dropdown shows CSV as selected
  13. Check the 'Export all fields' checkbox
    - expect: Export all fields option is enabled
    - expect: All available fields will be included in export
  14. Click the Export button to download the file
    - expect: Download starts
    - expect: CSV file is downloaded
    - expect: File contains filtered lead data
    - expect: Export dialog closes

#### 1.2. Export leads with status filtering to XLSX

**File:** `tests/leads/export-leads-xlsx-status-filter.spec.ts`

**Steps:**
  1. Login and navigate to Leads module
    - expect: Leads list page is displayed
  2. Apply Status filter and select specific status values (e.g., 'New', 'In Process')
    - expect: Status filter is applied
    - expect: Lead list shows only leads with selected statuses
  3. Select all filtered leads and export as XLSX
    - expect: XLSX file is downloaded
    - expect: Contains only leads with selected status

### 2. Lead List Management

**Seed:** `tests/seed.spec.ts`

#### 2.1. Search and filter leads by various criteria

**File:** `tests/leads/search-filter-leads.spec.ts`

**Steps:**
  1. Navigate to Leads module
    - expect: Lead list is displayed with default data
  2. Use the quick search box to search for specific lead names
    - expect: Search results filter the lead list
    - expect: Matching leads are displayed
  3. Apply multiple filters: Assigned User, Email, Phone
    - expect: Multiple filters can be applied simultaneously
    - expect: Lead list updates based on all active filters
  4. Clear all filters and verify list returns to default
    - expect: All filters are removed
    - expect: Full lead list is restored

#### 2.2. Lead selection and bulk actions

**File:** `tests/leads/bulk-actions.spec.ts`

**Steps:**
  1. Select individual leads using checkboxes
    - expect: Individual leads are selected
    - expect: Selection count updates
  2. Use select-all to select all visible leads
    - expect: All leads on current page are selected
    - expect: Actions menu becomes available
  3. Test bulk actions: Follow, Unfollow, Mass Update
    - expect: Bulk actions are applied to selected leads
    - expect: Appropriate confirmation dialogs appear

### 3. Navigation and Module Access

**Seed:** `tests/seed.spec.ts`

#### 3.1. Verify access to all main modules

**File:** `tests/navigation/module-access.spec.ts`

**Steps:**
  1. Login and verify main navigation menu
    - expect: All main modules are accessible: Home, Accounts, Contacts, Leads, Opportunities, Emails, Calendar, Meetings, Calls, Tasks, Cases, Knowledge Base, Documents
  2. Click on each module link
    - expect: Each module loads correctly
    - expect: Module-specific functionality is available
  3. Verify expandable menu sections like 'Sales & Purchases'
    - expect: Expandable sections work properly
    - expect: Sub-modules are accessible

#### 3.2. Login and authentication flow

**File:** `tests/authentication/login.spec.ts`

**Steps:**
  1. Navigate to EspoCRM demo URL
    - expect: Login page loads
    - expect: Username dropdown shows 'Administrator'
    - expect: Language selector is available
  2. Verify language selection functionality
    - expect: Multiple language options are available
    - expect: Language can be changed
  3. Complete login process
    - expect: Login is successful
    - expect: Dashboard/main interface loads
    - expect: User session is established

### 4. Lead Data Management

**Seed:** `tests/seed.spec.ts`

#### 4.1. Create and manage leads

**File:** `tests/leads/create-manage-leads.spec.ts`

**Steps:**
  1. Click 'Create Lead' button in Leads module
    - expect: Lead creation form opens
    - expect: Required fields are displayed
    - expect: Form validation is present
  2. Fill out lead information and save
    - expect: Lead is created successfully
    - expect: New lead appears in list
    - expect: Lead detail page is accessible
  3. Edit existing lead information
    - expect: Lead edit form opens
    - expect: Changes can be saved
    - expect: Updated information is reflected in list

#### 4.2. Lead status workflow

**File:** `tests/leads/status-workflow.spec.ts`

**Steps:**
  1. Verify different lead statuses in the system
    - expect: Lead statuses include: New, Assigned, In Process, Converted, Recycled, Dead
  2. Test status change functionality
    - expect: Lead status can be updated
    - expect: Status changes are reflected in list view
    - expect: Status-based filtering works
