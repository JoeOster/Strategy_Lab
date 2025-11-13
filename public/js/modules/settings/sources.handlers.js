// public/js/modules/settings/sources.handlers.js
import { addSource, deleteSource, getSources } from './sources.api.js';

export function handleAddNewSourceSubmit(event) {
  event.preventDefault();
  console.log('Handler: handleAddNewSourceSubmit called');

  const form = event.target;
  const formData = new FormData(form);
  const newSource = Object.fromEntries(formData.entries());

  addSource(newSource)
    .then((addedSource) => {
      console.log('Source added:', addedSource);
      form.reset();
      handleSourceTypeChange({ target: { value: '' } }, 'new'); // Hide dynamic fields
      loadSourcesList(); // Refresh the list
    })
    .catch((error) => console.error('Error adding source:', error));
}

export function handleSourceTypeChange(event, formType) {
  const selectedType = event.target.value;
  const formPrefix = formType === 'new' ? 'new-source' : 'edit-source';
  console.log('handleSourceTypeChange called with:', {
    selectedType,
    formPrefix,
  });

  // Hide all dynamic panels first
  const panels = document.querySelectorAll(
    `#${formPrefix}-fields-container .source-type-panel`
  );
  console.log('Found panels:', panels);
  for (const panel of panels) {
    panel.style.display = 'none';
  }

  // Show the selected panel
  const selectedPanel = document.getElementById(
    `${formPrefix}-panel-${selectedType}`
  );
  console.log('Selected panel:', selectedPanel);
  if (selectedPanel) {
    selectedPanel.style.display = 'block';
  }

  // Show/hide the fields container
  const fieldsContainer = document.getElementById(
    `${formPrefix}-fields-container`
  );
  if (fieldsContainer) {
    fieldsContainer.style.display = selectedType ? 'block' : 'none';
  }

  // Handle label changes and URL field visibility
  const nameLabel = document.querySelector(`label[for="${formPrefix}-name"]`);
  const urlWrapper = document.getElementById(`${formPrefix}-url-wrapper`);
  const urlLabel = document.querySelector(`label[for="${formPrefix}-url"]`);

  if (selectedType === 'book') {
    if (nameLabel) nameLabel.textContent = 'Title:';
    if (urlWrapper) urlWrapper.style.display = 'block';
    if (urlLabel) urlLabel.textContent = 'Book URL:';
  } else {
    if (nameLabel) nameLabel.textContent = 'Name:';
    if (selectedType === 'person' || selectedType === 'group') {
      if (urlWrapper) urlWrapper.style.display = 'none';
    } else {
      if (urlWrapper) urlWrapper.style.display = 'block';
      if (urlLabel) urlLabel.textContent = 'URL:';
    }
  }
}

export async function loadSourcesList() {
  console.log('Handler: loadSourcesList called (placeholder)');
  const sources = await getSources();
  const sourcesContainer = document.getElementById('advice-source-list');
  if (sourcesContainer) {
    sourcesContainer.innerHTML = ''; // Clear existing list
    for (const source of sources) {
      const sourceElement = document.createElement('div');
      sourceElement.className = 'advice-source-item'; // Add a class for consistent styling of list items

      const infoSpan = document.createElement('span');
      infoSpan.classList.add('source-info');
      infoSpan.textContent = `${source.name} (${source.type})`;
      sourceElement.appendChild(infoSpan);

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('source-actions');
      actionsDiv.innerHTML = `
        <button class="edit-source-btn table-action-btn" data-id="${source.id}">Edit</button>
        <button class="delete-source-btn table-action-btn" data-id="${source.id}">Delete</button>
      `;
      sourceElement.appendChild(actionsDiv);
      sourcesContainer.appendChild(sourceElement);
    }
  }
}

export function handleEditSourceClick(sourceId) {
  console.log('Handler: handleEditSourceClick called (placeholder)', sourceId);
  // Placeholder for loading source data into an edit form
  // In a real scenario, you'd fetch the source by ID and populate a modal/form
}

export function handleDeleteSourceClick(sourceId) {
  console.log(
    'Handler: handleDeleteSourceClick called (placeholder)',
    sourceId
  );
  if (confirm('Are you sure you want to delete this source?')) {
    deleteSource(sourceId)
      .then(() => {
        console.log('Source deleted:', sourceId);
        loadSourcesList(); // Refresh the list
      })
      .catch((error) => console.error('Error deleting source:', error));
  }
}
