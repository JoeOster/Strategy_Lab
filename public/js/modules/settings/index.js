// public/js/modules/settings/index.js

import {
  handleFontChange,
  handleThemeChange,
  loadAppearanceSettings,
} from './appearance.handlers.js';
import * as exchangesHandlers from './exchanges.handlers.js';
import * as handlers from './handlers.js';
import {
  handleAddNewSourceSubmit,
  handleDeleteSourceClick,
  handleEditSourceSubmit, // Import the new handler
  handleSourceTypeChange,
} from './sources.handlers.js';
import * as usersHandlers from './users.handlers.js';

import { loadAccountHoldersList } from './users.handlers.js';

export { loadAppearanceSettings };

export function initializeSettingsModule() {
  console.log('Settings module initialized.');
  handlers.loadGeneralSettings();
  loadAccountHoldersList();

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

    // Delegated event listener for all change events within the modal
    settingsModal.addEventListener('change', (event) => {
      const targetId = event.target.id;
      switch (targetId) {
        case 'theme-selector':
          handleThemeChange(event);
          break;
        case 'font-selector':
          handleFontChange(event);
          break;
        case 'new-source-type':
          handleSourceTypeChange(event, 'new');
          break;
        case 'edit-source-type':
          handleSourceTypeChange(event, 'edit');
          break;
      }
    });

    // Trigger once to set initial state for the new source form
    const newSourceType = document.getElementById('new-source-type');
    if (newSourceType) {
      handleSourceTypeChange({ target: newSourceType }, 'new');
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

  // Add new source form submission
  const addNewSourceForm = document.getElementById('add-new-source-form');
  if (addNewSourceForm) {
    addNewSourceForm.addEventListener('submit', handleAddNewSourceSubmit);
  }

  // Add new exchange form submission
  const addExchangeForm = document.getElementById('add-exchange-form');
  if (addExchangeForm) {
    addExchangeForm.addEventListener(
      'submit',
      exchangesHandlers.handleAddExchangeSubmit
    );
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

  // Clear web app form button
  const clearWebAppBtn = document.getElementById('clear-webapp-btn');
  if (clearWebAppBtn) {
    clearWebAppBtn.addEventListener('click', handlers.handleClearWebAppForm);
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
    editSourceForm.addEventListener('submit', handleEditSourceSubmit);
  }

  // Close button for source-detail-modal
  const sourceDetailModal = document.getElementById('source-detail-modal');
  if (sourceDetailModal) {
    const closeButton = sourceDetailModal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        sourceDetailModal.style.display = 'none';
      });
    } else {
      console.error('Close button not found within source detail modal.');
    }
  }

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

  // Event delegation for deleting exchanges
  const exchangesContainer = document.getElementById('exchange-list');
  if (exchangesContainer) {
    exchangesContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('delete-exchange-btn')) {
        const exchangeId = event.target.dataset.id;
        exchangesHandlers.handleDeleteExchangeClick(exchangeId);
      }
    });
  }
}
