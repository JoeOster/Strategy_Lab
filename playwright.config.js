// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3113',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // This is the correct fix.
    // We combine your original goal (logging to files) with the fix for the "hang".
    //
    // 1. The command is 'node server.js'
    // 2. We add shell redirection ('>' for stdout, '2>' for stderr)
    //    to pipe the output to your log files.
    // 3. We DO NOT add '&' or 'wait-on'. Playwright will run this command
    //    in the foreground and manage it.
    command: 'cross-env PORT=3113 TEST_ENV=true node server.js > log/playwright_server_stdout.log 2> log/playwright_server_stderr.log',

    // Playwright will use this URL to poll the server.
    // This replaces the need for 'wait-on'.
    url: 'http://localhost:3113',

    // This line was and is correct.
    reuseExistingServer: false,

    // The 'stdout' and 'stderr' properties I added before are
    // REMOVED, as they caused the TypeScript error.
  },
});