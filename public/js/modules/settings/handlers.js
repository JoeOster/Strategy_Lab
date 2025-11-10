// public/js/modules/settings/handlers.js
import { addSource, deleteSource, getSources } from './api.js';

export function handleMainTabClick(event) {
  console.log('Main tab clicked:', event.target.dataset.tab);
  // Deactivate all main tabs and panels
  for (const tab of document.querySelectorAll('.settings-tab')) {
    tab.classList.remove('active');
  }
  for (const panel of document.querySelectorAll('.settings-panel')) {
    panel.classList.remove('active');
  }

  // Activate the clicked tab and its corresponding panel
  event.target.classList.add('active');
  const targetPanelId = event.target.dataset.tab;
  const panel = document.getElementById(targetPanelId);
  if (panel) {
    panel.classList.add('active');
  } else {
    console.error(`Settings panel not found: ${targetPanelId}`);
  }
}

export function handleDataSubTabClick(event) {
  console.log('Data sub-tab clicked:', event.target.dataset.subTab);
  // Deactivate all data sub-tabs and panels
  for (const tab of document.querySelectorAll('.data-sub-tab')) {
    tab.classList.remove('active');
  }
  // Activate the clicked sub-tab and its corresponding panel
  event.target.classList.add('active');
  const targetPanelId = event.target.dataset.subTab;
  document.getElementById(targetPanelId).classList.add('active');

  // If the Advice Sources panel is activated, load the sources list
  if (targetPanelId === 'advice-sources-panel') {
    loadSourcesList();
  }
}

export function handleUserSubTabClick(event) {
  console.log('User sub-tab clicked:', event.target.dataset.subTab);
  // Deactivate all user sub-tabs and panels
  for (const tab of document.querySelectorAll('.user-sub-tab')) {
    tab.classList.remove('active');
  }
  for (const panel of document.querySelectorAll(
    '#user-management-settings-panel .sub-panel'
  )) {
    panel.classList.remove('active');
  }

  // Activate the clicked sub-tab and its corresponding panel
  event.target.classList.add('active');
  const targetPanelId = event.target.dataset.subTab;
  document.getElementById(targetPanelId).classList.add('active');
}

export function handleCloseModal() {
  console.log('Close modal button clicked.');
  // In a real scenario, this would hide the modal
  document.getElementById('settings-modal').style.display = 'none';
}

export function handleSaveAllSettings() {
  console.log('Save All Settings button clicked.');
  // In a real scenario, this would save data and then hide the modal
  alert('Settings saved! (Placeholder)');
  document.getElementById('settings-modal').style.display = 'none';
}

// Placeholder functions for other handlers mentioned in settings.md
export function initializeSettingsModal() {
  console.log('initializeSettingsModal called (placeholder)');
}
export function loadGeneralSettings() {
  console.log('loadGeneralSettings called (placeholder)');
}
export function loadAppearanceSettings() {
  console.log('loadAppearanceSettings called (placeholder)');
}
export function handleThemeChange(event) {
  console.log('handleThemeChange called (placeholder)', event.target.value);
}
export function handleFontChange(event) {
  console.log('handleFontChange called (placeholder)', event.target.value);
}

export async function handleAddNewSourceSubmit(event) {
  event.preventDefault();
  console.log('handleAddNewSourceSubmit called');

  const form = event.target;
  const formData = new FormData(form);
  const sourceData = Object.fromEntries(formData.entries());

  // The form gives us 'new-source-type' but the API expects 'type'
  // and 'new-source-name' but API expects 'name' etc.
  // We need to rename the keys.
  const renamedSourceData = {};
  for (const key in sourceData) {
    renamedSourceData[key.replace('new-source-', '')] = sourceData[key];
  }

  try {
    const newSource = await addSource(renamedSourceData);
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

export function handleEditSourceClick(sourceId) {
  console.log(
    'handleEditSourceClick called (placeholder) for sourceId:',
    sourceId
  );
}

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

export function handleAddExchangeSubmit(event) {
  console.log('handleAddExchangeSubmit called (placeholder)');
  event.preventDefault();
}
export function loadExchangesList() {
  console.log('loadExchangesList called (placeholder)');
}
export function handleDeleteExchangeClick(exchangeId) {
  console.log(
    'handleDeleteExchangeClick called (placeholder) for exchangeId:',
    exchangeId
  );
}
export function handleAddHolderSubmit(event) {
  console.log('handleAddHolderSubmit called (placeholder)');
  event.preventDefault();
}
export function loadAccountHoldersList() {
  console.log('loadAccountHoldersList called (placeholder)');
}
export function handleSetDefaultHolderClick(holderId) {
  console.log(
    'handleSetDefaultHolderClick called (placeholder) for holderId:',
    holderId
  );
}
export function handleManageSubscriptionsClick(holderId) {
  console.log(
    'handleManageSubscriptionsClick called (placeholder) for holderId:',
    holderId
  );
}
export function handleDeleteHolderClick(holderId) {
  console.log(
    'handleDeleteHolderClick called (placeholder) for holderId:',
    holderId
  );
}
export function loadSubscriptionsForUser(holderId) {
  console.log(
    'loadSubscriptionsForUser called (placeholder) for holderId:',
    holderId
  );
}
export function handleSubscriptionToggle(holderId, sourceId) {
  console.log(
    `handleSubscriptionToggle called (placeholder) for holderId: ${holderId}, sourceId: ${sourceId}`
  );
}
export function openEditSourceModal(sourceId) {
  console.log(
    'openEditSourceModal called (placeholder) for sourceId:',
    sourceId
  );
}
export function handleEditSourceSubmit(event) {
  console.log('handleEditSourceSubmit called (placeholder)');
  event.preventDefault();
}
