// @ts-check
import { expect, test } from '@playwright/test';

test.describe('Settings Module - Web Apps', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/clear-db');
    await page.goto('/');
    await page.click('button[data-tab="settings"]');
    await expect(page.locator('#settings-modal')).toBeVisible();
    await page.click('button[data-tab="data-management-settings-panel"]');
    await page.click('button[data-sub-tab="webapps-panel"]');
  });

  test('should display "No web apps found." initially', async ({ page }) => {
    await expect(page.locator('#webapp-list')).toContainText(
      'No web apps found.'
    );
  });

  test('should add a new web app', async ({ page }) => {
    const webAppName = 'Test Web App';

    await page.fill('#new-webapp-name', webAppName);
    await page.click('#add-webapp-form button[type="submit"]');

    await expect(page.locator('#webapp-list')).toContainText(webAppName);
    await expect(page.locator('#new-webapp-name')).toHaveValue(''); // Form should be cleared
  });

  test('should not add a web app with empty name', async ({ page }) => {
    page.on('dialog', (dialog) => {
      expect(dialog.message()).toContain('Web app name cannot be empty.');
      dialog.accept();
    });

    await page.fill('#new-webapp-name', ''); // Empty name
    await page.click('#add-webapp-form button[type="submit"]');

    await expect(page.locator('#webapp-list')).toContainText(
      'No web apps found.'
    ); // Should still be empty
  });

  test('should delete a web app', async ({ page }) => {
    const webAppName = 'Web App to Delete';

    // Add a web app first
    await page.fill('#new-webapp-name', webAppName);
    await page.click('#add-webapp-form button[type="submit"]');
    await expect(page.locator('#webapp-list')).toContainText(webAppName);

    // Delete the web app
    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.delete-webapp-btn[data-id]').first().click();

    await expect(page.locator('#webapp-list')).not.toContainText(webAppName);
    await expect(page.locator('#webapp-list')).toContainText(
      'No web apps found.'
    );
  });

  test('should clear the "Add New Web App" form', async ({ page }) => {
    await page.fill('#new-webapp-name', 'Temporary Web App');
    await expect(page.locator('#new-webapp-name')).toHaveValue(
      'Temporary Web App'
    );

    await page.click('#clear-webapp-btn');

    await expect(page.locator('#new-webapp-name')).toHaveValue('');
  });
});
