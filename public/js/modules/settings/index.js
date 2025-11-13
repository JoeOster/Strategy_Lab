// public/js/modules/settings/index.js

import { handleFontChange, handleThemeChange } from './appearance.handlers.js';
import * as handlers from './handlers.js';
import {
  handleAddNewSourceSubmit,
  handleDeleteSourceClick,
  handleSourceTypeChange,
} from './sources.handlers.js';
import * as usersHandlers from './users.handlers.js';

export { loadAppearanceSettings } from './appearance.handlers.js';

export function initializeSettingsModule() {
  console.log('Settings module initialized.');

  // Main tab navigation
  for (const button of document.querySelectorAll('.settings-tab')) {
    button.addEventListener('click', handlers.handleMainTabClick);
  }

  // Sub-tab navigation (using event delegation)
  const subtabsContainers = document.querySelectorAll('.settings-sub-tabs');
  for (const container of subtabsContainers) {
    container.addEventListener('click', handlers.handleSubTabClick);
  }

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

  // Clear general settings button
  const clearGeneralSettingsBtn = document.getElementById(
    'clear-general-settings-button'
  );
  if (clearGeneralSettingsBtn) {
    clearGeneralSettingsBtn.addEventListener(
      'click',
      handlers.handleClearGeneralAndAppearanceForms
    );
  }

  // Theme selection
  const themeSelect = document.getElementById('theme-selector');
  if (themeSelect) {
    themeSelect.addEventListener('change', handleThemeChange);
  }

  // Font selection
  const fontSelect = document.getElementById('font-selector');
  if (fontSelect) {
    fontSelect.addEventListener('change', handleFontChange);
  }

  // Source type dropdowns
  const newSourceType = document.getElementById('new-source-type');
  if (newSourceType) {
    newSourceType.addEventListener('change', (event) =>
      handleSourceTypeChange(event, 'new')
    );
    // Trigger once to set initial state
    handleSourceTypeChange({ target: newSourceType }, 'new');
  }

  const editSourceType = document.getElementById('edit-source-type');
  if (editSourceType) {
    editSourceType.addEventListener('change', (event) =>
      handleSourceTypeChange(event, 'edit')
    );
  }

  // Add new source form submission
  const addNewSourceForm = document.getElementById('add-new-source-form');
  if (addNewSourceForm) {
    addNewSourceForm.addEventListener('submit', handleAddNewSourceSubmit);
  }

  // Clear new source form button
  const clearNewSourceBtn = document.getElementById('clear-new-source-btn');
  if (clearNewSourceBtn) {
    clearNewSourceBtn.addEventListener(
      'click',
      handlers.handleClearNewSourceForm
    );
  }

  // Clear exchange form button
  const clearExchangeBtn = document.getElementById('clear-exchange-btn');
  if (clearExchangeBtn) {
    clearExchangeBtn.addEventListener(
      'click',
      handlers.handleClearExchangeForm
    );
  }

  // Clear holder form button
  const clearHolderBtn = document.getElementById('clear-holder-btn');
  if (clearHolderBtn) {
    clearHolderBtn.addEventListener('click', handlers.handleClearHolderForm);
  }

  // Clear edit source form button
  const clearEditSourceBtn = document.getElementById(
    'clear-edit-source-button'
  );
  if (clearEditSourceBtn) {
    clearEditSourceBtn.addEventListener(
      'click',
      handlers.handleClearEditSourceForm
    );
  }

  // Edit source form submission
  const editSourceForm = document.getElementById('edit-source-form');
  if (editSourceForm) {
    editSourceForm.addEventListener('submit', handlers.handleEditSourceSubmit);
  }

  // Placeholder for handling the edit source form submission.
  // This will be replaced with actual logic when the edit modal is properly implemented.
  // export function handleEditSourceSubmit(event) {
  //   console.log('handleEditSourceSubmit called (placeholder)');
  //   event.preventDefault();
  // }

  // Event delegation for deleting sources
  const sourcesContainer = document.getElementById('advice-source-list');
  if (sourcesContainer) {
    sourcesContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-source-btn')) {
        const sourceId = event.target.dataset.id;
        handleDeleteSourceClick(sourceId);
      }
    });
  }

  // Add new holder form submission
  const addHolderForm = document.getElementById('add-holder-form');
  if (addHolderForm) {
    addHolderForm.addEventListener(
      'submit',
      usersHandlers.handleAddHolderSubmit
    );
  }

  // Event delegation for deleting holders
  const accountHolderList = document.getElementById('account-holder-list');
  if (accountHolderList) {
    accountHolderList.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-holder-btn')) {
        const holderId = event.target.dataset.id;
        usersHandlers.handleDeleteHolderClick(holderId);
      } else if (event.target.classList.contains('set-default-holder-btn')) {
        const holderId = event.target.dataset.id;
        usersHandlers.handleSetDefaultHolderClick(event, holderId);
      } else if (event.target.classList.contains('manage-subscriptions-btn')) {
        const holderId = event.target.dataset.id;
        usersHandlers.handleManageSubscriptionsClick(event, holderId);
      }
    });
  }
}
