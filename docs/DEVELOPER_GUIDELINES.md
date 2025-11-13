# Developer Guidelines for Strategy Lab

This document provides guidelines for developers working on the Strategy Lab
project, focusing on best practices for debugging, file system interactions, and
JavaScript module development.

## File System Interactions and Permissions

When working with file system resources, especially database files, it's crucial
to understand and manage file permissions.

-   **Database File Permissions:** In environments like Windows, database files
    (e.g., `strategy_lab.db`) can often be inaccessible to the Node.js server
    process due to restrictive file system permissions. If you encounter errors
    like `SQLITE_CANTOPEN: unable to open database file`, it's highly likely a
    permission issue.
    -   **Diagnosis:** Use PowerShell cmdlets like `Test-Path` to verify
        file/directory existence.
    -   **Resolution:** Use native PowerShell cmdlets like `Set-Acl` to grant
        appropriate read/write permissions to the directory containing the
        database file. For diagnostic purposes, granting "Full Control" to
        "Everyone" can help confirm if permissions are the root cause. Remember
        to refine permissions for production environments.
    -   **Example PowerShell Command for Permissions:**
        ```powershell
        $acl = Get-Acl "d:\Code Projects\Strategy_lab\db"; $permission = "Everyone","FullControl","Allow"; $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission; $acl.AddAccessRule($accessRule); Set-Acl "d:\Code Projects\Strategy_lab\db" $acl
        ```
        Always restart the server process after modifying file permissions.

## Debugging JavaScript `SyntaxError` in Modules

`SyntaxError` messages, especially "Identifier 'X' has already been declared,"
can be tricky in modular JavaScript applications.

-   **Misleading Line Numbers:** Browser console line numbers for `SyntaxError`
    can sometimes be inaccurate, particularly with bundled, minified, or
    transpiled code. Don't solely rely on the reported line number; consider the
    context of the entire file.
-   **Duplicate Imports/Executions:** Ensure that JavaScript modules are imported
    and executed only once.
    -   Check `index.html` for duplicate `<script>` tags.
    -   Verify that module initialization functions (e.g.,
        `initializeSettingsModule()`) are called only once within the
        application lifecycle (e.g., inside a `DOMContentLoaded` listener).
-   **Global Variable Collisions:** While ES modules help prevent global scope
    pollution, be mindful of any scripts that might inadvertently declare global
    variables or functions that conflict with module exports.
-   **Isolation for Debugging:** When a `SyntaxError` points to a specific
    function, temporarily comment out its complex logic and replace it with a
    simple `console.log`. This helps determine if the error is within the
    function's implementation or a more fundamental issue with the module's
    loading or parsing.

## Adhering to Project Conventions

-   **Self-Contained Modules:** The `strategy_lab` application should be
    self-contained and avoid references to subfolders outside its immediate
    directory structure, as it is intended to be moved to `c:\strategy_lab` in
    the future.
-   **Existing Patterns:** When modifying or adding code, always adhere to
    existing code style, naming conventions, and architectural patterns observed
    in the project.
-   **Comments:** Add comments sparingly, focusing on _why_ a piece of code
    exists or _what_ complex logic it performs, rather than simply restating
    _what_ the code does.

## Playwright Testing Best Practices and Debugging

When developing and debugging Playwright end-to-end tests, consider the
following best practices and common pitfalls:

-   **Understanding "Hanging" Tests**: If Playwright tests appear to "hang"
    after execution, it's often due to the test runner keeping the process alive
    to serve the HTML test report. This is expected behavior and not an
    indication of a test failure or an actual hang in the test execution itself.
    You can typically terminate the process with `Ctrl+C` after reviewing the
    report.

-   **Robust Assertions for Asynchronous UI Updates**: When testing UI changes
    that occur after asynchronous operations (e.g., API calls), it's crucial to
    use robust Playwright assertions that wait for the DOM to update.
    -   **`expect(...).not.toBeAttached()`**: Use this assertion to confirm that
        an element has been completely removed from the DOM. This is more
        reliable than `not.toBeVisible()` when an element might become invisible
        but still exist in the DOM.
    -   **`expect(...).not.toContainText()` on specific elements**: When
        asserting the absence of text, target the most specific element possible
        (e.g., a list item `li:has-text(...)`) rather than a broad container.
        This helps Playwright accurately wait for the text to disappear from that
        specific element.

-   **Verifying Tool/Agent Changes**: When using automated tools or agents to
    modify code, always verify that the changes have been correctly applied to
    the target files. Do not rely solely on tool output; directly read the
    modified files to confirm their content. This prevents cascading errors and
    ensures your understanding of the codebase's state is accurate.

## Application Content Loading and Module Initialization Flow

Understanding how the application loads content and initializes its modules is
crucial for debugging and extending functionality. This application utilizes a
Single Page Application (SPA) architecture where content is dynamically loaded
by JavaScript.

Here's the step-by-step flow:

1.  **`public/index.html` (The Application Shell):**
    *   This is the initial HTML file loaded by the browser.
    *   It provides the basic page structure: `<head>`, `<body>`, the main
        navigation (`.main-nav`), and a single empty content area
        (`<main id="app-content">`).
    *   It loads `public/js/app-main.js` as a module
        (`<script type="module" src="js/app-main.js"></script>`).
    *   **Key Role:** Acts as a static container that JavaScript will dynamically
        populate.

2.  **`public/js/app-main.js` (The Application Entry Point):**
    *   This script executes once the DOM is fully loaded (`DOMContentLoaded`
        event).
    *   It imports and calls initialization functions for core application
        modules, such as `initializeNavigation()`, `initializeSettingsModule()`,
        `initializeUserSelector()`, and `strategyLab.initializeModule()`.
    *   **Key Role:** Orchestrates the initial setup and module loading for the
        entire application.

3.  **`public/js/modules/navigation/index.js` (Main Navigation Conductor):**
    *   The `initializeNavigation()` function (called from `app-main.js`) sets
        up the primary tab switching mechanism.
    *   It attaches click event listeners to all main navigation buttons
        (`.main-nav .nav-btn`).
    *   **When a main navigation button is clicked (e.g., "Strategy Lab"):**
        *   It updates the `active` class on the navigation buttons (making the
            clicked one active, others inactive).
        *   **Special Case: "Settings" Tab:** If the clicked tab is "settings",
            it explicitly shows the settings modal (whose HTML is statically
            present in `public/index.html`) and clears the main content area.
            This deviates from the dynamic page loading pattern.
        *   **For all other main tabs (e.g., "Dashboard", "Orders", "Strategy
            Lab"), it calls `loadPageContent(tab)` (e.g.,
            `loadPageContent('strategy-lab')`).**
    *   **`loadPageContent(tab)` Function:**
        *   Takes the `tab` name (e.g., 'strategy-lab').
        *   Constructs a URL for a corresponding HTML file (e.g.,
            `public/_strategy-lab.html`).
        *   Uses `fetch()` to retrieve the content of this HTML file from the
            server.
        *   Injects the fetched HTML content into the
            `<main id="app-content">` element, effectively replacing any
            previous content.
        *   **Crucially, it also dynamically creates and appends a `<script>`
            tag** to load the corresponding JavaScript module for that tab
            (e.g., `public/js/modules/strategy-lab/index.js`). This ensures that
            the JavaScript logic specific to the newly loaded HTML content is
            executed.
    *   **Key Role:** Manages dynamic loading of HTML content and associated
        JavaScript for each main application tab.

4.  **`public/_<tab-name>.html` (e.g., `public/_strategy-lab.html`):**
    *   These are partial HTML files, each containing the specific UI structure
        for a given main application tab.
    *   For example, `public/_strategy-lab.html` contains the
        `#strategy-lab-page-container` with its sub-navigation and sub-tab
        content panels.
    *   **Key Role:** Provides the HTML template for a specific main tab, loaded
        on demand.

5.  **`public/js/modules/<tab-name>/index.js` (e.g.,
    `public/js/modules/strategy-lab/index.js`):**
    *   This script is dynamically loaded by `loadPageContent()` after its
        corresponding HTML (`public/_<tab-name>.html`) has been injected into
        the DOM.
    *   Its `initializeModule()` function runs, setting up event listeners and
        initializing sub-components specific to that tab.
    *   For the "Strategy Lab" module, it calls `initializeStrategyLabSubTabs()`
        to manage the initial state and event listeners for its internal
        sub-tabs.
    *   **Key Role:** Acts as the conductor for a specific main tab, initializing
        its functionality and sub-modules.

6.  **`public/js/modules/<tab-name>/handlers.js` (e.g.,
    `public/js/modules/strategy-lab/handlers.js`):**
    *   Contains event handler functions specific to the interactions within that
        main tab or its sub-tabs.
    *   For "Strategy Lab", `handleSubTabClick()` manages the `active` class on
        sub-tab buttons and their corresponding content panels
        (`.sub-tab-content`).
    *   **Key Role:** Implements the interactive behavior for a specific tab's UI
        elements.

7.  **`public/css/main.css` (The Styling Layer):**
    *   Contains the CSS rules that define the visual presentation of all UI
        elements.
    *   Crucially, it includes rules like `.sub-tab-content { display: none; }`
        and `.sub-tab-content.active { display: block; }` (and similar for main
        panels) to control the visibility of content based on the `active` class
        toggled by JavaScript.
    *   **Key Role:** Ensures the UI elements are rendered correctly and respond
        visually to JavaScript-driven state changes.

This layered approach ensures modularity, allows for dynamic content updates
without full page reloads, and separates concerns effectively.