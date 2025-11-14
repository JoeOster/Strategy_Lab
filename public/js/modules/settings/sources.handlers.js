// public/js/modules/settings/sources.handlers.js
import { addSource, deleteSource, getSources, getSource, updateSource } from './sources.api.js';
import { loadStrategiesForSource } from './strategies.handlers.js';

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

    // Load strategies for book type
    if (formType === 'edit') {
      const sourceId = document.getElementById('edit-source-id').value;
      if (sourceId) {
        loadStrategiesForSource(sourceId, 'edit-source-book-strategies-table');
      }
    } else if (formType === 'new') {
      // For new sources, strategies will be loaded after the source is added
      // or if there's a temporary way to associate them before saving.
      // For now, we'll just clear the placeholder.
      const newSourceStrategiesContainer = document.getElementById('new-source-book-strategies-table');
      if (newSourceStrategiesContainer) {
        newSourceStrategiesContainer.innerHTML = '<h5>Strategies</h5><p>Strategies will appear here after the source is created.</p>';
      }
    }
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

export async function handleEditSourceClick(sourceId) {
  console.log('Handler: handleEditSourceClick called', sourceId);
  const editSourceModal = document.getElementById('edit-source-modal');
  if (!editSourceModal) {
    console.error('Edit source modal not found.');
    return;
  }

  try {
    const source = await getSource(sourceId);
    if (!source) {
      console.error('Source not found for ID:', sourceId);
      return;
    }

    // Populate the edit form fields
    document.getElementById('edit-source-id').value = source.id;
    document.getElementById('edit-source-type').value = source.type;
    document.getElementById('edit-source-name').value = source.name;
    document.getElementById('edit-source-url').value = source.url || '';
    document.getElementById('edit-source-description').value = source.description || '';
    document.getElementById('edit-source-image-path').value = source.image_path || '';

    // Populate type-specific fields
    if (source.type === 'person') {
      document.getElementById('edit-source-contact-email').value = source.person_email || '';
      document.getElementById('edit-source-contact-phone').value = source.person_phone || '';
      document.getElementById('edit-source-contact-app-type').value = source.person_app_type || '';
      document.getElementById('edit-source-contact-app-handle').value = source.person_app_handle || '';
    } else if (source.type === 'group') {
      document.getElementById('edit-source-group-person').value = source.group_primary_contact || '';
      document.getElementById('edit-source-group-email').value = source.group_email || '';
      document.getElementById('edit-source-group-phone').value = source.group_phone || '';
      document.getElementById('edit-source-group-app-type').value = source.group_app_type || '';
      document.getElementById('edit-source-group-app-handle').value = source.group_app_handle || '';
    } else if (source.type === 'book') {
      document.getElementById('edit-source-book-author').value = source.book_author || '';
      document.getElementById('edit-source-book-isbn').value = source.book_isbn || '';
      document.getElementById('edit-source-book-websites').value = source.book_websites || '';
      document.getElementById('edit-source-book-pdfs').value = source.book_pdfs || '';
    } else if (source.type === 'website') {
      document.getElementById('edit-source-website-websites').value = source.website_websites || '';
      document.getElementById('edit-source-website-pdfs').value = source.website_pdfs || '';
    }

    // Trigger the change handler to show/hide appropriate panels and load strategies
    handleSourceTypeChange({ target: { value: source.type } }, 'edit');

    editSourceModal.style.display = 'block'; // Show the modal
  } catch (error) {
    console.error('Error fetching source for editing:', error);
  }
}

export async function handleEditSourceSubmit(event) {
  event.preventDefault();
  console.log('Handler: handleEditSourceSubmit called');

  const form = event.target;
  const sourceId = document.getElementById('edit-source-id').value;
  const formData = new FormData(form);
  const updatedSource = Object.fromEntries(formData.entries());

  // Remove the 'type' from updatedSource if it's not meant to be updated this way
  // or if the backend handles it automatically. For now, we'll keep it.

  try {
    await updateSource(sourceId, updatedSource);
    console.log('Source updated:', sourceId);
    loadSourcesList(); // Refresh the list
    document.getElementById('edit-source-modal').style.display = 'none'; // Hide the modal
  } catch (error) {
    console.error('Error updating source:', error);
  }
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
