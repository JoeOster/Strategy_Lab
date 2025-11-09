# Strategy Lab V2: UI Wiring Guide

# Module F: Imports (Tab)

This document is the "contract" for all UI interactions for **Module F: Imports**, as defined in our `Strategy_Lab_V2_Plan.md`. The HTML blueprint for this module is `_imports.html`.

This module is a two-step "wizard" for uploading and reconciling brokerage CSV files.

## F1: Module Loader

Handles the initialization of the page and populating the "Step 1" form.

| Element ID / Selector     | Purpose (Human-Readable)               | Handler Function (for GCA)              |
| :------------------------ | :------------------------------------- | :-------------------------------------- |
| `#imports-page-container` | The main page container.               | `loadImportsPage()`                     |
| `#import-account-holder`  | Populates the account holder dropdown. | `populateAccountHolderDropdowns()`      |
| `#reconciliation-section` | The "Step 2" panel, hidden on load.    | (Managed by `handleReviewAndReconcile`) |

---

## F2: Step 1 - Upload File Form

This form handles the initial file selection and upload.

| Element ID / Selector        | Purpose (Human-Readable)                   | Handler Function (for GCA)   |
| :--------------------------- | :----------------------------------------- | :--------------------------- |
| `#import-account-holder`     | Input: Account to import into.             | (Managed by form submit)     |
| `#brokerage-template-select` | Input: Selects brokerage (Fidelity, etc.). | (Managed by form submit)     |
| `#csv-file-input`            | Input: The .csv file to upload.            | (Managed by form submit)     |
| `#import-csv-btn`            | Button: "Review & Reconcile"               | `handleReviewAndReconcile()` |

---

## F3: Step 2 - Reconciliation

This section is shown after a file is processed and handles displaying new items and resolving duplicates.

| Element ID / Selector          | Purpose (Human-Readable)                                                | Handler Function (for GCA)                         |
| :----------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------- |
| `#import-summary-container`    | Content: Summary of the import (e.g., "5 new, 2 conflicts").            | (Populated by `handleReviewAndReconcile`)          |
| `#new-transactions-table`      | Container: Table of new, non-conflicting trades.                        | (Populated by `renderNewTransactions`)             |
| `#new-transactions-body`       | Content: The rows of new transactions.                                  | (Populated by `renderNewTransactions`)             |
| `#conflicts-table`             | Container: Table of duplicate/conflicting trades.                       | (Populated by `renderConflicts`)                   |
| `#conflicts-body`              | Content: The rows of conflicts.                                         | (Populated by `renderConflicts`)                   |
| `(dynamic resolution buttons)` | (Dynamic) Buttons in the conflict table (e.g., "Keep Mine," "Use CSV"). | `handleConflictResolution(conflictId, resolution)` |
| `#cancel-import-btn`           | Button: Abort the entire import process.                                | `handleCancelImport()`                             |
| `#commit-import-btn`           | Button: Save all changes and import new trades.                         | `handleCommitImport()`                             |
