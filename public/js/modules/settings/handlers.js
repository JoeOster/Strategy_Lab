// public/js/modules/settings/handlers.js
import {
  addExchange,
  addHolder,
  addSource,
  deleteHolder,
  deleteSource,
  getAccountHolders,
  getSources,
  updateSource,
} from './api.js';

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
      loadAppearanceSettings();
    } else if (targetPanelId === 'data-management-settings-panel') {
      initializeSubTabs(panel, 'sources-panel', loadSourcesList);
    } else if (targetPanelId === 'user-management-settings-panel') {
      initializeSubTabs(panel, 'users-panel', loadAccountHoldersList);
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
        loadSourcesList();
        break;
      case 'exchanges-panel':
        loadExchangesList();
        break;
      case 'users-panel':
        loadAccountHoldersList();
        break;
      case 'subscriptions-panel':
        // Assuming you have a function to get the currently selected user
        // and pass it to loadSubscriptionsForUser.
        // This might need more complex logic.
        loadSubscriptionsForUser();
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
 * Placeholder function for initializing the settings modal.
 */
export function initializeSettingsModal() {
  console.log('initializeSettingsModal called (placeholder)');
}

/**
 * Placeholder function for loading general settings data.
 */
export function loadGeneralSettings() {
  console.log('loadGeneralSettings called (placeholder)');
}

/**
 * Loads and populates the Appearance settings panel (themes and fonts).
 */
export function loadAppearanceSettings() {
  console.log('loadAppearanceSettings called');

  const themeSelector = document.getElementById('theme-selector');
  const fontSelector = document.getElementById('font-selector');

  if (!themeSelector || !fontSelector) {
    console.error('Theme or font selector not found!');
    return;
  }

  // Populate Themes
  const themes = [
    { value: 'light', text: 'Light' },
    { value: 'dark', text: 'Dark' },
    { value: 'sepia', text: 'Sepia' },
    { value: 'contrast', text: 'High Contrast' },
  ];

  themeSelector.innerHTML = ''; // Clear existing options
  for (const theme of themes) {
    const option = document.createElement('option');
    option.value = theme.value;
    option.textContent = theme.text;
    themeSelector.appendChild(option);
  }

  // Populate Fonts
  const fonts = [
    { value: 'var(--font-system)', text: 'System Default' },
    { value: 'var(--font-inter)', text: 'Inter' },
    { value: 'var(--font-roboto)', text: 'Roboto' },
    { value: 'var(--font-lato)', text: 'Lato' },
    { value: 'var(--font-open-sans)', text: 'Open Sans' },
    { value: 'var(--font-dancing-script)', text: 'Dancing Script' },
  ];

  fontSelector.innerHTML = ''; // Clear existing options
  for (const font of fonts) {
    const option = document.createElement('option');
    option.value = font.value;
    option.textContent = font.text;
    fontSelector.appendChild(option);
  }

  // Add event listeners
  themeSelector.addEventListener('change', handleThemeChange);
  fontSelector.addEventListener('change', handleFontChange);

  // Set initial values from Local Storage
  const savedTheme = localStorage.getItem('theme') || 'light';
  themeSelector.value = savedTheme;
  document.body.dataset.theme = savedTheme;

  const savedFont = localStorage.getItem('font') || 'var(--font-system)';
  fontSelector.value = savedFont;
  document.body.style.fontFamily = savedFont;
}

/**
 * Handles the theme change event.
 * @param {Event} event - The change event from the theme selector.
 */
export function handleThemeChange(event) {
  const selectedTheme = event.target.value;
  console.log('handleThemeChange called:', selectedTheme);
  document.body.dataset.theme = selectedTheme;
  localStorage.setItem('theme', selectedTheme); // Save to Local Storage
}

/**
 * Handles the font change event.
 * @param {Event} event - The change event from the font selector.
 */
export function handleFontChange(event) {
  const selectedFont = event.target.value;
  console.log('handleFontChange called:', selectedFont);
  document.body.style.fontFamily = selectedFont;
  localStorage.setItem('font', selectedFont); // Save to Local Storage
}

/**
 * Clears the General and Appearance settings forms.
 */
export function handleClearGeneralAndAppearanceForms() {
  console.log('handleClearGeneralAndAppearanceForms called');
  const generalForm = document.getElementById('general-settings-form');
  if (generalForm) {
    generalForm.reset();
  }
  const appearanceForm = document.getElementById('appearance-settings-form');
  if (appearanceForm) {
    appearanceForm.reset();
  }
}

/**
 * Clears the "Edit Advice Source" form.
 */
export function handleClearEditSourceForm() {
  console.log('handleClearEditSourceForm called');
  const form = document.getElementById('edit-source-form');
  if (form) {
    form.reset();
    // Optionally hide dynamic fields after clearing
    const fieldsContainer = form.querySelector('#edit-source-fields-container');
    if (fieldsContainer) {
      fieldsContainer.style.display = 'none';
    }
  }
}

/**
 * Clears the "Add New Source" form.
 */
export function handleClearNewSourceForm() {
  console.log('handleClearNewSourceForm called');
  const form = document.getElementById('add-new-source-form');
  if (form) {
    form.reset();
    // Hide the dynamic fields again
    const fieldsContainer = form.querySelector('#new-source-fields-container');
    if (fieldsContainer) {
      fieldsContainer.style.display = 'none';
    }
    // Reset the source type dropdown to its default
    const newSourceType = form.querySelector('#new-source-type');
    if (newSourceType) {
      newSourceType.value = ''; // Assuming empty string is the default/placeholder value
    }
  }
}

/**
 * Clears the "Add New Exchange" form.
 */
export function handleClearExchangeForm() {
  console.log('handleClearExchangeForm called');
  const form = document.getElementById('add-exchange-form');
  if (form) {
    form.reset();
  }
}

/**
 * Clears the "Add New Holder" form.
 */
export function handleClearHolderForm() {
  console.log('handleClearHolderForm called');
  const form = document.getElementById('add-holder-form');
  if (form) {
    form.reset();
  }
}

/**
 * Handles the submission of the "Add New Source" form.
 * Prevents default form submission, gathers data, creates a payload,
 * calls the API, and refreshes the sources list.
 * @param {Event} event - The form submission event.
 */
export async function handleAddNewSourceSubmit(event) {
  event.preventDefault();
  console.log('handleAddNewSourceSubmit called');

  const form = event.target;
  const formData = new FormData(form);
  const sourceData = Object.fromEntries(formData.entries());

  const apiPayload = {
    name: sourceData['new-source-name'],
    type: sourceData['new-source-type'],
    description: sourceData['new-source-description'],
    image_path: sourceData['new-source-image-path'],
    url: sourceData['new-source-url'],

    // Person
    person_email: sourceData['new-source-contact-email'],
    person_phone: sourceData['new-source-contact-phone'],
    person_app_type: sourceData['new-source-contact-app-type'],
    person_app_handle: sourceData['new-source-contact-app-handle'],

    // Group
    group_primary_contact: sourceData['new-source-group-person'],
    group_email: sourceData['new-source-group-email'],
    group_phone: sourceData['new-source-group-phone'],
    group_app_type: sourceData['new-source-group-app-type'],
    group_app_handle: sourceData['new-source-group-app-handle'],

    // Book
    book_author: sourceData['new-source-book-author'],
    book_isbn: sourceData['new-source-book-isbn'],
    book_websites: sourceData['new-source-book-websites'],
    book_pdfs: sourceData['new-source-book-pdfs'],

    // Website
    website_websites: sourceData['new-source-website-websites'],
    website_pdfs: sourceData['new-source-website-pdfs'],
  };

  // Remove undefined properties (BIOME LINT FIX)
  for (const key of Object.keys(apiPayload)) {
    if (apiPayload[key] === undefined) {
      delete apiPayload[key];
    }
  }

  try {
    const newSource = await addSource(apiPayload);
    console.log('Source added successfully:', newSource);
    form.reset();
    // Hide the dynamic fields again
    const fieldsContainer = form.querySelector('#new-source-fields-container');
    if (fieldsContainer) {
      fieldsContainer.style.display = 'none';
    }
    await loadSourcesList(); // Refresh the list
  } catch (error) {
    console.error('Failed to add source:', error);
    alert('Failed to add source. Please check the console for details.');
  }
}

/**
 * Handles the change event for the source type dropdown (new or edit).
 * Shows/hides the relevant form fields based on the selected source type.
 * @param {Event} event - The change event from the select dropdown.
 * @param {string} prefix - The form prefix ('new' or 'edit').
 */
export function handleSourceTypeChange(event, prefix) {
  const selectedType = event.target.value;
  const form =
    prefix === 'new'
      ? document.getElementById('add-new-source-form')
      : document.getElementById('edit-source-form');

  if (!form) {
    console.error(`Form not found for prefix: ${prefix}`);
    return;
  }

  const fieldsContainer = form.querySelector(
    `#${prefix}-source-fields-container`
  );
  if (fieldsContainer) {
    fieldsContainer.style.display = 'block';
  }

  const sourceFieldConfig = {
    person: {
      common: ['name', 'description', 'image-path'],
      panel: 'person',
    },
    group: {
      common: ['name', 'description', 'image-path'],
      panel: 'group',
    },
    book: {
      common: ['name', 'description', 'image-path'],
      panel: 'book',
    },
    website: {
      common: ['name', 'url', 'description', 'image-path'],
      panel: 'website',
    },
  };

  // Hide all common fields first
  for (const field of ['name', 'url', 'description', 'image-path']) {
    const wrapper = form.querySelector(`#${prefix}-source-${field}-wrapper`);
    if (wrapper) {
      wrapper.style.display = 'none';
    }
  }

  // Hide all dynamic panels
  for (const panel of form.querySelectorAll('.source-type-panel')) {
    panel.style.display = 'none';
  }

  const nameLabel = form.querySelector(`label[for="${prefix}-source-name"]`);
  if (nameLabel) {
    switch (selectedType) {
      case 'group':
        nameLabel.textContent = 'Group Name:';
        break;
      case 'book':
        nameLabel.textContent = 'Title:';
        break;
      case 'website':
        nameLabel.textContent = 'Website:';
        break;
      default:
        nameLabel.textContent = 'Name:';
        break;
    }
  }

  if (selectedType && sourceFieldConfig[selectedType]) {
    const config = sourceFieldConfig[selectedType];

    // Show configured common fields
    for (const field of config.common) {
      const wrapper = form.querySelector(`#${prefix}-source-${field}-wrapper`);
      if (wrapper) {
        wrapper.style.display = 'block';
      }
    }

    // Show the configured panel
    const panelToShow = form.querySelector(
      `#${prefix}-source-panel-${config.panel}`
    );
    if (panelToShow) {
      panelToShow.style.display = 'block';
    }
  }
}

/**
 * Fetches and renders the list of advice sources.
 */
export async function loadSourcesList() {
  console.log('loadSourcesList called');
  try {
    const sources = await getSources();
    const listContainer = document.getElementById('advice-source-list');
    if (!listContainer) {
      console.error('Source list container not found!');
      return;
    }
    listContainer.innerHTML = ''; // Clear existing list

    if (sources.length === 0) {
      listContainer.innerHTML = '<p>No advice sources found.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'sources-list';

    for (const source of sources) {
      const li = document.createElement('li');
      li.className = 'sources-list-item';
      li.innerHTML = `
        <span>${source.name} (${source.type})</span>
        <button class="delete-source-btn" data-id="${source.id}">Delete</button>
      `;
      ul.appendChild(li);
    }

    listContainer.appendChild(ul);
  } catch (error) {
    console.error('Failed to load sources list:', error);
    const listContainer = document.getElementById('sources-list-container');
    if (listContainer) {
      listContainer.innerHTML =
        '<p class="error">Error loading sources. Please try again.</p>';
    }
  }
}

/**
 * Placeholder for handling the edit source button click.
 * @param {string} sourceId - The ID of the source to edit.
 */
export function handleEditSourceClick(sourceId) {
  console.log(
    'handleEditSourceClick called (placeholder) for sourceId:',
    sourceId
  );
}

/**
 * Handles the delete source button click.
 * @param {string} sourceId - The ID of the source to delete.
 */
export async function handleDeleteSourceClick(sourceId) {
  console.log('handleDeleteSourceClick called for sourceId:', sourceId);
  if (!confirm('Are you sure you want to delete this source?')) {
    return;
  }

  try {
    await deleteSource(sourceId);
    // Refresh the list to show the source has been removed
    await loadSourcesList();
  } catch (error) {
    console.error(`Failed to delete source with ID ${sourceId}:`, error);
    alert('Failed to delete source. Please check the console for details.');
  }
}

/**
 * Handles the submission of the "Add New Exchange" form.
 * Prevents default form submission, gathers data, creates a payload,
 * calls the API, and refreshes the exchanges list.
 * @param {Event} event - The form submission event.
 */
export async function handleAddExchangeSubmit(event) {
  event.preventDefault();
  console.log('handleAddExchangeSubmit called');

  const form = event.target;
  const exchangeNameInput = form.querySelector('#new-exchange-name');
  const exchangeName = exchangeNameInput ? exchangeNameInput.value : '';

  const apiPayload = { name: exchangeName };

  try {
    const newExchange = await addExchange(apiPayload);
    console.log('Exchange added successfully:', newExchange);
    form.reset();
    await loadExchangesList(); // Refresh the list
  } catch (error) {
    console.error('Failed to add exchange:', error);
    alert('Failed to add exchange. Please check the console for details.');
  }
}

/**
 * Loads and renders the list of exchanges (placeholder).
 */
export function loadExchangesList() {
  console.log('loadExchangesList called');
  const listContainer = document.getElementById('exchange-list');
  if (listContainer) {
    listContainer.innerHTML = '<p>No exchanges found.</p>';
  }
}

/**
 * Placeholder for handling the delete exchange button click.
 * @param {string} exchangeId - The ID of the exchange to delete.
 */
export function handleDeleteExchangeClick(exchangeId) {
  console.log(
    'handleDeleteExchangeClick called (placeholder) for exchangeId:',
    exchangeId
  );
}

/**
 * Handles the submission of the "Add New Holder" form.
 * @param {Event} event - The form submission event.
 */
export async function handleAddHolderSubmit(event) {
  event.preventDefault();
  console.log('handleAddHolderSubmit called');

  const form = event.target;
  // Get the value directly from the input field
  const holderNameInput = form.querySelector('#new-holder-name');
  const holderName = holderNameInput ? holderNameInput.value : '';

  // Create an object with the 'username' property as expected by the API
  const holderData = { username: holderName };

  try {
    const newHolder = await addHolder(holderData);
    console.log('Holder added successfully:', newHolder);
    form.reset();
    await loadAccountHoldersList(); // Refresh the list
  } catch (error) {
    console.error('Failed to add holder:', error);
    alert('Failed to add holder. Please check the console for details.');
  }
}

/**
 * Fetches and renders the list of account holders.
 */
export async function loadAccountHoldersList() {
  console.log('loadAccountHoldersList called');
  try {
    const holders = await getAccountHolders();
    const listContainer = document.getElementById('account-holder-list');
    if (!listContainer) {
      console.error('Account holder list container not found!');
      return;
    }
    listContainer.innerHTML = ''; // Clear existing list

    if (holders.length === 0) {
      listContainer.innerHTML = '<p>No account holders found.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'account-holders-list';

    for (const holder of holders) {
      const li = document.createElement('li');
      li.className = 'account-holders-list-item';
      li.innerHTML = `
        <span>${holder.username}</span>
        <button class="set-default-holder-btn" data-id="${holder.id}">Set Default</button>
        <button class="manage-subscriptions-btn" data-id="${holder.id}">Manage Subscriptions</button>
        <button class="delete-holder-btn" data-id="${holder.id}">Delete</button>
      `;
      ul.appendChild(li);
    }

    listContainer.appendChild(ul);
  } catch (error) {
    console.error('Failed to load account holders list:', error);
    const listContainer = document.getElementById('account-holder-list');
    if (listContainer) {
      listContainer.innerHTML =
        '<p class="error">Error loading account holders. Please try again.</p>';
    }
  }
}

/**
 * Placeholder for handling the "Set Default" holder button click.
 * @param {string} holderId - The ID of the holder to set as default.
 */
export function handleSetDefaultHolderClick(holderId) {
  console.log(
    'handleSetDefaultHolderClick called (placeholder) for holderId:',
    holderId
  );
}

/**
 * Placeholder for handling the "Manage Subscriptions" button click.
 * @param {string} holderId - The ID of the holder whose subscriptions to manage.
 */
export function handleManageSubscriptionsClick(holderId) {
  console.log(
    'handleManageSubscriptionsClick called (placeholder) for holderId:',
    holderId
  );
}

/**
 * Handles the delete holder button click.
 * @param {string} holderId - The ID of the holder to delete.
 */
export async function handleDeleteHolderClick(holderId) {
  console.log('handleDeleteHolderClick called for holderId:', holderId);
  if (!confirm('Are you sure you want to delete this account holder?')) {
    return;
  }

  try {
    await deleteHolder(holderId);
    // Refresh the list to show the holder has been removed
    await loadAccountHoldersList();
  } catch (error) {
    console.error(`Failed to delete holder with ID ${holderId}:`, error);
    alert('Failed to delete holder. Please check the console for details.');
  }
}

/**
 * Placeholder for loading subscriptions for a specific user.
 * @param {string} [holderId] - The ID of the holder.
 */
export function loadSubscriptionsForUser(holderId) {
  console.log(
    'loadSubscriptionsForUser called (placeholder) for holderId:',
    holderId
  );
}

/**
 * Placeholder for toggling a subscription for a user.
 * @param {string} holderId - The ID of the holder.
 * @param {string} sourceId - The ID of the source.
 */
export function handleSubscriptionToggle(holderId, sourceId) {
  console.log(
    `handleSubscriptionToggle called (placeholder) for holderId: ${holderId}, sourceId: ${sourceId}`
  );
}

/**
 * Placeholder for opening the edit source modal.
 * @param {string} sourceId - The ID of the source to edit.
 */
export function openEditSourceModal(sourceId) {
  console.log(
    'openEditSourceModal called (placeholder) for sourceId:',
    sourceId
  );
}

/**
 * Handles the submission of the edit source form.
 * @param {Event} event - The form submission event.
 */
export async function handleEditSourceSubmit(event) {
  event.preventDefault();
  console.log('handleEditSourceSubmit called');

  const form = event.target;
  const formData = new FormData(form);
  const sourceData = Object.fromEntries(formData.entries());

  const sourceId = document.getElementById('edit-source-id').value;

  const apiPayload = {
    id: sourceId,
    name: sourceData['edit-source-name'],
    type: sourceData['edit-source-type'],
    description: sourceData['edit-source-description'],
    image_path: sourceData['edit-source-image-path'],
    url: sourceData['edit-source-url'],

    // Person
    person_email: sourceData['edit-source-contact-email'],
    person_phone: sourceData['edit-source-contact-phone'],
    person_app_type: sourceData['edit-source-contact-app-type'],
    person_app_handle: sourceData['edit-source-contact-app-handle'],

    // Group
    group_primary_contact: sourceData['edit-source-group-person'],
    group_email: sourceData['edit-source-group-email'],
    group_phone: sourceData['edit-source-group-phone'],
    group_app_type: sourceData['edit-source-group-app-type'],
    group_app_handle: sourceData['edit-source-group-app-handle'],

    // Book
    book_author: sourceData['edit-source-book-author'],
    book_isbn: sourceData['edit-source-book-isbn'],
    book_websites: sourceData['edit-source-book-websites'],
    book_pdfs: sourceData['edit-source-book-pdfs'],

    // Website
    website_websites: sourceData['edit-source-website-websites'],
    website_pdfs: sourceData['edit-source-website-pdfs'],
  };

  // Remove undefined properties (BIOME LINT FIX)
  for (const key of Object.keys(apiPayload)) {
    if (apiPayload[key] === undefined) {
      delete apiPayload[key];
    }
  }

  try {
    const updatedSource = await updateSource(apiPayload);
    console.log('Source updated successfully:', updatedSource);
    document.getElementById('edit-source-modal').style.display = 'none'; // Close modal
    await loadSourcesList(); // Refresh the list
  } catch (error) {
    console.error('Failed to update source:', error);
    alert('Failed to update source. Please check the console for details.');
  }
}

/**
 * Loads user's saved theme and font preferences from Local Storage and applies them.
 */
export function loadUserPreferences() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.dataset.theme = savedTheme;

  const savedFont = localStorage.getItem('font') || 'var(--font-system)';
  document.body.style.fontFamily = savedFont;
}
