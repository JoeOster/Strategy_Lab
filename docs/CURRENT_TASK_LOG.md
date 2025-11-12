# Task: Refactor Settings Module into "Conductor" Pattern

**Goal:** Break up the monolithic `settings/handlers.js` and `settings/api.js`
files into new sub-module files, as defined in the "Conductor Module" Pattern.

- [ ] **Step 1: Refactor "Advice Sources" Logic**
  - [ ] Create `public/js/modules/settings/sources.api.js`.
  - [ ] Move `getSources`, `addSource`, and `deleteSource` from
        `settings/api.js` to `settings/sources.api.js`.
  - [ ] Create `public/js/modules/settings/sources.handlers.js`.
  - [ ] Move `handleAddNewSourceSubmit`, `handleSourceTypeChange`,
        `loadSourcesList`, `handleEditSourceClick`, and
        `handleDeleteSourceClick` from `settings/handlers.js` to
        `settings/sources.handlers.js`.
  - [ ] Update `settings/sources.handlers.js` to import from `./sources.api.js`
        instead of `./api.js`.
  - [ ] Update `settings/index.js` to import from `./sources.handlers.js` and
        verify all listeners are re-attached correctly.

- [ ] **Step 2: Refactor "Account Holders (Users)" Logic**
  - [ ] Create `public/js/modules/settings/users.api.js`.
  - [ ] Move `addHolder`, `deleteHolder`, and `getAccountHolders` from
        `settings/api.js` to `settings/users.api.js`.
  - [ ] Create `public/js/modules/settings/users.handlers.js`.
  - [ ] Move `handleAddHolderSubmit`, `loadAccountHoldersList`,
        `handleSetDefaultHolderClick`, `handleManageSubscriptionsClick`, and
        `handleDeleteHolderClick` from `settings/handlers.js` to
        `settings/users.handlers.js`.
  - [ ] Update `settings/users.handlers.js` to import from `./users.api.js`.
  - [ ] Update `settings/index.js` to import from `./users.handlers.js` and
        verify listeners are re-attached.

- [ ] **Step 3: Refactor "Appearance" Logic**
  - [ ] Create `public/js/modules/settings/appearance.handlers.js`.
  - [ ] Move `loadAppearanceSettings`, `handleThemeChange`, and
        `handleFontChange` from `settings/handlers.js` to
        `settings/appearance.handlers.js`.
  - [ ] Update `settings/index.js` to import from `./appearance.handlers.js`.
  - [ ] In `settings/handlers.js`, update `handleMainTabClick` to call
        `loadAppearanceSettings` (it should now import from
        `./appearance.handlers.js`).

- [ ] **Step 4: Cleanup Conductor Files**
  - [ ] Review `settings/handlers.js`. It should now only contain main "shell"
        functions: `handleMainTabClick`, `initializeSubTabs`,
        `handleSubTabClick`, `handleCloseModal`, and `handleSaveAllSettings`.
  - [ ] Review `settings/api.js`. It should now be empty.
  - [ ] Delete `public/js/modules/settings/api.js`.

- [ ] **Step 5: Verification**
  - [ ] Run `npm run test:e2e` to confirm that all Settings tests (especially
        the L2 sub-tab switching and delete tests) still pass.
