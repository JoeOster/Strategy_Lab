// public/js/modules/settings/index.js

import * as handlers from './handlers.js';

export function initializeSettingsModule() {
  console.log('Settings module initialized.');

  // Main tab navigation
  document.querySelectorAll('.settings-tab').forEach((button) => {
    button.addEventListener('click', handlers.handleMainTabClick);
  });

  // Data Management sub-tab navigation
  document.querySelectorAll('.data-sub-tab').forEach((button) => {
    button.addEventListener('click', handlers.handleDataSubTabClick);
  });

  // User Management sub-tab navigation
  document.querySelectorAll('.user-sub-tab').forEach((button) => {
    button.addEventListener('click', handlers.handleUserSubTabClick);
  });

  // Close button
  document
    .querySelector('.close-button')
    .addEventListener('click', handlers.handleCloseModal);

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

  // Initial load of the sources list
  handlers.loadSourcesList();
}
