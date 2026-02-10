# EspoCRM Opportunities Management Test Plan

## Application Overview

This test plan covers comprehensive testing of the EspoCRM demo application's Opportunities Management functionality. The application is a Customer Relationship Management (CRM) system that allows users to manage sales opportunities through various stages from prospecting to closure. The system includes features for creating opportunities, managing items/products, tracking opportunity stages in a Kanban-style board, search functionality, and detailed opportunity views with related activities and tasks.

## Test Scenarios

### 1. EspoCRM Opportunities Management

**Seed:** `tests/seed.spec.ts`

#### 1.1. User Login and Navigation to Opportunities

**File:** `tests/espocrm-opportunities/user-login-navigation.spec.ts`

**Steps:**
  1. Navigate to the EspoCRM demo application at https://demo.us.espocrm.com/
    - expect: Page loads successfully
    - expect: Login form is displayed
    - expect: Username field is pre-populated with 'Administrator'
    - expect: Language selector shows 'English (US)' by default
    - expect: Login button is visible and clickable
  2. Click the Login button without entering any credentials
    - expect: User is successfully logged into the CRM application
    - expect: Dashboard is displayed with navigation menu
    - expect: Various CRM modules are visible (Home, Accounts, Contacts, Leads, Opportunities, etc.)
    - expect: User can see calendar, activities, and cases widgets on dashboard
  3. Click on 'Opportunities' in the navigation menu
    - expect: Opportunities page loads successfully
    - expect: Page title changes to 'Opportunities'
    - expect: Opportunities heading is displayed
    - expect: Create Opportunity button is visible
    - expect: Kanban board with opportunity stages is shown (Prospecting, Qualification, Proposal, Negotiation, Closed Won)
    - expect: Existing opportunities are displayed in their respective stages

#### 1.2. Opportunities Page Validation and Display

**File:** `tests/espocrm-opportunities/opportunities-page-validation.spec.ts`

**Steps:**
  1. Verify the Opportunities page layout and elements
    - expect: Opportunities heading with refresh icon is displayed
    - expect: '+ Create Opportunity' button is prominently shown
    - expect: Search functionality with search box is available
    - expect: Filter options ('All' button and additional filter controls) are present
    - expect: Kanban board structure with 5 stages is visible
    - expect: Stage columns show: Prospecting, Qualification, Proposal, Negotiation, Closed Won
    - expect: Total opportunity count (42) is displayed
    - expect: Opportunities are properly distributed across different stages
  2. Examine existing opportunities in each stage
    - expect: Prospecting stage shows multiple opportunities with details like '15 Tablets Purchase $2,250.00', 'Laptop Bulk Purchase & Installation $61,250.00'
    - expect: Each opportunity displays: Name, Amount, Associated Account, Date
    - expect: Opportunities show proper formatting for currency amounts
    - expect: Account names are clickable links
    - expect: Dates are properly formatted
    - expect: 'Show more' options are available where applicable
  3. Test responsive behavior and visual elements
    - expect: Kanban board columns are properly aligned
    - expect: Opportunity cards are clearly readable
    - expect: Currency amounts are properly formatted with $ symbols
    - expect: Company/Account icons are displayed where applicable
    - expect: Hover effects work on clickable elements

#### 1.3. End-to-End Opportunity Management Flow

**File:** `tests/espocrm-opportunities/e2e-opportunity-complete-workflow.spec.ts`

**Description:** This comprehensive E2E test validates the complete user journey for opportunity management including creation, validation, search, modification, and verification across multiple application areas.

**Steps:**
  1. **Application Access and Authentication**
     - Navigate to https://demo.us.espocrm.com/
     - expect: EspoCRM demo login page loads successfully
     - expect: Login form displays with pre-populated Administrator username
     - Click Login button
     - expect: Successful authentication and dashboard display
     - expect: Navigation menu shows all CRM modules including Opportunities

  2. **Navigate to Opportunities and Validate Initial State**
     - Click 'Opportunities' in the navigation menu
     - expect: Opportunities page loads with title 'Opportunities'
     - expect: Kanban board displays with 5 stages (Prospecting, Qualification, Proposal, Negotiation, Closed Won)
     - expect: Initial opportunity count shows 42 total opportunities
     - expect: Create Opportunity button is visible and accessible
     - Store initial Prospecting stage count for later verification

  3. **Create New Opportunity with Complete Details**
     - Click '+ Create Opportunity' button
     - expect: Create Opportunity form opens with proper navigation breadcrumb
     - Fill in opportunity details:
       - Name: 'E2E Test - Advanced CRM Solution Q1 2026'
       - Amount: '45000'
       - Close Date: '2026-03-31' (using date picker)
       - Lead Source: 'Web Site'
       - Description: 'Comprehensive CRM solution for enterprise client - E2E automated test'
     - expect: All form fields accept data correctly
     - expect: Amount displays with proper currency formatting ($45,000.00)
     - expect: Stage defaults to 'Prospecting' and Probability to '10%'

  4. **Add Multiple Items to Opportunity**
     - Click '+' to add first item
     - Fill item details: Name='CRM Software Licenses', Quantity='5', Unit Price='7000'
     - expect: Item amount calculates correctly to $35,000.00
     - Add second item: Name='Implementation Services', Quantity='1', Unit Price='10000'
     - expect: Second item amount shows $10,000.00
     - expect: Total opportunity amount updates to $45,000.00
     - expect: Items table displays all information correctly

  5. **Save Opportunity and Validate Creation**
     - Click 'Save' button
     - expect: Form validation passes without errors
     - expect: Opportunity saves successfully
     - expect: Redirect to opportunity detail page
     - expect: Page title shows 'E2E Test - Advanced CRM Solution Q1 2026'
     - expect: Breadcrumb navigation shows 'Opportunities › [Opportunity Name]'

  6. **Verify Opportunity Details in Detail View**
     - Validate all entered information displays correctly:
       - expect: Name shows 'E2E Test - Advanced CRM Solution Q1 2026'
       - expect: Amount displays '$45,000.00'
       - expect: Stage shows 'Prospecting'
       - expect: Close Date shows 'Mar 31, 2026'
       - expect: Description contains the entered text
     - Verify Items section:
       - expect: Two items listed with correct quantities and prices
       - expect: Total amounts calculated correctly
       - expect: Items table formatted properly
     - Check activity stream:
       - expect: Creation entry logged with timestamp
       - expect: Assigned user information displayed

  7. **Return to Opportunities List and Verify Addition**
     - Click 'Opportunities' in breadcrumb navigation
     - expect: Return to main opportunities page
     - expect: Total count increased by 1 (now 43)
     - expect: Prospecting stage count increased by 1
     - Locate newly created opportunity in Prospecting column
     - expect: New opportunity visible with correct name and amount

  8. **Test Search Functionality with New Opportunity**
     - Use search box to search for 'E2E Test'
     - expect: Search filters results to show only matching opportunities
     - expect: Created opportunity appears in search results
     - expect: Search result count shows 1
     - expect: Opportunity displays with all key information (name, amount, date)
     - Clear search to return to full list
     - expect: All 43 opportunities visible again

  9. **Edit and Modify the Created Opportunity**
     - Click on the newly created opportunity from list
     - Click 'Edit' button on detail page
     - expect: Edit form opens with all current data pre-populated
     - Modify opportunity:
       - Update Amount to '50000'
       - Change Probability to '25%'
       - Add third item: Name='Training Services', Quantity='2', Unit Price='2500'
     - expect: Amount recalculates to $50,000.00
     - Save changes
     - expect: Updates save successfully
     - expect: Detail view reflects all changes

  10. **Verify Data Persistence and Final State**
      - Navigate away to Dashboard then back to Opportunities
      - expect: Opportunity count remains at 43
      - Search for and open the test opportunity
      - expect: All modifications persist correctly
      - expect: Amount shows updated $50,000.00
      - expect: Probability shows 25%
      - expect: Three items listed with correct details
      - expect: Activity stream shows edit history
      
  11. **Cross-Module Navigation Validation**
      - From opportunity detail, test related links:
      - expect: User profile links are clickable
      - expect: Navigation breadcrumbs function properly
      - expect: Return to opportunities list maintains proper state
      - Test main navigation menu accessibility
      - expect: Can navigate to other CRM modules and return

  12. **Clean-Up Verification (Optional)**
      - Verify the test opportunity can be deleted (if delete functionality available)
      - Or document the test opportunity name for manual cleanup
      - expect: System handles cleanup operations gracefully
      - expect: Opportunity counts update accordingly after deletion

#### 1.4. Create Opportunity - Validation and Error Handling

**File:** `tests/espocrm-opportunities/create-opportunity-validation.spec.ts`

**Steps:**
  1. Open Create Opportunity form and attempt to save without filling required fields
    - expect: Form prevents submission
    - expect: Validation error messages appear for required fields
    - expect: Error tooltips show: 'Name is required', 'Close Date is required', 'Amount is required'
    - expect: Form fields are highlighted to indicate errors
    - expect: 'Not valid' message is displayed
  2. Fill only the Name field and attempt to save
    - expect: Form still prevents submission
    - expect: Validation errors persist for missing required fields (Amount, Close Date)
    - expect: Name field validation error is resolved
    - expect: Other required field errors remain visible
  3. Test invalid data entry: Enter past date in Close Date field
    - expect: System either prevents past date selection in date picker OR shows validation error for past dates
    - expect: Appropriate error message is displayed
    - expect: Form submission is blocked until valid date is entered
  4. Test amount field with invalid data: Enter negative number or non-numeric characters
    - expect: Amount field validates numeric input
    - expect: Negative values are either prevented or show appropriate error
    - expect: Non-numeric characters are rejected
    - expect: Proper error messaging guides user to correct input
  5. Add items without required item details and attempt to save
    - expect: Item validation prevents saving with incomplete item information
    - expect: Error messages appear for required item fields
    - expect: Unit price validation shows 'Unit Price is required' error
    - expect: Item table highlights incomplete rows
  6. Cancel opportunity creation using Cancel button
    - expect: Form is closed without saving data
    - expect: User returns to Opportunities list page
    - expect: No opportunity is created
    - expect: No error messages persist

#### 1.5. Opportunity Search Functionality

**File:** `tests/espocrm-opportunities/opportunity-search.spec.ts`

**Steps:**
  1. Use the search box to search for existing opportunity '15 Tablets'
    - expect: Search box accepts text input
    - expect: Search can be executed by pressing Enter
    - expect: Search results filter the opportunities list
    - expect: Only matching opportunities are displayed
    - expect: Search results show '15 Tablets Purchase' opportunity
    - expect: Result count updates to show filtered results (1 result)
    - expect: Kanban board structure is maintained but only shows matching opportunities
  2. Test search with partial match terms
    - expect: Partial text searches return relevant results
    - expect: Search is case-insensitive
    - expect: Multiple opportunities matching the search term are displayed
    - expect: Search highlighting or indication shows matched terms
  3. Test search with no results
    - expect: Search for non-existent terms shows empty results
    - expect: Appropriate 'No results found' message or empty state is displayed
    - expect: Search box retains the search term
    - expect: User can easily clear search to return to full list
  4. Clear search and return to full opportunities list
    - expect: Full opportunities list is restored
    - expect: All opportunity stages and items are visible again
    - expect: Total count returns to original number (42)
    - expect: Kanban board shows all opportunities in their respective stages
  5. Test search functionality with various search terms like company names, amounts, or dates
    - expect: Search works across different opportunity fields
    - expect: Company/Account name searches return relevant opportunities
    - expect: Search results are accurate and relevant
    - expect: Performance is acceptable for search operations

#### 1.6. Opportunity Details View and Validation

**File:** `tests/espocrm-opportunities/opportunity-details-validation.spec.ts`

**Steps:**
  1. Click on an existing opportunity from the search results (e.g., '15 Tablets Purchase')
    - expect: Opportunity detail page loads successfully
    - expect: Page title shows the opportunity name
    - expect: Breadcrumb navigation shows 'Opportunities › [Opportunity Name]'
    - expect: All opportunity details are clearly displayed
    - expect: Edit button and action dropdown are available
  2. Validate opportunity information display
    - expect: Name field shows '15 Tablets Purchase'
    - expect: Account shows 'Janeville' as clickable link
    - expect: Stage displays 'Prospecting' with appropriate visual indicator
    - expect: Amount shows '$2,250.00' with proper currency formatting
    - expect: Probability shows '10%'
    - expect: Close Date shows 'Feb 04' in readable format
    - expect: Contact information shows 'Roxanne Beaulieu' as Evaluator
    - expect: Lead Source shows 'Call'
    - expect: Description field is present (shows 'None' if empty)
  3. Examine the Items section in detail view
    - expect: Items section displays a properly formatted table
    - expect: Table headers show: Name, Qty, List Price, Unit Price, Amount
    - expect: Item details show: 'EasyType HD10 Tablet', Quantity '15', Unit Price '150.00', Total Amount '2,250.00'
    - expect: Product name is clickable link to product details
    - expect: Quantities and pricing are properly formatted
    - expect: Currency formatting is consistent
  4. Review additional sections and related information
    - expect: Stream/Activity section shows creation and update history
    - expect: Activity entries show user actions with timestamps
    - expect: Created and Modified information displays user and date
    - expect: Assigned User section shows 'Jack Adams' with avatar
    - expect: Teams section shows assignment (or None if not assigned)
    - expect: Related sections show: Tasks, Documents, Quotes (may show 'No Data' if empty)
    - expect: Tasks section shows related task 'Prepare product presentation' with status
  5. Test navigation and interactive elements
    - expect: Account link ('Janeville') is clickable and navigates to account details
    - expect: Contact link ('Roxanne Beaulieu') is clickable
    - expect: Product link ('EasyType HD10 Tablet') is clickable
    - expect: User links are functional
    - expect: Activity timestamps are clickable for detailed views
    - expect: Navigation breadcrumbs work properly for returning to opportunities list

#### 1.7. Opportunity Management Edge Cases and Error Scenarios

**File:** `tests/espocrm-opportunities/opportunity-edge-cases.spec.ts`

**Steps:**
  1. Test opportunity creation with maximum length data in text fields
    - expect: System handles long opportunity names appropriately
    - expect: Field length limits are enforced or handled gracefully
    - expect: Long descriptions are properly stored and displayed
    - expect: UI remains functional with long text content
  2. Test opportunity creation with special characters and unicode
    - expect: Special characters in opportunity names are handled correctly
    - expect: Unicode characters are properly supported
    - expect: Opportunity names with symbols, accents, or international characters work
    - expect: Data integrity is maintained for various character sets
  3. Test concurrent user scenarios (if applicable)
    - expect: System handles multiple users creating opportunities simultaneously
    - expect: Data consistency is maintained
    - expect: No conflicts occur when multiple users access the same opportunity
    - expect: Changes are properly synchronized across user sessions
  4. Test opportunity creation with very large monetary amounts
    - expect: System handles large currency amounts appropriately
    - expect: Currency formatting works for large numbers
    - expect: Mathematical calculations remain accurate
    - expect: Display formatting handles various number lengths
  5. Test system behavior with network interruptions during save
    - expect: System provides appropriate feedback for network issues
    - expect: Data is not lost during save operations
    - expect: User receives clear error messages for failed operations
    - expect: Recovery options are available for incomplete operations

#### 1.8. Opportunity Data Integrity and Business Rules

**File:** `tests/espocrm-opportunities/opportunity-business-rules.spec.ts`

**Steps:**
  1. Test stage progression and business logic
    - expect: Opportunities can be moved between stages appropriately
    - expect: Stage changes are tracked in activity history
    - expect: Business rules for stage transitions are enforced
    - expect: Probability percentages align with stage expectations
  2. Validate item calculations and totals
    - expect: Item amount calculations are mathematically correct (Quantity × Unit Price)
    - expect: Opportunity total amount reflects sum of all items
    - expect: Currency conversions work if multiple currencies are supported
    - expect: Rounding rules are applied consistently
  3. Test date validations and constraints
    - expect: Close dates must be valid future dates
    - expect: Date formatting is consistent across the application
    - expect: Date picker prevents invalid date selections
    - expect: Date fields handle timezone considerations appropriately
  4. Verify data persistence and retrieval
    - expect: Saved opportunities persist correctly in the database
    - expect: All entered information is accurately stored and retrieved
    - expect: Search functionality finds opportunities based on all searchable fields
    - expect: Data integrity is maintained across sessions
  5. Test required field enforcement across different scenarios
    - expect: Required field validation is consistent across create and edit operations
    - expect: System prevents data loss by enforcing required fields
    - expect: Field requirements are clearly communicated to users
    - expect: Validation rules are applied consistently
