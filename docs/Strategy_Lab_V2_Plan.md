# Strategy Lab V2: Development Plan

This document is the **master source of truth** for the development of Strategy Lab V2. It replaces the previous `Strategy-Lab_Development_Plan.md`.

This plan is built on the lessons learned from the flawed V3 -> V4 refactor. Its primary goals are to establish robust development "guardrails," ensure code quality, and create a resilient, testable, and maintainable application.

## 1. Guiding Principles

These principles are the foundational contract for our collaboration.

1. **Servant-Led Execution:** The user (Leader) provides explicit, step-by-step approval for all tasks. The agent (GCA/Servant) executes those tasks precisely.
2. **The Plan is the Source of Truth:** This document, and its supporting `docs/` files, are our external brain. GCA's memory is irrelevant; these files are its instructions.
3. **Task Execution Log Workflow:** All code-related work **must** follow the protocol defined in `docs/GCA_Execution_Protocol.md`. This workflow (Log Generation -> Atomic Execution -> State Update) is our primary defense against LLM errors and "garbage code."
4. **Use Dedicated State Libraries:** We will use modern, dedicated libraries (**@tanstack/query-core** for server state, **zustand** for client state) to manage application state. This replaces the manual "State Read/Write Separation" rule from the V4 plan and is designed to eliminate "stale data" bugs.
5. **Always Pass IDs:** Functions that act on an existing entity (e.g., `openEditModal`) **must** only accept its primary `ID` (e.g., `transactionId`). This prevents stale data bugs by forcing the function to retrieve fresh data.
6. **Self-Contained `strategy_lab` Folder:** All work, file references, and dependencies will occur exclusively within the `strategy_lab` folder.

## 1.5. Development Workflow

To ensure consistency, quality, and resilience against context loss, all development will adhere to a Git-based feature branch workflow.

### Branching & Commits

1.  **Main as Truth:** The `main` branch is the single source of truth and must always be in a stable, deployable state. Direct commits to `main` are forbidden post-setup.
2.  **Temporary Feature Branches:** All new work (features, bug fixes) **must** be done on a temporary feature branch, created from `main` (e.g., `feature/add-settings-modal`).
3.  **Atomic Commits:** Each logical step of a task will be committed individually. This creates a granular history and allows for easy rollbacks.
4.  **Merge and Delete:** Once a feature is complete and verified, the branch will be merged into `main`. The feature branch will then be deleted.

### Task Management (The "Issue Tracker")

1.  **The Plan:** For each task, a detailed, step-by-step technical plan will be generated.
2.  **Local Task Log:** Due to the agent's limitations in accessing the GitHub web UI, we will use the `docs/CURRENT_TASK_LOG.md` file as a local substitute for a GitHub Issue. This file will contain the checklist for the active task.
3.  **Execution:** The agent will execute the steps from the task log and make a corresponding Git commit for each completed step.

## 2. Core Data Definitions

This section defines the three core data types in the application and how they map to the database.

1. **Real Executed Trade (Dashboard)**
    - **Definition:** A real-money ticker purchase or sale that has been executed. This is a "real position."
    - **UI Location:** Displayed on the **Dashboard** (Module D) and in the **Ledger** (Module C).
    - **Database Table:** `transactions`
    - **Database Flag:** `is_paper_trade = 0`

2. **Real Watched Order (Orders)**
    - **Definition:** A real-money $order (e.g., "Buy Limit") that is being watched but is _not yet executed_. This is the item that triggers a "Global Alert".
    - **UI Location:** Created and managed on the **Orders** tab (Module B).
    - **Database Table:** `watched_items`
    - **Database Flag:** `is_paper_trade = 0`

3. **Strategy Lab Items (Strategy Lab)**
    - **Definition:** Fully hypothetical items for research and practice.
    - **UI Location:** Created and managed _only_ within the **Strategy Lab** tab (Module E).
    - This has two sub-types:
      - **"Watched Idea":** A simple ticker being watched for info (e.g., "Trade Idea" from a Source).
        - **Database Table:** `watched_items`
        - **Database Flag:** `is_paper_trade = 1`
      - **"Paper Trade":** A theoretical, _executed_ trade.
        - **Database Table:** `transactions`
        - **Database Flag:** `is_paper_trade = 1`

## 3. Key Issues This Plan Solves

This refactor is specifically designed to fix the critical issues from the V4 refactor:

- **Tab Monoliths:** The massive, unmaintainable event handler files (e.g., `dashboard.js`) will be broken into modular, feature-based directories.
- **Missing Functionality:** Logic from V3 (like the "Imports" tab) that was lost will be correctly implemented.
- **Nomenclature Confusion:** Ambiguous terms ("Watchlist," "Orders") will be clarified in the UI and codebase.
- **Unlinked Strategies:** A "Strategy" (journal entry) will be programmatically linked to the "Limit Orders" it generates.

## 4. Core V2 Architecture: The "LLM Survival" Pattern

This is our primary architectural rule, designed to prevent "tangled" code and LLM failures. The "Tab Monoliths" of the V4 app and large, multi-purpose files are a direct cause of LLM errors.

To solve this, all modules **must** be broken down into the following file structure. This ensures GCA's tasks are "atomic" and our "Task Execution Log" workflow is resilient.

### Standard Module Pattern

Every module (e.g., `settings`, `ledger`, `dashboard`) will have its own folder inside `public/js/modules/`. That folder **must** contain the following files:

- **`index.js` (The "Conductor")**
  - **Purpose:** The _only_ file the rest of the app can import.
  - **Logic:** Contains the main `initializeModule()` function. It imports from its siblings (`handlers.js`, `api.js`) and attaches listeners to the HTML elements defined in the `Wiring_Guide`.

- **`handlers.js` (The "Listeners & Buttons")**
  - **Purpose:** Contains all UI event handler functions.
  - **Logic:** All functions related to user interaction (e.g., `handleSaveClick()`, `handleThemeChange()`). This file _calls_ functions from `api.js` and `render.js`.

- **`api.js` (The "Data" File)**
  - **Purpose:** Handles all server communication (fetch, TanStack Query, etc.).
  - **Logic:** Contains all functions that get or send data (e.g., `fetchSettings()`, `updateSettings(data)`). It _never_ touches the DOM.

- **`render.js` (The "HTML" File)**
  - **Purpose:** Handles all dynamic HTML generation.
  - **Logic:** Contains all functions that build HTML strings (e.g., `renderHoldersList(holders)`). It _never_ fetches data or attaches listeners.

_(Note: The main HTML template files (e.g., `_modal_settings.html`) will remain in the `public/templates/` directory. This pattern is only for the JavaScript that powers them.)_

### Proposed `public/js/` Directory Structure
