# Task: Implement Clear Buttons and Refine Save Button Behavior in Settings

## Phase 1: Implement Clear Buttons for Settings Forms

- [x] **Step 1: Identify Forms and Add Clear Buttons to HTML.**
  - [x] `#add-new-source-form`
  - [x] `#add-exchange-form`
  - [x] `#add-holder-form`
  - [x] `#edit-source-form`
  - [x] `#general-settings-form`
  - [x] For each identified form, add a "Clear" button next to its "Save"
        button. Assign appropriate IDs or classes for easy selection in
        JavaScript.

- [x] **Step 2: Implement Clear Button Handlers in `handlers.js`.**
  - [x] `handleClearNewSourceForm()` for `#add-new-source-form`
  - [x] `handleClearExchangeForm()` for `#add-exchange-form`
  - [x] `handleClearHolderForm()` for `#add-holder-form`
  - [x] `handleClearEditSourceForm()` for `#edit-source-form`
  - [x] `handleClearGeneralAndAppearanceForms()` for `#general-settings-form`
  - [x] These functions should reset the form fields to their initial empty or
        default states.

- [x] **Step 3: Attach Event Listeners for Clear Buttons in `index.js`.**
  - [x] `clearGeneralSettingsBtn` listener for
        `handleClearGeneralAndAppearanceForms`
  - [x] `clearNewSourceBtn` listener for `handleClearNewSourceForm`
  - [x] `clearExchangeBtn` listener for `handleClearExchangeForm`
  - [x] `clearHolderBtn` listener for `handleClearHolderForm`
  - [x] `clearEditSourceBtn` listener for `handleClearEditSourceForm`

## Phase 2: Refine Save Button Behavior

- [x] **Step 4: Remove Dashboard Navigation from Save Handlers.**
  - [x] `handleAddNewSourceSubmit()`
  - [x] `handleAddExchangeSubmit()`
  - [x] `handleAddHolderSubmit()`
  - [x] `handleEditSourceSubmit()`
  - [x] Remove any code within these functions that navigates the user away from
        the settings modal (e.g., to the dashboard).

- [x] **Step 5: Implement Table Refresh after Save Operations.**
  - [x] `handleAddNewSourceSubmit()`: Calls `form.reset()` and
        `loadSourcesList()`
  - [x] `handleAddExchangeSubmit()`: Calls `form.reset()` and
        `loadExchangesList()`
  - [x] `handleAddHolderSubmit()`: Calls `form.reset()` and
        `loadAccountHoldersList()`
  - [x] `handleEditSourceSubmit()`: Closes modal and calls `loadSourcesList()`
  - [x] Ensure that the form fields are cleared after a successful save.

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

- [x] **Step 8: Update Playwright Tests (if necessary).**
  - [ ] Review `tests/settings.spec.js` and update or add new tests to cover the
        new "Clear" button functionality and the refined "Save" button behavior.
