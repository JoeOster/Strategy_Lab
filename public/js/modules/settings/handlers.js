// public/js/modules/settings/handlers.js

import { loadExchangesList } from './exchanges.handlers.js';
import { getSettings, updateSettings } from './general.api.js';
import * as sourcesHandlers from './sources.handlers.js';
import * as usersHandlers from './users.handlers.js';
import * as webappsHandlers from './webapps.handlers.js';

/**
 * Handles clicks on the main settings tabs.
 * @param {Event} event - The click event.
 */
export function handleMainTabClick(event) {
  const target = /** @type {HTMLElement} */ (event.target);
  if (!target.classList.contains('settings-tab')) return;

  // Deactivate all tabs and panels
  const tabContainer = target.closest('.settings-tabs');
  if (tabContainer) {
    for (const btn of tabContainer.querySelectorAll('.settings-tab')) {
      btn.classList.remove('active');
    }
  }

  const settingsPage = target.closest('#settings-page');
  if (settingsPage) {
    for (const panel of settingsPage.querySelectorAll('.settings-panel')) {
      panel.classList.remove('active');
    }
  }

  // Activate the clicked tab and corresponding panel
  target.classList.add('active');
  const tabId = target.dataset.tab;
  if (tabId) {
    const panel = document.getElementById(tabId);
    if (panel) {
      panel.classList.add('active');

      // --- START: SIMPLIFIED DATA LOADING ---
      // Load content ONLY for the clicked tab
      switch (tabId) {
        case 'general-settings-panel':
          loadGeneralSettings();
          break;
        case 'sources-panel':
          sourcesHandlers.loadSourcesList();
          break;
        case 'exchanges-panel':
          loadExchangesList();
          break;
        case 'webapps-panel':
          webappsHandlers.loadWebAppsList();
          break;
        case 'users-panel':
          usersHandlers.loadAccountHoldersList();
          break;
        case 'subscriptions-panel':
          // TODO: Add subscription loading logic
          break;
      }
      // --- END: SIMPLIFIED DATA LOADING ---
    }
  }
}

// --- START: REMOVED ---
// The entire handleSubTabClick function is no longer needed.
// --- END: REMOVED ---

/**
 * Loads general settings into the form.
 */
export async function loadGeneralSettings() {
  console.log('Loading general settings...');
  try {
    const settings = await getSettings();
    if (settings) {
      /** @type {HTMLInputElement} */ (
        document.getElementById('family-name')
      ).value = settings.family_name || '';
      /** @type {HTMLInputElement} */ (
        document.getElementById('take-profit-percent')
      ).value = settings.take_profit_percent || '';
      /** @type {HTMLInputElement} */ (
        document.getElementById('stop-loss-percent')
      ).value = settings.stop_loss_percent || '';
      /** @type {HTMLInputElement} */ (
        document.getElementById('notification-cooldown')
      ).value = settings.notification_cooldown || '';
    }
  } catch (error) {
    console.error('Error loading general settings:', error);
  }
}

/**
 * Saves the general settings form.
 */
export async function handleSaveGeneralSettings() {
  console.log('Saving general settings...');
  try {
    const settings = {
      family_name: /** @type {HTMLInputElement} */ (
        document.getElementById('family-name')
      ).value,
      take_profit_percent: Number.parseFloat(
        /** @type {HTMLInputElement} */ (
          document.getElementById('take-profit-percent')
        ).value
      ),
      stop_loss_percent: Number.parseFloat(
        /** @type {HTMLInputElement} */ (
          document.getElementById('stop-loss-percent')
        ).value
      ),
      notification_cooldown: Number.parseInt(
        /** @type {HTMLInputElement} */ (
          document.getElementById('notification-cooldown')
        ).value,
        10
      ),
    };

    await updateSettings(settings);
    alert('General settings saved!');
  } catch (error) {
    console.error('Error saving general settings:', error);
    alert('Error saving settings. See console for details.');
  }
}

/**
 * Clears the general and appearance settings forms.
 */
export function handleClearGeneralAndAppearanceForms() {
  const generalForm = /** @type {HTMLFormElement} */ (
    document.getElementById('general-settings-form')
  );
  if (generalForm) generalForm.reset();

  const appearanceForm = /** @type {HTMLFormElement} */ (
    document.getElementById('appearance-settings-form')
  );
  if (appearanceForm) appearanceForm.reset();
  // TODO: Reset appearance handlers to default
}

/**
 * Clears the "Add Exchange" form.
 */
export function handleClearExchangeForm() {
  const addExchangeForm = /** @type {HTMLFormElement} */ (
    document.getElementById('add-exchange-form')
  );
  if (addExchangeForm) addExchangeForm.reset();
}

/**
 * Clears the "Add Web App" form.
 */
export function handleClearWebAppForm() {
  const addWebAppForm = /** @type {HTMLFormElement} */ (
    document.getElementById('add-webapp-form')
  );
  if (addWebAppForm) addWebAppForm.reset();
}
