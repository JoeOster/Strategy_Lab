// public/js/modules/settings/index.js

import {
  handleFontChange,
  handleThemeChange,
  initializeAppearanceTab,
} from './appearance.handlers.js';
import * as exchangesHandlers from './exchanges.handlers.js';
import * as handlers from './handlers.js';
// Import all needed functions from sources.handlers.js
import {
  closeSourceFormModal,
  handleClearSourceForm, // Import the new clear function
  handleDeleteSourceClick, // Added missing import
  handleSourceFormSubmit,
  handleSourceTypeChange,
  openSourceFormModal,
  updateImagePreview,
} from './sources.handlers.js';
import * as usersHandlers from './users.handlers.js'; // This import is now USED
import { loadAccountHoldersList } from './users.handlers.js';

export function initializeModule() {
  console.log('Settings module initialized.');

  initializeAppearanceTab();
  loadAccountHoldersList();

  // Stop the General Settings form from reloading the page
  const generalForm = document.getElementById('general-settings-form');
  if (generalForm) {
    generalForm.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('General settings save clicked');
      // TODO: Add logic to save general settings
      alert('General settings saved (demo)');
    });
  }

  // Stop the Appearance Settings form from reloading the page
  const appearanceForm = document.getElementById('appearance-settings-form');
  if (appearanceForm) {
    appearanceForm.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Appearance settings save clicked');
      // Note: Themes/fonts are already saved *on change*
      alert('Appearance settings saved!');
    });
  }

  // Main tab navigation
  for (const button of document.querySelectorAll('.settings-tab')) {
    button.addEventListener('click', handlers.handleMainTabClick);
  }

  // Explicitly activate the default tab (General) and load its content
  const defaultTab = document.querySelector(
    '.settings-tab[data-tab="general-settings-panel"]'
  );
  if (defaultTab) {
    // Simulate a click on the default tab to trigger its activation and content loading
    handlers.handleMainTabClick({ target: defaultTab });
  }

  // Sub-tab navigation (using event delegation)
  const subtabsContainers = document.querySelectorAll('.settings-sub-tabs');
  for (const container of subtabsContainers) {
    container.addEventListener('click', handlers.handleSubTabClick);
  }

  // Delegated event listener for all change events within the settings page
  const appContainer = document.getElementById('app-container');
  if (appContainer) {
    appContainer.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      switch (target.id) {
        case 'theme-selector':
          handleThemeChange(event);
          break;
        case 'font-selector':
          handleFontChange(event);
          break;
        case 'source-form-type':
          handleSourceTypeChange(
            /** @type {HTMLSelectElement} */ (target).value
          );
          break;
      }
    });
  }

  // Listeners for the new single modal
  const sourceFormModal = document.getElementById('source-form-modal');
  if (sourceFormModal) {
    // Form submission
    const sourceForm = document.getElementById('source-form-form');
    if (sourceForm) {
      sourceForm.addEventListener('submit', handleSourceFormSubmit);
    }

    // Close button
    const closeButton = sourceFormModal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', closeSourceFormModal);
    }

    // Clear button
    const clearButton = document.getElementById('source-form-clear-btn');
    if (clearButton) {
      clearButton.addEventListener('click', handleClearSourceForm); // Use the new function
    }

    // Live image preview listener
    sourceFormModal.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;

      if (target.id === 'source-form-image-path') {
        const typeSelect = /** @type {HTMLSelectElement | null} */ (
          document.getElementById('source-form-type')
        );
        if (typeSelect) {
          updateImagePreview(typeSelect.value, target.value);
        }
      }
    });
  }

  // --- START: FIX ---
  // Listener for the "Add New Source" button
  const addSourceBtn = document.getElementById('open-add-source-btn');
  if (addSourceBtn) {
    addSourceBtn.addEventListener('click', () => {
      openSourceFormModal(null); // Open in "Add" mode
    });
  }
  // --- END: FIX ---

  // Save settings button
  const saveSettingsButton = document.getElementById('save-settings-button');
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener(
      'click',
      handlers.handleSaveAllSettings
    );
  }

  // Clear general settings button
  const clearGeneralSettingsBtn = document.getElementById(
    'clear-general-settings-btn'
  );
  if (clearGeneralSettingsBtn) {
    clearGeneralSettingsBtn.addEventListener('click', () =>
      handlers.handleClearGeneralAndAppearanceForms()
    );
  }

  // Add new exchange form submission
  const addExchangeForm = document.getElementById('add-exchange-form');
  if (addExchangeForm) {
    addExchangeForm.addEventListener(
      'submit',
      exchangesHandlers.handleAddExchangeSubmit
    );
  }

  // Clear exchange form button
  const clearExchangeBtn = document.getElementById('clear-exchange-btn');
  if (clearExchangeBtn) {
    clearExchangeBtn.addEventListener('click', () =>
      handlers.handleClearExchangeForm()
    );
  }

  // Clear holder form button
  const clearHolderBtn = document.getElementById('clear-holder-btn');
  if (clearHolderBtn) {
    // @ts-ignore
    clearHolderBtn.addEventListener('click', () =>
      usersHandlers.handleClearHolderForm()
    );
  }

  // Clear web app form button
  const clearWebAppBtn = document.getElementById('clear-webapp-btn');
  if (clearWebAppBtn) {
    clearWebAppBtn.addEventListener('click', () =>
      handlers.handleClearWebAppForm()
    );
  }

  // Close button for source-detail-modal
  const sourceDetailModal = document.getElementById('source-detail-modal');
  if (sourceDetailModal) {
    const closeButton = sourceDetailModal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        // @ts-ignore
        sourceDetailModal.style.display = 'none';
      });
    } else {
      console.error('Close button not found within source detail modal.');
    }
  }

  // Event delegation for deleting/editing sources
  const sourcesContainer = document.getElementById('advice-source-list');
  if (sourcesContainer) {
    sourcesContainer.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target;
      // @ts-ignore
      const sourceId = target.dataset.id;

      if (target.classList.contains('delete-source-btn') && sourceId) {
        handleDeleteSourceClick(sourceId);
      }
      if (target.classList.contains('edit-source-btn') && sourceId) {
        openSourceFormModal(sourceId);
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

  // Event delegation for user-list actions
  const accountHolderList = document.getElementById('account-holder-list');
  if (accountHolderList) {
    accountHolderList.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target;
      // @ts-ignore
      const holderId = target.dataset.id;

      if (!holderId) return;

      if (target.classList.contains('delete-holder-btn')) {
        // @ts-ignore
        usersHandlers.handleDeleteHolderClick(holderId);
      } else if (target.classList.contains('set-default-holder-btn')) {
        // @ts-ignore
        usersHandlers.handleSetDefaultHolderClick(event, holderId);
      } else if (target.classList.contains('manage-subscriptions-btn')) {
        // @ts-ignore
        usersHandlers.handleManageSubscriptionsClick(event, holderId);
      }
    });
  }

  // Event delegation for deleting exchanges
  const exchangesContainer = document.getElementById('exchange-list');
  if (exchangesContainer) {
    exchangesContainer.addEventListener('click', (event) => {
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target;
      if (target.classList.contains('delete-exchange-btn')) {
        // @ts-ignore
        const exchangeId = target.dataset.id;
        if (exchangeId) {
          exchangesHandlers.handleDeleteExchangeClick(exchangeId);
        }
      }
    });
  }
}