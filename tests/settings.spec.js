// @ts-check
import { expect, test } from '@playwright/test';
// import { clearDb } from '../services/database.js'; // No longer needed here

test.describe('Settings Module - Advice Sources', () => {
  test.beforeEach(async ({ page }) => {
    // await clearDb(); // Clear the database before each test - moved to API call
    await page.request.post('/api/clear-db'); // Call API to clear the database
    await page.goto('/'); // Navigate to the base URL
    await page.click('button[data-tab="settings"]'); // Click the Settings tab
    await expect(page.locator('#settings-modal')).toBeVisible(); // Ensure modal is visible
    await page.click('button[data-tab="data-management-settings-panel"]'); // Click Data Management main tab
    await page.click('button[data-sub-tab="sources-panel"]'); // Click Advice Sources sub-tab
  });

  test('should display "No advice sources found." initially', async ({
    page,
  }) => {
    await expect(page.locator('#advice-source-list')).toContainText(
      'No advice sources found.'
    );
  });

  test('should add a new person advice source', async ({ page }) => {
    const sourceName = 'Test Person Source';
    const sourceEmail = 'test@example.com';

    // Select 'Person' type
    await page.selectOption('#new-source-type', 'person');
    await expect(page.locator('#new-source-panel-person')).toBeVisible();

    // Fill form
    await page.fill('#new-source-name', sourceName);
    await page.fill('#new-source-contact-email', sourceEmail);

    // Submit form
    await page.click('#add-new-source-form button[type="submit"]');

    // Assert source is added
    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceName} (person)`
    );

    // Clean up: Delete the added source
    await page.locator('.delete-source-btn[data-id]').first().click();
    await page.on('dialog', (dialog) => dialog.accept()); // Accept the confirmation dialog
    await expect(page.locator(`li:has-text("${sourceName} (person)")`)).not.toBeAttached();
    await expect(page.locator('#advice-source-list')).not.toContainText(
      `${sourceName} (person)`
    );
  });

  test('should add a new book advice source', async ({ page }) => {
    const sourceTitle = 'Test Book Title';
    const sourceAuthor = 'Test Author';

    // Select 'Book' type
    await page.selectOption('#new-source-type', 'book');
    await expect(page.locator('#new-source-panel-book')).toBeVisible();

    // Fill form
    await page.fill('#new-source-name', sourceTitle);
    await page.fill('#new-source-book-author', sourceAuthor);

    // Submit form
    await page.click('#add-new-source-form button[type="submit"]');

    // Assert source is added
    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceTitle} (book)`
    );

    // Clean up: Delete the added source
    await page.locator('.delete-source-btn[data-id]').first().click();
    await page.on('dialog', (dialog) => dialog.accept()); // Accept the confirmation dialog
    await expect(page.locator(`li:has-text("${sourceTitle} (book)")`)).not.toBeAttached();
    await expect(page.locator('#advice-source-list')).not.toContainText(
      `${sourceTitle} (book)`
    );
  });

  test('should delete an advice source', async ({ page }) => {
    const sourceName = 'Source to Delete';
    const sourceEmail = 'delete@example.com';

    // Add a source to delete
    await page.selectOption('#new-source-type', 'person');
    await page.fill('#new-source-name', sourceName);
    await page.fill('#new-source-contact-email', sourceEmail);
    await page.click('#add-new-source-form button[type="submit"]');
    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceName} (person)`
    );

    // Delete the source
    await page.locator('.delete-source-btn[data-id]').first().click();
    await page.on('dialog', (dialog) => dialog.accept()); // Accept the confirmation dialog

    // Assert source is deleted
    await expect(page.locator(`text=${sourceName} (person)`)).not.toBeAttached();
    await expect(page.locator(`li:has-text("${sourceName} (person)")`)).not.toBeAttached();
    await expect(page.locator('#advice-source-list')).not.toContainText(
      `${sourceName} (person)`
    );
  });
});
