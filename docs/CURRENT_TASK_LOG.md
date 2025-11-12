# Task: Implement Clear Buttons and Refine Save Button Behavior in Settings

## Phase 1: Implement Clear Buttons for Settings Forms

- [x] **Step 1: Identify Forms and Add Clear Buttons to HTML.**
  - [ ] Locate the forms within `public/index.html` that have "Save" buttons and
        require a "Clear" button (e.g., `#add-new-source-form`,
        `#add-exchange-form`, `#add-holder-form`).
  - [ ] For each identified form, add a "Clear" button next to its "Save"
        button. Assign appropriate IDs or classes for easy selection in
        JavaScript.

- [x] **Step 2: Implement Clear Button Handlers in `handlers.js`.**
  - [ ] In `public/js/modules/settings/handlers.js`, create new functions (e.g.,
        `handleClearSourceForm()`, `handleClearExchangeForm()`,
        `handleClearHolderForm()`) to clear the input fields of their respective
        forms.
  - [ ] These functions should reset the form fields to their initial empty or
        default states.

- [x] **Step 3: Attach Event Listeners for Clear Buttons in `index.js`.**
  - [ ] In `public/js/modules/settings/index.js`, attach event listeners to the
        newly added "Clear" buttons, linking them to their respective handler
        functions.

## Phase 2: Refine Save Button Behavior

- [x] **Step 4: Remove Dashboard Navigation from Save Handlers.**
  - [ ] In `public/js/modules/settings/handlers.js`, identify functions
        responsible for handling "Save" button clicks (e.g.,
        `handleAddSource()`, `handleAddExchange()`, `handleAddHolder()`).
  - [ ] Remove any code within these functions that navigates the user away from
        the settings modal (e.g., to the dashboard).

- [x] **Step 5: Implement Table Refresh after Save Operations.**
  - [ ] After a successful save operation in each handler function (e.g.,
        `handleAddSource()`, `handleAddExchange()`, `handleAddHolder()`), call
        the appropriate data loading function to refresh the relevant table/list
        within the settings modal (e.g., `loadSourcesList()`,
        `loadExchangesList()`, `loadAccountHoldersList()`).
  - [ ] Ensure that the form fields are cleared after a successful save.

## Phase 3: Testing and Verification

- [ ] **Step 6: Manually Test Clear Button Functionality.**
  - [ ] Open the application, navigate to the Settings modal, and test each
        "Clear" button to ensure it correctly flushes new entries in its
        respective form.

- [ ] **Step 7: Manually Test Save Button Functionality.**
  - [ ] Test each "Save" button to ensure it saves data, refreshes the relevant
        table/list within the settings modal, and does NOT navigate to the
        dashboard.
  - [ ] Verify that form fields are cleared after a successful save.

- [ ] **Step 8: Update Playwright Tests (if necessary).**
  - [ ] Review `tests/settings.spec.js` and update or add new tests to cover the
        new "Clear" button functionality and the refined "Save" button behavior.
