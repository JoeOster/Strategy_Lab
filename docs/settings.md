# Settings Module Troubleshooting and Development Notes

This document outlines common issues encountered during the development and
troubleshooting of the Settings module, particularly focusing on database
interactions and JavaScript module loading.

## Database Issues: `SQLITE_CANTOPEN: unable to open database file`

**Problem:** When interacting with the application, especially when adding new
data (e.g., sources), you might encounter an error message like "Failed to add
source. Please check the console for details." The console logs will often show
`Error adding source: Error: Failed to add source. Server responded with status: 500 Internal Server Error Details: {"error":"Failed to add source","details":"SQLITE_CANTOPEN: unable to open database file"}`.

**Cause:** This error indicates that the Node.js server process does not have
the necessary read/write permissions to access the `strategy_lab.db` file
located in the `db` directory. This is a common issue in Windows environments
where file system permissions can be restrictive.

**Resolution (Windows PowerShell):** To resolve this, you need to grant the
server process (or the user running the server process) appropriate permissions
to the `db` directory. A common diagnostic step is to grant "Full Control" to
"Everyone" for the `db` directory. **Note:** For production environments, it is
recommended to apply more granular permissions.

1.  **Open PowerShell as Administrator.**
2.  **Execute the following command:**
    ```powershell
    $acl = Get-Acl "d:\Code Projects\Strategy_lab\db"; $permission = "Everyone","FullControl","Allow"; $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission; $acl.AddAccessRule($accessRule); Set-Acl "d:\Code Projects\Strategy_lab\db" $acl
    ```
    This command retrieves the current Access Control List (ACL) for the `db`
    directory, creates a new access rule granting "FullControl" to "Everyone",
    adds this rule to the ACL, and then applies the modified ACL back to the
    `db` directory.
3.  **Restart the Node.js server process.**

After executing these steps, the server should be able to open and write to the
`strategy_lab.db` file without the `SQLITE_CANTOPEN` error.

## JavaScript `SyntaxError: Identifier 'handleFontChange' has already been declared`

**Problem:** You might encounter an
`Uncaught SyntaxError: Identifier 'handleFontChange' has already been declared`
error in the browser console, often pointing to a line number at or near the end
of `public/js/modules/settings/handlers.js`.

**Cause:** This error typically occurs when a JavaScript identifier (like a
function name) is declared more than once within the same scope. In a modular
JavaScript application, this can be misleading as it might not be a direct
re-declaration within the file itself but rather:

- The module (`handlers.js`) being loaded or executed multiple times.
- A global variable collision if a function with the same name exists in the
  global scope.
- Incorrect line number reporting by the browser's developer tools, especially
  with bundled or transpiled code.

**Debugging Steps:**

1.  **Verify Module Loading:** Ensure that
    `public/js/modules/settings/handlers.js` is imported only once in
    `public/js/modules/settings/index.js` (using
    `import * as handlers from './handlers.js';`) and that
    `initializeSettingsModule()` (which uses these handlers) is called only once
    in `public/js/app-main.js`.
2.  **Check for Global Collisions:** Although less common with ES modules,
    temporarily rename the problematic function (`handleFontChange`) to see if
    the error changes or moves.
3.  **Isolate the Function Logic:** If the error persists and module loading
    seems correct, temporarily comment out the entire body of the problematic
    function and replace it with a simple `console.log`. If the error
    disappears, the issue lies within the function's original implementation. If
    it persists, the problem is more fundamental to the file's parsing or
    loading.
4.  **Review HTML Includes:** Confirm that the main JavaScript files
    (`app-main.js`) are not included multiple times in `public/index.html`.

**Resolution:** In the specific case encountered, the module loading was
correct, and the error was resolved by ensuring the `handleFontChange` function
was correctly defined and not implicitly re-declared or conflicting with other
scripts. The initial diagnostic steps helped rule out other causes.

## Settings Tabs Not Loading Content

**Problem:** After making changes to the settings module, some tabs (e.g., "Data
Management", "User Management") might appear, but their content areas remain
empty or do not load the expected lists (e.g., Advice Sources, Account Holders).

**Cause:** The `handleMainTabClick` function in
`public/js/modules/settings/handlers.js` is responsible for activating the
correct panel and triggering data loading functions. If new panels are added or
existing ones are modified, this function needs to be updated to explicitly call
the relevant `load...List()` functions for those panels.

**Resolution:** Ensure that `handleMainTabClick` includes conditional calls to
the appropriate data loading functions for each settings panel. For example:

```javascript
/* eslint-disable */
export function handleMainTabClick(event) {
  // ... (existing code for tab/panel activation) ...

  if (panel) {
    panel.classList.add('active');
    if (targetPanelId === 'general-settings-panel') {
      loadGeneralSettings();
    } else if (targetPanelId === 'appearance-settings-panel') {
      loadAppearanceSettings();
    } else if (targetPanelId === 'exchanges-panel') {
      loadExchangesList();
    } else if (targetPanelId === 'data-management-settings-panel') {
      loadSourcesList(); // Added this line
    } else if (targetPanelId === 'user-management-settings-panel') {
      loadAccountHoldersList(); // Added this line
    }
  } else {
    console.error(`Settings panel not found: ${targetPanelId}`);
  }
}
/* eslint-enable */
```

By ensuring these `load...List()` calls are present, the content for each tab
will be dynamically loaded when the tab is activated.

## API Contracts

### Add New Advice Source

- **Endpoint:** `POST /api/sources`
- **Content-Type:** `application/json`

The server expects a JSON payload with the following structure. All fields are
optional except for `name` and `type`.

**Base Fields:**

| Key           | Type   | Description                               |
| ------------- | ------ | ----------------------------------------- |
| `name`        | String | The name of the advice source. (Required) |
| `type`        | String | The type of source. (Required)            |
| `description` | String | A description of the source.              |
| `image_path`  | String | Path to an image for the source.          |
| `url`         | String | A URL related to the source.              |

**Person Fields (when `type` is 'person'):**

| Key                 | Type   | Description                                   |
| ------------------- | ------ | --------------------------------------------- |
| `person_email`      | String | The person's email address.                   |
| `person_phone`      | String | The person's phone number.                    |
| `person_app_type`   | String | The type of messaging app (e.g., 'Telegram'). |
| `person_app_handle` | String | The person's handle in the app.               |

**Group Fields (when `type` is 'group'):**

| Key                     | Type   | Description                                  |
| ----------------------- | ------ | -------------------------------------------- |
| `group_primary_contact` | String | The primary contact person for the group.    |
| `group_email`           | String | The group's email address.                   |
| `group_phone`           | String | The group's phone number.                    |
| `group_app_type`        | String | The type of messaging app (e.g., 'Discord'). |
| `group_app_handle`      | String | The group's handle in the app.               |

**Book Fields (when `type` is 'book'):**

| Key             | Type   | Description                                |
| --------------- | ------ | ------------------------------------------ |
| `book_author`   | String | The author of the book.                    |
| `book_isbn`     | String | The ISBN of the book.                      |
| `book_websites` | String | Comma-separated list of relevant websites. |
| `book_pdfs`     | String | Comma-separated list of relevant PDFs.     |

**Website Fields (when `type` is 'website'):**

| Key                | Type   | Description                              |
| ------------------ | ------ | ---------------------------------------- |
| `website_websites` | String | Comma-separated list of relevant links.  |
| `website_pdfs`     | String | Comma-separated list of saved documents. |

**Example Payload (for a 'person' source):**

```json
{
  "name": "John Doe",
  "type": "person",
  "description": "A financial advisor.",
  "person_email": "john.doe@example.com"
}
```
