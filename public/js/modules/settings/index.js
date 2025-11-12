// public/js/modules/settings/index.js

import * as handlers from './handlers.js';

export { loadUserPreferences } from './handlers.js';

export function initializeSettingsModule() {
  console.log('Settings module initialized.');

  // Main tab navigation
  for (const button of document.querySelectorAll('.settings-tab')) {
    button.addEventListener('click', handlers.handleMainTabClick);
  }

  // Sub-tab navigation (using event delegation)
  const subtabsContainers = document.querySelectorAll('.settings-sub-tabs');
  for (const container of subtabsContainers) {
  container.addEventListener('click', handlers.handleSubTabClick);  }

  // Close button
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    const closeButton = settingsModal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', handlers.handleCloseModal);
    } else {
      console.error('Close button not found within settings modal.');
    }
  } else {
    console.error('Settings modal not found.');
  }

  // Save settings button
  document
    .getElementById('save-settings-button')
    .addEventListener('click', handlers.handleSaveAllSettings);

  // Source type dropdowns
  const newSourceType = document.getElementById('new-source-type');
  if (newSourceType) {
    newSourceType.addEventListener('change', (event) =>
      handlers.handleSourceTypeChange(event, 'new')
    );
    // Trigger once to set initial state
    handlers.handleSourceTypeChange({ target: newSourceType }, 'new');
  }

  const editSourceType = document.getElementById('edit-source-type');
  if (editSourceType) {
    editSourceType.addEventListener('change', (event) =>
      handlers.handleSourceTypeChange(event, 'edit')
    );
  }

  // Add new source form submission
  const addNewSourceForm = document.getElementById('add-new-source-form');
  if (addNewSourceForm) {
    addNewSourceForm.addEventListener(
      'submit',
      handlers.handleAddNewSourceSubmit
    );
  }

  // Event delegation for deleting sources
  const sourcesContainer = document.getElementById('advice-source-list');
  if (sourcesContainer) {
    sourcesContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-source-btn')) {
        const sourceId = event.target.dataset.id;
        handlers.handleDeleteSourceClick(sourceId);
      }
    });
  }

  // Add new holder form submission
  const addHolderForm = document.getElementById('add-holder-form');
  if (addHolderForm) {
    addHolderForm.addEventListener('submit', handlers.handleAddHolderSubmit);
  }

  // Event delegation for deleting holders
  const accountHolderList = document.getElementById('account-holder-list');
  if (accountHolderList) {
    accountHolderList.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-holder-btn')) {
        const holderId = event.target.dataset.id;
        handlers.handleDeleteHolderClick(holderId);
      }
    });
  }

  // Initial load of the account holders list
  handlers.loadAccountHoldersList();
}
