// @ts-check
import { expect, test } from '@playwright/test';

test.describe('Settings Module - Advice Sources', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/clear-db');
    await page.goto('/');
    await page.click('button[data-tab="settings"]');
    await expect(page.locator('#settings-modal')).toBeVisible();
    await page.click('button[data-tab="data-management-settings-panel"]');
    await page.click('button[data-sub-tab="sources-panel"]');
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

    await page.selectOption('#new-source-type', 'person');
    await expect(page.locator('#new-source-panel-person')).toBeVisible();

    await page.fill('#new-source-name', sourceName);
    await page.fill('#new-source-contact-email', sourceEmail);

    await page.click('#add-new-source-form button[type="submit"]');

    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceName} (person)`
    );

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.delete-source-btn[data-id]').first().click();

    await expect(
      page.locator(`li:has-text("${sourceName} (person)")`)
    ).not.toBeAttached();
  });

  test('should add a new book advice source', async ({ page }) => {
    const sourceTitle = 'Test Book Title';
    const sourceAuthor = 'Test Author';

    await page.selectOption('#new-source-type', 'book');
    await expect(page.locator('#new-source-panel-book')).toBeVisible();

    await page.fill('#new-source-name', sourceTitle);
    await page.fill('#new-source-book-author', sourceAuthor);

    await page.click('#add-new-source-form button[type="submit"]');

    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceTitle} (book)`
    );

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.delete-source-btn[data-id]').first().click();

    await expect(
      page.locator(`li:has-text("${sourceTitle} (book)")`)
    ).not.toBeAttached();
  });
test('should delete an advice source', async ({ page }) => {
  const sourceName = 'Source to Delete';
  const sourceEmail = 'delete@example.com';

  // 1. Create the source
  await page.selectOption('#new-source-type', 'person');
  await page.fill('#new-source-name', sourceName);
  await page.fill('#new-source-contact-email', sourceEmail);
  await page.click('#add-new-source-form button[type="submit"]');

  // 2. Locate the specific list item
  const sourceItemLocator = page.locator(`li:has-text("${sourceName} (person)")`);
  await expect(sourceItemLocator).toBeVisible();

  // 3. Set up the dialog handler and click delete
  page.on('dialog', (dialog) => dialog.accept());
  await sourceItemLocator.getByRole('button', { name: 'Delete' }).click();

  // 4. THE FIX: Wait for the element to be removed from the DOM
  await expect(sourceItemLocator).not.toBeAttached();
});

});

test.describe('Settings Module - L2 Sub-tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button[data-tab="settings"]');
    await expect(page.locator('#settings-modal')).toBeVisible();
  });

  test('should switch between L2 sub-tabs in Data Management', async ({ page }) => {
    await page.click('button[data-tab="data-management-settings-panel"]');

    await expect(page.locator('#sources-panel')).toBeVisible();
    await expect(page.locator('#exchanges-panel')).not.toBeVisible();

    await page.click('button[data-sub-tab="exchanges-panel"]');

    await expect(page.locator('#sources-panel')).not.toBeVisible();
    await expect(page.locator('#exchanges-panel')).toBeVisible();
    await expect(page.locator('#exchange-list')).toContainText('No exchanges found.');

    await page.click('button[data-sub-tab="sources-panel"]');

    await expect(page.locator('#sources-panel')).toBeVisible();
    await expect(page.locator('#exchanges-panel')).not.toBeVisible();
    await expect(page.locator('#advice-source-list')).toContainText('No advice sources found.');
  });

  test('should switch between L2 sub-tabs in User Management', async ({ page }) => {
    await page.click('button[data-tab="user-management-settings-panel"]');

    await expect(page.locator('#users-panel')).toBeVisible();
    await expect(page.locator('#subscriptions-panel')).not.toBeVisible();
    await expect(page.locator('#account-holder-list')).toContainText('No account holders found.');

    await page.click('button[data-sub-tab="subscriptions-panel"]');

    await expect(page.locator('#users-panel')).not.toBeVisible();
    await expect(page.locator('#subscriptions-panel')).toBeVisible();
    await expect(page.locator('#subscriptions-panel-title')).toBeVisible();

    await page.click('button[data-sub-tab="users-panel"]');

    await expect(page.locator('#users-panel')).toBeVisible();
    await expect(page.locator('#subscriptions-panel')).not.toBeVisible();
  });
});
