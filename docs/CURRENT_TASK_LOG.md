# Task: Refactor Modals to a Reusable System

This document outlines the plan for refactoring the existing modals into a single, reusable modal system.

## Plan

1.  **Create Generic Modal Shell**
    -   [x] Add a generic modal container to `public/index.html`.
    -   [x] The modal will have placeholders for the title, body, and footer.
    -   [x] The modal will be hidden by default.

2.  **Create `modal.js` Service**
    -   [x] Create a new file: `public/js/services/modal.js`.
    -   [x] Export `showModal` and `hideModal` functions.
    -   [x] `showModal` will accept `title`, `body` content, and an array of `actions` for the footer buttons.
    -   [x] `hideModal` will hide the modal and clear its content.
    -   [x] The module will handle closing the modal via the 'X' button and background clicks.

3.  **Refactor "Add New Strategy" Modal**
    -   [x] Remove the old modal HTML from `public/_strategy-form-modal.html` and convert it to a content-only partial.
    -   [x] Modify `public/js/modules/settings/strategies.handlers.js` to use the new modal service.
    -   [x] `openAddStrategyModal` will call `showModal`, passing the form content and "Save"/"Cancel" actions.

4.  **Refactor "Source Detail" Modal**
    -   [x] Refactor the "Source Detail" modal to use the new system.
    -   [x] This will involve modifying `public/js/modules/strategy-lab/sources/modal.handlers.js`.

5.  **Refactor "Trade Entry" Modal**
    -   [x] Refactor the "Trade Entry" modal to use the new system.
    -   [x] This will involve modifying `public/js/modules/strategy-lab/sources/idea-form.handlers.js`.

6.  **Cleanup**
    -   [x] Remove old, now-unused modal HTML files.
    -   [x] Remove old modal handling logic.

---
## Progress Log

*   **2025-12-08:** Task started. Plan created.
*   **2025-12-08:** Step 1 complete. Generic modal shell added to `index.html`.
*   **2025-12-08:** Step 2 complete. `modal.js` service created.
*   **2025-12-08:** Step 3 complete. "Add New Strategy" modal refactored.
*   **2025-12-08:** Step 4 complete. "Source Detail" modal refactored.
*   **2025-12-08:** Step 5 complete. "Trade Entry" modal refactored.
*   **2025-12-08:** Step 6 complete. Cleanup of old modal files and logic.