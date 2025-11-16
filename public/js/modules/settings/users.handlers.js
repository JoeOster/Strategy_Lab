// public/js/modules/settings/users.handlers.js
import {
  addAccountHolder,
  getAccountHolders,
  setDefaultAccountHolder,
  deleteAccountHolder,
} from './users.api.js';

// --- START: ADD CACHE ---
let cachedHolders = null;
// --- END: ADD CACHE ---

/**
 * Renders the list of account holders into the container.
 * @param {Array<object>} holders - The array of holder objects.
 * @param {HTMLElement} container - The container element to render into.
 */
function renderAccountHoldersList(holders, container) {
  if (!holders || holders.length === 0) {
    container.innerHTML = '<p>No users found.</p>';
    return;
  }

  // Create list
  const list = document.createElement('ul');
  list.className = 'settings-list'; // A generic class
  for (const holder of holders) {
    const item = document.createElement('li');
    item.className = 'account-holder-item'; // From components.css
    item.innerHTML = `
      <span class="holder-name">${holder.holder_name} ${
        holder.is_default ? '(Default)' : ''
      }</span>
      <div class="holder-actions">
        <button class="btn btn-secondary table-action-btn set-default-holder-btn" data-id="${
          holder.id
        }" ${holder.is_default ? 'disabled' : ''}>Set Default</button>
        <button class="btn btn-secondary table-action-btn manage-subscriptions-btn" data-id="${
          holder.id
        }" style="display:none;">Manage Subscriptions</button>
        <button class="btn btn-danger table-action-btn delete-holder-btn" data-id="${
          holder.id
        }">Delete</button>
      </div>
    `;
    list.appendChild(item);
  }
  container.innerHTML = ''; // Clear "Loading..."
  container.appendChild(list);
}

/**
 * Handles the submission of the "Add New Holder" form.
 * @param {Event} event - The form submission event.
 */
export async function handleAddHolderSubmit(event) {
  event.preventDefault(); // Stop the form from reloading the page
  console.log('handleAddHolderSubmit called');

  const form = /** @type {HTMLFormElement} */ (event.target);
  const formData = new FormData(form);
  const holderName = formData.get('holder_name');

  if (!holderName) {
    alert('Please enter a holder name.');
    return;
  }

  try {
    await addAccountHolder(holderName);
    // --- START: CACHE ---
    cachedHolders = null; // Invalidate cache
    // --- END: CACHE ---
    form.reset(); // Clear the form
    loadAccountHoldersList(); // Refresh the list
  } catch (error) {
    console.error('Error adding holder:', error);
    alert('Failed to add holder. See console for details.');
  }
}

/**
 * Loads and renders the list of account holders.
 */
export async function loadAccountHoldersList() {
  const container = document.getElementById('account-holder-list');
  if (!container) {
    console.error('Account holder list container not found.');
    return;
  }

  // --- START: CACHE ---
  // If we have cached data, use it instead of fetching
  if (cachedHolders) {
    console.log('Loading users from cache...');
    renderAccountHoldersList(cachedHolders, container);
    return;
  }
  // --- END: CACHE ---

  container.innerHTML = '<p>Loading users...</p>'; // Placeholder

  try {
    const holders = await getAccountHolders();
    // --- START: CACHE ---
    cachedHolders = holders; // Store the data in cache
    // --- END: CACHE ---
    renderAccountHoldersList(holders, container);
  } catch (error) {
    console.error('Error loading account holders:', error);
    container.innerHTML = '<p class="error">Failed to load users.</p>';
  }
}

/**
 * Handles setting a holder as the default.
 * @param {Event} event - The click event.
 * @param {string} holderId - The ID of the holder to set as default.
 */
export async function handleSetDefaultHolderClick(event, holderId) {
  try {
    await setDefaultAccountHolder(holderId);
    // --- START: CACHE ---
    cachedHolders = null; // Invalidate cache
    // --- END: CACHE ---
    loadAccountHoldersList(); // Refresh the list to show new default
  } catch (error) {
    console.error('Error setting default holder:', error);
    alert('Failed to set default holder. See console for details.');
  }
}

/**
 * Handles deleting a holder.
 * @param {string} holderId - The ID of the holder to delete.
 */
export async function handleDeleteHolderClick(holderId) {
  if (!confirm('Are you sure you want to delete this holder?')) {
    return;
  }

  try {
    await deleteAccountHolder(holderId);
    // --- START: CACHE ---
    cachedHolders = null; // Invalidate cache
    // --- END: CACHE ---
    loadAccountHoldersList(); // Refresh the list
  } catch (error) {
    console.error('Error deleting holder:', error);
    alert('Failed to delete holder. See console for details.');
  }
}

/**
 * Handles clicks on the "Manage Subscriptions" button. (Placeholder)
 * @param {Event} event - The click event.
 * @param {string} holderId - The ID of the holder.
 */
export function handleManageSubscriptionsClick(event, holderId) {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const settingsPanel = event.target.closest('.settings-panel');

  if (settingsPanel) {
    for (const tab of settingsPanel.querySelectorAll('.settings-sub-tab')) {
      tab.classList.remove('active');
    }
    for (const panel of settingsPanel.querySelectorAll('.sub-panel')) {
      panel.classList.remove('active');
    }

    // 2. Activate the "Subscriptions" tab and panel
    const subsTab = settingsPanel.querySelector(
      '[data-sub-tab="subscriptions-panel"]'
    );
    const subsPanel = settingsPanel.querySelector('#subscriptions-panel');
    if (subsTab && subsPanel) {
      subsTab.classList.add('active');
      subsPanel.classList.add('active');
      // 3. Load the subscriptions for that user
      loadSubscriptionsForUser(holderId);
    }
  }
}

/**
 * Loads subscriptions for a specific user. (Placeholder)
 * @param {string} holderId - The ID of the user.
 */
export async function loadSubscriptionsForUser(holderId) {
  const container = document.getElementById('subscriptions-list');
  if (!container) return;

  // Store the holderId on the container for later use
  container.dataset.holderId = holderId;

  container.innerHTML = `<p>Loading subscriptions for user ${holderId}...</p>`;
  // TODO: Implement API call api.getSubscriptions(holderId)
  // For now, just a placeholder:
  setTimeout(() => {
    container.innerHTML = `
      <h4>Subscriptions for User ${holderId}</h4>
      <p>(Subscription management is not yet implemented.)</p>
      <div class="form-actions">
          <button class="btn btn-secondary" id="back-to-users-btn">Back to Users</button>
      </div>
    `;

    // Add event listener for the "Back" button
    const backBtn = document.getElementById('back-to-users-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Find and click the "Users" sub-tab to return
        const usersTab = document.querySelector(
          '[data-sub-tab="users-panel"]'
        );
        if (usersTab instanceof HTMLElement) {
          usersTab.click();
        }
      });
    }
  }, 500);
}

/**
 * Handles clearing the "Add Holder" form.
 */
export function handleClearHolderForm() {
  const form = /** @type {HTMLFormElement} */ (
    document.getElementById('add-holder-form')
  );
  if (form) {
    form.reset();
  }
}