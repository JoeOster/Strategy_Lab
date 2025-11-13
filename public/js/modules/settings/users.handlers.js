// public/js/modules/settings/users.handlers.js

import { addAccountHolder, getAccountHolders } from './users.api.js';

export async function handleAddHolderSubmit(event) {
  event.preventDefault();
  console.log('handleAddHolderSubmit called');

  const newHolderNameInput = document.getElementById('new-holder-name');
  const name = newHolderNameInput.value.trim();

  if (!name) {
    alert('Account holder name cannot be empty.');
    return;
  }

  try {
    await addAccountHolder(name);
    newHolderNameInput.value = ''; // Clear the form
    await loadAccountHoldersList(); // Refresh the list
  } catch (error) {
    console.error('Failed to add account holder:', error);
    alert('Failed to add account holder. Please try again.');
  }
}

export async function loadAccountHoldersList() {
  console.log('loadAccountHoldersList called');
  const accountHolderListDiv = document.getElementById('account-holder-list');
  if (!accountHolderListDiv) {
    console.error('Account holder list div not found.');
    return;
  }

  try {
    const holders = await getAccountHolders();
    // Prepend default users to the list
    const defaultHolders = [
      { id: -1, username: 'All Users' },
      { id: -2, username: 'Primary' },
    ];
    const allHolders = [...defaultHolders, ...holders];

    accountHolderListDiv.innerHTML = ''; // Clear existing list

    if (allHolders.length === 0) {
      accountHolderListDiv.innerHTML = '<p>No account holders added yet.</p>';
      return;
    }

    const ul = document.createElement('ul');
    for (const holder of allHolders) {
      const li = document.createElement('li');
      li.classList.add('account-holder-item'); // Add a class for consistent styling of list items

      const nameSpan = document.createElement('span');
      nameSpan.classList.add('holder-name');
      nameSpan.textContent = holder.username;
      li.appendChild(nameSpan);

      // Add buttons for delete, set default, manage subscriptions
      // Only show action buttons for actual users, not for default "All Users" or "Primary"
      if (holder.id >= 0) {
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('holder-actions');

        actionsDiv.innerHTML = `
          <button class="set-default-holder-btn table-action-btn small-btn" data-id="${holder.id}">Set Default</button>
          <button class="manage-subscriptions-btn table-action-btn small-btn" data-id="${holder.id}">Manage Subscriptions</button>
          <button class="delete-holder-btn table-action-btn small-btn" data-id="${holder.id}">Delete</button>
        `;
        li.appendChild(actionsDiv);
      }
      ul.appendChild(li);
    }
    accountHolderListDiv.appendChild(ul);
  } catch (error) {
    console.error('Failed to load account holders:', error);
    accountHolderListDiv.innerHTML = '<p>Failed to load account holders.</p>';
  }
}

export function handleClearHolderForm() {
  console.log('handleClearHolderForm called');
  const newHolderNameInput = document.getElementById('new-holder-name');
  if (newHolderNameInput) {
    newHolderNameInput.value = '';
  }
}

export function handleSetDefaultHolderClick() {
  console.log('handleSetDefaultHolderClick called');
  // Placeholder for setting default account holder
}

export function handleManageSubscriptionsClick() {
  console.log('handleManageSubscriptionsClick called');
  // Placeholder for managing subscriptions
}

export function handleDeleteHolderClick() {
  console.log('handleDeleteHolderClick called');
  // Placeholder for deleting an account holder
}

export function loadSubscriptionsForUser() {
  console.log('loadSubscriptionsForUser called');
  // Placeholder for loading subscriptions for a user
}
