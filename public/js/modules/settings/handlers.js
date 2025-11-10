// public/js/modules/settings/handlers.js

export function handleMainTabClick(event) {
  console.log('Main tab clicked:', event.target.dataset.tab);
  // Deactivate all main tabs and panels
  document
    .querySelectorAll('.settings-tab')
    .forEach((tab) => tab.classList.remove('active'));
  document
    .querySelectorAll('.settings-panel')
    .forEach((panel) => panel.classList.remove('active'));

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
  document
    .querySelectorAll('.data-sub-tab')
    .forEach((tab) => tab.classList.remove('active'));
  document
    .querySelectorAll('#data-management-settings-panel .sub-panel')
    .forEach((panel) => panel.classList.remove('active'));

  // Activate the clicked sub-tab and its corresponding panel
  event.target.classList.add('active');
  const targetPanelId = event.target.dataset.subTab;
  document.getElementById(targetPanelId).classList.add('active');
}

export function handleUserSubTabClick(event) {
  console.log('User sub-tab clicked:', event.target.dataset.subTab);
  // Deactivate all user sub-tabs and panels
  document
    .querySelectorAll('.user-sub-tab')
    .forEach((tab) => tab.classList.remove('active'));
  document
    .querySelectorAll('#user-management-settings-panel .sub-panel')
    .forEach((panel) => panel.classList.remove('active'));

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
export function handleAddNewSourceSubmit(event) {
  console.log('handleAddNewSourceSubmit called (placeholder)');
  event.preventDefault();
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
  ['name', 'url', 'description', 'image-path'].forEach((field) => {
    const wrapper = form.querySelector(`#${prefix}-source-${field}-wrapper`);
    if (wrapper) {
      wrapper.style.display = 'none';
    }
  });

  // Hide all dynamic panels
  form.querySelectorAll('.source-type-panel').forEach((panel) => {
    panel.style.display = 'none';
  });

  const nameLabel = form.querySelector(`label[for="${prefix}-source-name"]`);
  if (nameLabel) {
    switch (selectedType) {
      case 'group':
        nameLabel.textContent = 'Group Name';
        break;
      case 'book':
        nameLabel.textContent = 'Title';
        break;
      case 'website':
        nameLabel.textContent = 'Website URL';
        break;
      default:
        nameLabel.textContent = 'Name';
        break;
    }
  }

  if (selectedType && sourceFieldConfig[selectedType]) {
    const config = sourceFieldConfig[selectedType];

    // Show configured common fields
    config.common.forEach((field) => {
      const wrapper = form.querySelector(`#${prefix}-source-${field}-wrapper`);
      if (wrapper) {
        wrapper.style.display = 'block';
      }
    });

    // Show the configured panel
    const panelToShow = form.querySelector(
      `#${prefix}-source-panel-${config.panel}`
    );
    if (panelToShow) {
      panelToShow.style.display = 'block';
    }
  }
}
export function loadSourcesList() {
  console.log('loadSourcesList called (placeholder)');
}
export function handleEditSourceClick(sourceId) {
  console.log(
    'handleEditSourceClick called (placeholder) for sourceId:',
    sourceId
  );
}
export function handleDeleteSourceClick(sourceId) {
  console.log(
    'handleDeleteSourceClick called (placeholder) for sourceId:',
    sourceId
  );
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
