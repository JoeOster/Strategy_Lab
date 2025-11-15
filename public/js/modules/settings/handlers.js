import * as appearanceHandlers from './appearance.handlers.js';
import * as exchangesHandlers from './exchanges.handlers.js';
// public/js/modules/settings/handlers.js
import { getSettings, updateSettings } from './general.api.js';
import * as sourcesHandlers from './sources.handlers.js';
import * as usersHandlers from './users.handlers.js';
import { initializeWebAppsPanel } from './webapps.handlers.js';

/**
 * Handles clicks on the main settings tabs (e.g., General, Appearance).
 * Deactivates all main panels and activates the one corresponding to the clicked tab.
 * @param {Event} event - The click event.
 */
export function handleMainTabClick(event) {
  console.log('handleMainTabClick called for:', event.target.dataset.tab);
  // Deactivate all main tabs and panels
  for (const tab of document.querySelectorAll('.settings-tab')) {
    tab.classList.remove('active');
  }
  for (const panel of document.querySelectorAll('.settings-panel')) {
    panel.classList.remove('active');
  }
  // Deactivate all sub-panels globally
  for (const subPanel of document.querySelectorAll('.sub-panel')) {
    subPanel.classList.remove('active');
  }

  // Activate the clicked tab and its corresponding panel
  event.target.classList.add('active');
  const targetPanelId = event.target.dataset.tab;
  const panel = document.getElementById(targetPanelId);
  if (panel) {
    panel.classList.add('active');
    // Always load data for the clicked main tab
    if (targetPanelId === 'general-settings-panel') {
      loadGeneralSettings();
    } else if (targetPanelId === 'appearance-settings-panel') {
      appearanceHandlers.loadAppearanceSettings();
    } else if (targetPanelId === 'data-management-settings-panel') {
      initializeSubTabs(
        panel,
        'sources-panel', // Default to sources-panel
        sourcesHandlers.loadSourcesList
      );
    } else if (targetPanelId === 'user-management-settings-panel') {
      initializeSubTabs(
        panel,
        'users-panel',
        usersHandlers.loadAccountHoldersList
      );
    }
  } else {
    console.error(`Settings panel not found: ${targetPanelId}`);
  }
}

/**
 * Initializes the sub-tabs within a given settings panel.
 * Sets the default sub-tab and panel to active and calls the default load function.
 * @param {HTMLElement} panelElement - The parent settings panel element.
 * @param {string} defaultPanelId - The ID of the sub-panel to activate by default.
 * @param {Function} [defaultLoadFunction] - The data-loading function to call for the default panel.
 */
function initializeSubTabs(panelElement, defaultPanelId, defaultLoadFunction) {
  // Deactivate all sub-tabs and panels within the section
  for (const tab of panelElement.querySelectorAll('.settings-sub-tab')) {
    tab.classList.remove('active');
  }
  for (const panel of panelElement.querySelectorAll('.sub-panel')) {
    panel.classList.remove('active');
  }

  // Activate the default sub-tab and its panel
  const defaultTab = panelElement.querySelector(
    `[data-sub-tab="${defaultPanelId}"]`
  );
  if (defaultTab) {
    defaultTab.classList.add('active');
    const defaultPanel = document.getElementById(defaultPanelId);
    if (defaultPanel) {
      defaultPanel.classList.add('active');
      if (defaultLoadFunction) {
        defaultLoadFunction();
      }
    }
  }
}

/**
 * Handles clicks on the L2 sub-tabs (e.g., Sources, Exchanges).
 * Deactivates all sub-panels in its section and activates the correct one.
 * @param {Event} event - The click event.
 */
export function handleSubTabClick(event) {
  const clickedTab = event.target.closest('.settings-sub-tab');
  if (!clickedTab) {
    return;
  }
  event.stopPropagation();

  const targetPanelId = clickedTab.dataset.subTab;
  const settingsPanel = clickedTab.closest('.settings-panel');

  if (!settingsPanel) {
    console.error('Could not find parent settings panel.');
    return;
  }

  // Deactivate all sub-tabs and sub-panels within this section
  for (const tab of settingsPanel.querySelectorAll('.settings-sub-tab')) {
    tab.classList.remove('active');
  }
  for (const panel of settingsPanel.querySelectorAll('.sub-panel')) {
    panel.classList.remove('active');
  }

  // Activate the clicked tab and its corresponding panel
  clickedTab.classList.add('active');
  const targetPanel = settingsPanel.querySelector(`#${targetPanelId}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
    // Load data for the activated panel
    switch (targetPanelId) {
      case 'sources-panel':
        sourcesHandlers.loadSourcesList();
        break;
      case 'exchanges-panel':
        exchangesHandlers.loadExchangesList();
        break;
      case 'webapps-panel':
        initializeWebAppsPanel();
        break;
      case 'users-panel':
        usersHandlers.loadAccountHoldersList();
        break;
      case 'subscriptions-panel':
        usersHandlers.loadSubscriptionsForUser();
        break;
    }
  } else {
    console.error(`Sub-panel with ID '${targetPanelId}' not found.`);
  }
}





/**
 * Loads general settings from the database and populates the form.
 */
export async function loadGeneralSettings() {
  try {
    console.log('loadGeneralSettings called');
    const settings = await getSettings();
    console.log('Settings fetched:', settings);
    if (settings) {
      const familyNameElement = document.getElementById('family-name');
      if (familyNameElement) {
        familyNameElement.value = settings['family-name'] || '';
        console.log('family-name set to:', familyNameElement.value);
      } else {
        console.error('Element with ID "family-name" not found.');
      }

      const takeProfitElement = document.getElementById('take-profit-percent');
      if (takeProfitElement) {
        takeProfitElement.value = settings['take-profit-percent'] || '';
        console.log('take-profit-percent set to:', takeProfitElement.value);
      } else {
        console.error('Element with ID "take-profit-percent" not found.');
      }

      const stopLossElement = document.getElementById('stop-loss-percent');
      if (stopLossElement) {
        stopLossElement.value = settings['stop-loss-percent'] || '';
        console.log('stop-loss-percent set to:', stopLossElement.value);
      } else {
        console.error('Element with ID "stop-loss-percent" not found.');
      }

      const notificationCooldownElement = document.getElementById(
        'notification-cooldown'
      );
      if (notificationCooldownElement) {
        notificationCooldownElement.value =
          settings['notification-cooldown'] || '';
        console.log(
          'notification-cooldown set to:',
          notificationCooldownElement.value
        );
      } else {
        console.error('Element with ID "notification-cooldown" not found.');
      }

      const themeSelector = document.getElementById('theme-selector');
      if (themeSelector) {
        themeSelector.value = settings.theme || 'light';
        console.log('theme-selector set to:', themeSelector.value);
      } else {
        console.error('Element with ID "theme-selector" not found.');
      }

      const fontSelector = document.getElementById('font-selector');
      if (fontSelector) {
        fontSelector.value = settings.font || 'system';
        console.log('font-selector set to:', fontSelector.value);
      } else {
        console.error('Element with ID "font-selector" not found.');
      }

      // Apply the loaded appearance settings
      appearanceHandlers.loadAppearanceSettings();
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

/**
 * Handles clearing the exchange form.
 */
export function handleClearExchangeForm() {
  console.log('handleClearExchangeForm called (placeholder)');
  const addExchangeForm = document.getElementById('add-exchange-form');
  if (addExchangeForm) {
    addExchangeForm.reset();
  }
}

/**
 * Handles clearing the web app form.
 */
export function handleClearWebAppForm() {
  console.log('handleClearWebAppForm called');
  const addWebAppForm = document.getElementById('add-webapp-form');
  if (addWebAppForm) {
    addWebAppForm.reset();
  }
}

/**
 * Handles clearing the general settings form.
 */
export function handleClearGeneralSettingsForm() {
  console.log('handleClearGeneralSettingsForm called');
  const generalSettingsForm = document.getElementById('general-settings-form');
  if (generalSettingsForm) {
    generalSettingsForm.reset();
  }
}

/**
 * Handles clearing the appearance settings forms.
 */
export function handleClearAppearanceForms() {
  console.log('handleClearAppearanceForms called');
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    themeSelector.value = 'light';
    const event = new Event('change');
    themeSelector.dispatchEvent(event);
  }

  const fontSelector = document.getElementById('font-selector');
  if (fontSelector) {
    fontSelector.value = 'system';
    const event = new Event('change');
    fontSelector.dispatchEvent(event);
  }
}

/**
 * Handles clearing both the general settings and appearance forms.
 */
export function handleClearGeneralAndAppearanceForms() {
  console.log('handleClearGeneralAndAppearanceForms called');
  handleClearGeneralSettingsForm();
  handleClearAppearanceForms();
}
