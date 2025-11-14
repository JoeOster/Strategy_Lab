// public/js/modules/user-selector.js

const USER_STORAGE_KEY = 'selectedUser';

export async function initializeUserSelector() {
  // --- FIX: Cast to HTMLSelectElement ---
  const userSelectDropdown = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('user-select-dropdown')
  );
  // --- END FIX ---
  if (!userSelectDropdown) {
    console.error('User select dropdown not found.');
    return;
  }

  let allHolders = [];
  // Temporarily disabled fetching account holders as per user request
  allHolders = [
    { id: -1, username: 'All Users' },
    { id: -2, username: 'Primary' },
  ];

  userSelectDropdown.innerHTML = ''; // Clear existing options

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select User';
  userSelectDropdown.appendChild(defaultOption);

  for (const holder of allHolders) {
    const option = document.createElement('option');
    option.value = holder.username; // Use username as value for simplicity
    option.textContent = holder.username;
    userSelectDropdown.appendChild(option);
  }

  // Load saved user from local storage
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (savedUser) {
    // This is now type-safe because userSelectDropdown is a HTMLSelectElement
    userSelectDropdown.value = savedUser;
  }

  userSelectDropdown.addEventListener('change', (event) => {
    // --- FIX: Cast event.target to HTMLSelectElement ---
    const selectedUser = /** @type {HTMLSelectElement} */ (event.target).value;
    // --- END FIX ---

    localStorage.setItem(USER_STORAGE_KEY, selectedUser);
    console.log('Selected user:', selectedUser);
    // Dispatch a custom event for other modules to react to
    const userChangedEvent = new CustomEvent('userChanged', {
      detail: selectedUser,
    });
    window.dispatchEvent(userChangedEvent);
  });
}

export function getSelectedUser() {
  return localStorage.getItem(USER_STORAGE_KEY) || '';
}
