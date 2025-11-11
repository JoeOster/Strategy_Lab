### Task Management (The "Issue Tracker")

1.  **The Plan:** For each task, a detailed, step-by-step technical plan will be
    generated.
2.  **Permission:** - Once the plan is written to docs\CURRENT_TASK_LOG.md
3.  **Local Task Log:** Due to the agent's limitations in accessing the GitHub
    web UI, we will use the `docs/CURRENT_TASK_LOG.md` file as a local
    substitute for a GitHub Issue. This file will contain the checklist for the
    active task.
4.  **Execution:** The agent will execute the steps from the task log and make a
    corresponding Git commit for each completed step.
5.  **Quality Assurance:** The agent will inspect server logs and verify no
    errors before handing over to user for manual testing

### Current Task: Investigate Playwright Test Hanging Issue

**Path:** d:\Code Projects\Strategy_lab

**Steps:**

1.  Read `package.json` to understand the `test:e2e` script.
2.  Read `playwright.config.js` to understand Playwright's configuration.
3.  Read `server.js` to check how the server is started.
4.  Read `start.ps1` to see how the server is started via the PowerShell script.
5.  **Identified Port Mismatch:** `playwright.config.js` expects the server on
    `http://localhost:3113`, but `server.js` defaults to
    `http://localhost:8080`.
6.  **Modified `playwright.config.js` (Attempt 1)**: Updated `webServer.command`
    to
    `PORT=3113 node server.js > log/playwright_server_stdout.log 2> log/playwright_server_stderr.log`
    to ensure the server starts on the correct port for Playwright tests.
7.  Attempted to run `npm run test:e2e` with output redirected to
    `log/test_e2e_output.log` and `log/test_e2e_error.log`. The command exited
    with code 1, but `log/test_e2e_error.log` was empty.
8.  Attempted to run `npm run test:e2e` with only stdout redirected to
    `log/test_e2e_output.log`. The command still exited with code 1, and no
    stderr was printed to the console.
9.  Read `log/playwright_server_stdout.log` (empty) and
    `log/playwright_server_stderr.log` (contained
    `'PORT' is not recognized as an internal or external command, operable program or batch file.`).
    This indicated a Windows-specific issue with setting environment variables.
10. **Modified `playwright.config.js` (Attempt 2)**: Updated `webServer.command`
    to use
    `cross-env PORT=3113 node server.js > log/playwright_server_stdout.log 2> log/playwright_server_stderr.log`
    to ensure cross-platform compatibility for setting the `PORT` environment
    variable.
11. Attempted to run `npm run test:e2e` again. The user reported that the
    command hung.
12. Read `log/playwright_server_stdout.log` (contained
    `Server is running on http://localhost:3113`) and
    `log/playwright_server_stderr.log` (empty). This confirms the server is
    starting correctly.
13. Read `log/test_e2e_output.log` (contained `EBUSY` errors when unlinking
    `strategy_lab.db`) and `log/test_e2e_error.log` (empty). This indicated a
    file lock issue on the database.
14. **Modified `services/database.js`**: Added a retry mechanism to the
    `clearDb` function to handle the `EBUSY` error on Windows when attempting to
    unlink the database file.
15. Attempted to run `npm run test:e2e` again. The user observed a Chrome
    window, indicating Playwright launched successfully, but the `EBUSY` error
    persisted.
16. **Modified `playwright.config.js` (Attempt 3)**: Added `TEST_ENV=true` to
    the `webServer.command` to signal a test environment.
17. **Modified `services/database.js`**: Implemented conditional logic to use an
    in-memory SQLite database (`:memory:`) when `process.env.TEST_ENV` is
    `true`. The `clearDb` function was also updated to handle in-memory
    databases by simply closing the connection, as there's no physical file to
    unlink.
18. Attempted to run `npm run test:e2e` again. The user observed a Chrome
    window, and the `EBUSY` errors were gone, but tests were failing due to
    persistent data.
19. **Modified `playwright.config.js` (Attempt 4)**: Set
    `reuseExistingServer: false` within the `webServer` configuration to ensure
    the server restarts for each test, providing a clean in-memory database for
    every test run.
20. Attempted to run `npm run test:e2e` again. The `EBUSY` errors were gone, but
    all `settings.spec.js` tests were failing due to outdated data in the
    database.
21. Read `tests/settings.spec.js` to analyze the test setup and how `clearDb` is
    called.
22. **Modified `server.js`**: Added a new API endpoint `POST /api/clear-db` that
    calls the `clearDb()` function. This endpoint is only available when
    `process.env.TEST_ENV` is true.
23. **Modified `tests/settings.spec.js`**: In the `beforeEach` hook, replaced
    `await clearDb();` with an `await page.request.post('/api/clear-db');` call
    to trigger the `clearDb()` logic within the server process.
24. Attempted to run `npm run test:e2e` again.
25. Reviewed `playwright.config.js`. The configuration for `webServer` appears
    correct. The issue seems to be that `playwright test` itself is not
    executing.
26. Attempted to run `playwright test` directly. Received an error:
    `'playwright' is not recognized as the name of a cmdlet, function, script file, or operable program`.
    This indicates that `playwright` is not in the system's PATH when called
    directly.
27. Attempted to run `npx playwright test` directly. The tests are running but
    appear to be hanging.
28. Modified `tests/settings.spec.js` to use `test.only` for 'should display "No
    advice sources found." initially' and `test.skip` for the other tests.
29. Ran `npx playwright test` again. The single enabled test
    (`should display "No advice sources found." initially`) passed successfully
    across Chromium, Firefox, and WebKit. This confirms Playwright is now
    correctly launching the browser, starting the server, and executing tests.
30. Re-enabled all tests in `tests/settings.spec.js` by removing `test.only` and
    `test.skip`.
31. Ran `npx playwright test` again with all tests enabled. The tests are taking
    a long time to run, indicating potential lingering environmental issues or
    test interdependencies.
32. Re-modified `tests/settings.spec.js` to use `test.only` for 'should display
    "No advice sources found." initially' and `test.skip` for the other tests,
    as requested by the user.
33. Plan to run `npx playwright test` again to see if the single test executes
    and completes.
34. Read `log/test_e2e_error.log` to check for Playwright test errors.
35. **Re-enabled all tests in `tests/settings.spec.js`**: Removed `test.only`
    and `test.skip` from all tests in `tests/settings.spec.js` to run the full
    suite.
36. **Observed test failures and "hanging"**: Ran `npx playwright test`. The
    tests failed with `expect(...).not.toContainText(...)` errors, and the
    process "hung" (remained active, serving the HTML report).
37. **Investigated client-side deletion logic**: Reviewed
    `public/js/modules/settings/handlers.js` and
    `public/js/modules/settings/api.js`. The client-side logic for deleting
    sources and refreshing the list (`loadSourcesList()`) appeared correct.
38. **Investigated server-side deletion logic**: Reviewed `server.js`. The
    `DELETE /api/sources/:id` endpoint appeared to correctly delete sources from
    the database.
39. **Hypothesized timing issue**: Concluded that the test failures were likely
    due to a timing issue where Playwright asserted before the UI fully updated
    after deletion.
40. **Attempted to add explicit wait for element detachment
    (`not.toBeVisible()`)**: Modified `tests/settings.spec.js` to include
    `await expect(page.locator("text=${sourceName} (person)")).not.toBeVisible();`
    after dialog acceptance in the deletion tests. (This step ultimately failed
    to be correctly applied due to tool error).
41. **Encountered `SyntaxError`**: A `SyntaxError` was introduced due to a
    missing closing `);` in the `not.toContainText` assertion in
    `should add a new person advice source` test.
42. **Fixed `SyntaxError`**: Corrected the missing `);` in the
    `should add a new person advice source` test. (This fix was applied, then
    believed to be reverted due to me reading stale logs, causing further
    confusion).
43. **Attempted to add explicit wait for element detachment
    (`not.toBeAttached()`)**: Intended to modify `tests/settings.spec.js` to
    replace `not.toBeVisible()` with `not.toBeAttached()` in the deletion tests.
    (This step also suffered from tool errors and was not correctly applied in
    the log I was reading).
44. **Modified assertion to check for specific list item absence**: Changed the
    assertion from
    `await expect(page.locator('#advice-source-list')).not.toContainText(...)`
    to
    `await expect(page.locator("li:has-text(\"${sourceName} (person)\")")).not.toBeAttached();`
    in the three deletion tests. (This step also suffered from tool errors and
    was not correctly applied in the log I was reading).
45. **Verified current file content**: Read `tests/settings.spec.js` again to
    ensure the applied changes are reflected. Confirmed `not.toBeAttached()` was
    applied correctly in the test file via `li:has-text(...)`.
46. **Observed continued failures and "hanging"**: Ran `npx playwright test`
    again. The tests are still failing, and the output indicates the
    `not.toContainText` assertions are still present, contradicting the file
    content I just read. This suggests an issue with my local environment or the
    log redirection.
47. **Re-verified `tests/settings.spec.js` content and applied fixes**: Manually
    re-checked `tests/settings.spec.js` and applied the following fixes:
    - **`should add a new person advice source`**: Added missing dialog
      acceptance and `not.toContainText` assertion.
    - **`should add a new book advice source`**: Removed duplicate
      `not.toBeAttached()` and added missing `not.toContainText` assertion.
    - **`should delete an advice source`**: Added missing `not.toContainText`
      assertion.
48. **Ran `npx playwright test` without output redirection**: Executed
    `npx playwright test` directly to the console to ensure real-time output.
49. **All tests passed**: All 18 tests (6 example tests, 12 settings tests
    across 3 browsers) passed successfully in 12 seconds.
50. **Understood "hanging" behavior**: The "hanging" was identified as the
    Playwright test runner keeping the process alive to serve the HTML report,
    which is expected behavior. The tests themselves are completing
    successfully.
