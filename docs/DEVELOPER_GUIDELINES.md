# Developer Guidelines for Strategy Lab

This document provides guidelines for developers working on the Strategy Lab project, focusing on best practices for debugging, file system interactions, and JavaScript module development.

## File System Interactions and Permissions

When working with file system resources, especially database files, it's crucial to understand and manage file permissions.

*   **Database File Permissions:** In environments like Windows, database files (e.g., `strategy_lab.db`) can often be inaccessible to the Node.js server process due to restrictive file system permissions. If you encounter errors like `SQLITE_CANTOPEN: unable to open database file`, it's highly likely a permission issue.
    *   **Diagnosis:** Use PowerShell cmdlets like `Test-Path` to verify file/directory existence.
    *   **Resolution:** Use native PowerShell cmdlets like `Set-Acl` to grant appropriate read/write permissions to the directory containing the database file. For diagnostic purposes, granting "Full Control" to "Everyone" can help confirm if permissions are the root cause. Remember to refine permissions for production environments.
    *   **Example PowerShell Command for Permissions:**
        ```powershell
        $acl = Get-Acl "d:\Code Projects\Strategy_lab\db"; $permission = "Everyone","FullControl","Allow"; $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission; $acl.AddAccessRule($accessRule); Set-Acl "d:\Code Projects\Strategy_lab\db" $acl
        ```
        Always restart the server process after modifying file permissions.

## Debugging JavaScript `SyntaxError` in Modules

`SyntaxError` messages, especially "Identifier 'X' has already been declared," can be tricky in modular JavaScript applications.

*   **Misleading Line Numbers:** Browser console line numbers for `SyntaxError` can sometimes be inaccurate, particularly with bundled, minified, or transpiled code. Don't solely rely on the reported line number; consider the context of the entire file.
*   **Duplicate Imports/Executions:** Ensure that JavaScript modules are imported and executed only once.
    *   Check `index.html` for duplicate `<script>` tags.
    *   Verify that module initialization functions (e.g., `initializeSettingsModule()`) are called only once within the application lifecycle (e.g., inside a `DOMContentLoaded` listener).
*   **Global Variable Collisions:** While ES modules help prevent global scope pollution, be mindful of any scripts that might inadvertently declare global variables or functions that conflict with module exports.
*   **Isolation for Debugging:** When a `SyntaxError` points to a specific function, temporarily comment out its complex logic and replace it with a simple `console.log`. This helps determine if the error is within the function's implementation or a more fundamental issue with the module's loading or parsing.

## Adhering to Project Conventions

*   **Self-Contained Modules:** The `strategy_lab` application should be self-contained and avoid references to subfolders outside its immediate directory structure, as it is intended to be moved to `c:\strategy_lab` in the future.
*   **Existing Patterns:** When modifying or adding code, always adhere to existing code style, naming conventions, and architectural patterns observed in the project.
*   **Comments:** Add comments sparingly, focusing on *why* a piece of code exists or *what* complex logic it performs, rather than simply restating *what* the code does.
