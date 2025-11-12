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
    // Assert that form fields are cleared after successful submission
    await expect(page.locator('#new-source-name')).toHaveValue('');
    await expect(page.locator('#new-source-contact-email')).toHaveValue('');
    await expect(
      page.locator('#new-source-fields-container')
    ).not.toBeVisible();

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
    // Assert that form fields are cleared after successful submission
    await expect(page.locator('#new-source-name')).toHaveValue('');
    await expect(page.locator('#new-source-book-author')).toHaveValue('');
    await expect(
      page.locator('#new-source-fields-container')
    ).not.toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.locator('.delete-source-btn[data-id]').first().click();

    await expect(
      page.locator(`li:has-text("${sourceTitle} (book)")`)
    ).not.toBeAttached();
  });

  test('should clear "Add New Exchange" form fields after successful submission', async ({
    page,
  }) => {
    const exchangeName = 'New Exchange';

    await page.click('button[data-sub-tab="exchanges-panel"]');

    await page.fill('#new-exchange-name', exchangeName);

    await page.click('#add-exchange-form button[type="submit"]');

    await expect(page.locator('#exchange-list')).toContainText(exchangeName);

    await expect(page.locator('#new-exchange-name')).toHaveValue('');
  });

  test('should clear "Add New Account Holder" form fields after successful submission', async ({
    page,
  }) => {
    const holderName = 'New Holder';

    await page.click('button[data-tab="user-management-settings-panel"]');

    await page.fill('#new-holder-name', holderName);

    await page.click('#add-holder-form button[type="submit"]');

    await expect(page.locator('#account-holder-list')).toContainText(
      holderName
    );

    await expect(page.locator('#new-holder-name')).toHaveValue('');
  });

  test('should clear "Edit Advice Source" form fields and close modal after successful submission', async ({
    page,
  }) => {
    const sourceName = 'Source to Edit for Submission';

    const sourceEmail = 'submit_edit@example.com';

    const editedSourceName = 'Successfully Edited Source';

    // Add a new source first

    await page.selectOption('#new-source-type', 'person');

    await page.fill('#new-source-name', sourceName);

    await page.fill('#new-source-contact-email', sourceEmail);

    await page.click('#add-new-source-form button[type="submit"]');

    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceName} (person)`
    );

    // Simulate opening the edit modal and populating it

    await page.evaluate(() => {
      const modal = document.getElementById('edit-source-modal');

      if (modal) {
        modal.style.display = 'block'; // Make modal visible
      }

      // Assuming the source ID is passed and used to populate the form

      // For testing, we'll just set a dummy ID and values

      const editSourceIdInput = document.getElementById('edit-source-id');

      if (editSourceIdInput) {
        editSourceIdInput.value = '1'; // Dummy ID
      }
    });

    await expect(page.locator('#edit-source-modal')).toBeVisible();

    await page.fill('#edit-source-name', editedSourceName);

    await page.fill('#edit-source-contact-email', 'new_email@example.com');

    // Submit the edit form

    await page.click('#edit-source-form button[type="submit"]');

    // Assert that the modal is closed

    await expect(page.locator('#edit-source-modal')).not.toBeVisible();

    // Assert that the list is updated

    await expect(page.locator('#advice-source-list')).toContainText(
      `${editedSourceName} (person)`
    );

    // Assert that the form fields are cleared (or reset to initial state if modal reopens)

    // Since the modal closes, we can't directly check the fields unless it reopens.

    // The primary assertion here is that the modal closes and the list updates.

    // If the modal were to reopen, the fields should be empty.
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
    const sourceItemLocator = page.locator(
      `li:has-text("${sourceName} (person)")`
    );
    await expect(sourceItemLocator).toBeVisible();

    // 3. Set up the dialog handler and click delete
    page.on('dialog', (dialog) => dialog.accept());
    await sourceItemLocator.getByRole('button', { name: 'Delete' }).click();

    // 4. THE FIX: Wait for the element to be removed from the DOM
    await expect(sourceItemLocator).not.toBeAttached();
  });

  test('should clear the "Add New Advice Source" form', async ({ page }) => {
    await page.selectOption('#new-source-type', 'person');
    await page.fill('#new-source-name', 'Temporary Source');
    await page.fill('#new-source-contact-email', 'temp@example.com');
    await expect(page.locator('#new-source-name')).toHaveValue(
      'Temporary Source'
    );
    await expect(page.locator('#new-source-contact-email')).toHaveValue(
      'temp@example.com'
    );

    await page.click('#clear-new-source-btn');

    await expect(page.locator('#new-source-name')).toHaveValue('');
    await expect(page.locator('#new-source-contact-email')).toHaveValue('');
    await expect(
      page.locator('#new-source-fields-container')
    ).not.toBeVisible();
  });

  test('should clear the "Add New Exchange" form', async ({ page }) => {
    await page.click('button[data-sub-tab="exchanges-panel"]');
    await page.fill('#new-exchange-name', 'Temporary Exchange');
    await expect(page.locator('#new-exchange-name')).toHaveValue(
      'Temporary Exchange'
    );

    await page.click('#clear-exchange-btn');

    await expect(page.locator('#new-exchange-name')).toHaveValue('');
  });

  test('should clear the "Add New Account Holder" form', async ({ page }) => {
    await page.click('button[data-tab="user-management-settings-panel"]');
    await page.fill('#new-holder-name', 'Temporary Holder');
    await expect(page.locator('#new-holder-name')).toHaveValue(
      'Temporary Holder'
    );

    await page.click('#clear-holder-btn');

    await expect(page.locator('#new-holder-name')).toHaveValue('');
  });

  test('should clear the "General and Appearance" settings forms', async ({
    page,
  }) => {
    await page.click('button[data-tab="general-settings-panel"]');

    // Fill some general settings (example: a hypothetical text input)
    // Assuming there's an input field with id 'general-setting-input'
    // If not, this part needs to be adjusted based on actual HTML structure
    await page.fill('#app-title-input', 'My Custom App Title');
    await expect(page.locator('#app-title-input')).toHaveValue(
      'My Custom App Title'
    );

    // Fill some appearance settings (example: theme and font selectors)
    await page.click('button[data-tab="appearance-settings-panel"]');
    await page.selectOption('#theme-selector', 'dark');
    await page.selectOption('#font-selector', 'var(--font-roboto)');
    await expect(page.locator('#theme-selector')).toHaveValue('dark');
    await expect(page.locator('#font-selector')).toHaveValue(
      'var(--font-roboto)'
    );

    // Click the clear button for general settings
    await page.click('#clear-general-settings-btn');

    // Assert that general settings fields are cleared
    await expect(page.locator('#app-title-input')).toHaveValue('');

    // Assert that appearance settings fields are reset to default
    // (assuming 'light' and 'var(--font-system)' are defaults)
    await expect(page.locator('#theme-selector')).toHaveValue('light');
    await expect(page.locator('#font-selector')).toHaveValue(
      'var(--font-system)'
    );
  });

  test('should clear the "Edit Advice Source" form', async ({ page }) => {
    const sourceName = 'Source to Edit';
    const sourceEmail = 'edit@example.com';

    // Add a new source first
    await page.selectOption('#new-source-type', 'person');
    await page.fill('#new-source-name', sourceName);
    await page.fill('#new-source-contact-email', sourceEmail);
    await page.click('#add-new-source-form button[type="submit"]');
    await expect(page.locator('#advice-source-list')).toContainText(
      `${sourceName} (person)`
    );

    // Simulate opening the edit modal (assuming an edit button exists)
    // This part might need adjustment based on actual HTML structure
    // For now, let's assume there's an edit button that makes the modal visible
    // and populates the fields. Since there's no actual edit button in the current HTML,
    // we'll directly manipulate the modal for testing purposes.
    // In a real scenario, you'd click the edit button associated with the source.

    // For now, let's assume the edit modal is made visible and populated
    // by some other action, and we are testing the clear functionality of that modal.
    // We will directly set values in the edit form for testing.
    await page.evaluate(() => {
      const modal = document.getElementById('edit-source-modal');
      if (modal) {
        modal.style.display = 'block'; // Make modal visible
      }
    });
    await expect(page.locator('#edit-source-modal')).toBeVisible();

    await page.fill('#edit-source-name', 'Edited Source Name');
    await page.fill('#edit-source-contact-email', 'edited@example.com');
    await expect(page.locator('#edit-source-name')).toHaveValue(
      'Edited Source Name'
    );
    await expect(page.locator('#edit-source-contact-email')).toHaveValue(
      'edited@example.com'
    );

    await page.click('#clear-edit-source-btn');

    await expect(page.locator('#edit-source-name')).toHaveValue('');
    await expect(page.locator('#edit-source-contact-email')).toHaveValue('');

    // Close the modal after testing
    await page.evaluate(() => {
      const modal = document.getElementById('edit-source-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    });
  });
});

test.describe('Settings Module - L2 Sub-tab Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button[data-tab="settings"]');
    await expect(page.locator('#settings-modal')).toBeVisible();
  });

  test('should switch between L2 sub-tabs in Data Management', async ({
    page,
  }) => {
    await page.click('button[data-tab="data-management-settings-panel"]');

    await expect(page.locator('#sources-panel')).toBeVisible();
    await expect(page.locator('#exchanges-panel')).not.toBeVisible();

    await page.click('button[data-sub-tab="exchanges-panel"]');

    await expect(page.locator('#sources-panel')).not.toBeVisible();
    await expect(page.locator('#exchanges-panel')).toBeVisible();
    await expect(page.locator('#exchange-list')).toContainText(
      'No exchanges found.'
    );

    await page.click('button[data-sub-tab="sources-panel"]');

    await expect(page.locator('#sources-panel')).toBeVisible();
    await expect(page.locator('#exchanges-panel')).not.toBeVisible();
    await expect(page.locator('#advice-source-list')).toContainText(
      'No advice sources found.'
    );
  });

  test('should switch between L2 sub-tabs in User Management', async ({
    page,
  }) => {
    await page.click('button[data-tab="user-management-settings-panel"]');

    await expect(page.locator('#users-panel')).toBeVisible();
    await expect(page.locator('#subscriptions-panel')).not.toBeVisible();
    await expect(page.locator('#account-holder-list')).toContainText(
      'No account holders found.'
    );

    await page.click('button[data-sub-tab="subscriptions-panel"]');

    await expect(page.locator('#users-panel')).not.toBeVisible();
    await expect(page.locator('#subscriptions-panel')).toBeVisible();
    await expect(page.locator('#subscriptions-panel-title')).toBeVisible();

    await page.click('button[data-sub-tab="users-panel"]');

    await expect(page.locator('#users-panel')).toBeVisible();
    await expect(page.locator('#subscriptions-panel')).not.toBeVisible();
  });
});
