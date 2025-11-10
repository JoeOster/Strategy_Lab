# Developer Setup and Troubleshooting Guide

This document provides essential information for setting up the Strategy Lab development environment and troubleshooting common issues.

## Database Setup

The Strategy Lab application uses an SQLite database located at `./db/strategy_lab.db`. For the application to function correctly, the `db` directory must exist in the project root.

**If you encounter `SQLITE_CANTOPEN: unable to open database file` errors:**

1.  **Ensure the `db` directory exists:**
    *   Navigate to the project root directory in your terminal.
    *   Run the command: `mkdir db`
2.  **Check file permissions:** Ensure that the application process has read and write permissions to the `db` directory and the `strategy_lab.db` file (once created).

## Troubleshooting API Errors

When encountering "Failed to add source" or "Failed to fetch sources" errors, check the browser's developer console for detailed error messages. The application is configured to provide more specific server-side error details in the console output.

**Common error patterns and their solutions:**

*   **`SQLITE_CANTOPEN: unable to open database file`**: Refer to the "Database Setup" section above to create the missing `db` directory.
*   **Generic 500 Internal Server Error**: Examine the `details` field in the console's error output for more specific information from the server. This will often indicate issues with database queries or server-side logic.

By following these steps, you can effectively set up your development environment and diagnose common database and API-related issues.
