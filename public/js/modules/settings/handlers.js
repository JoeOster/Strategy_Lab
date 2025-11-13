// public/js/modules/settings/handlers.js
import * as appearanceHandlers from './appearance.handlers.js';
import * as exchangesHandlers from './exchanges.handlers.js';
import * as sourcesHandlers from './sources.handlers.js';
import * as usersHandlers from './users.handlers.js';

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
    if (targetPanelId === 'appearance-settings-panel') {
      appearanceHandlers.loadAppearanceSettings();
    } else if (targetPanelId === 'data-management-settings-panel') {
      sourcesHandlers.loadSourcesList();
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
 * Handles closing the settings modal.
 */
export function handleCloseModal() {
  console.log('Close modal button clicked.');
  // In a real scenario, this would hide the modal
  document.getElementById('settings-modal').style.display = 'none';
}

/**
 * Handles saving all settings.
 */
export function handleSaveAllSettings() {
  console.log(
    'Save All Settings button clicked. Settings saved (visual feedback is immediate for theme/font).'
  );
  // General settings form values are typically read directly when needed or saved on change.
  // Appearance settings (theme/font) are saved to localStorage immediately on change.
  // No explicit API call here for these settings as they are client-side preferences.
  // The modal should not close automatically after saving.
}

/**
 * Handles clearing the exchange form.
 */
export function handleClearExchangeForm() {
  console.log('handleClearExchangeForm called (placeholder)');
  // TODO: Implement actual logic to clear the exchange form
}

/**
 * Handles clearing the general and appearance settings forms.
 */
export function handleClearGeneralAndAppearanceForms() {
  console.log('handleClearGeneralAndAppearanceForms called');
  const generalSettingsForm = document.getElementById('general-settings-form');
  if (generalSettingsForm) {
    generalSettingsForm.reset();
  }

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
