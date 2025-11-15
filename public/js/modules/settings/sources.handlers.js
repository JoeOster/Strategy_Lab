// public/js/modules/settings/sources.handlers.js
import {
  addSource,
  deleteSource,
  getSource,
  getSources,
  updateSource,
} from './sources.api.js';
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

export function handleSourceTypeChange(event, formType, sourceData = {}) {
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
  
      // Pre-fill image_path for new 'person' sources if empty
      if (formType === 'new' && selectedType === 'person') {
        const imagePathInput = document.getElementById('new-source-image-path');
        // @ts-ignore
        if (imagePathInput && !imagePathInput.value) {
          // @ts-ignore
          imagePathInput.value = 'images/contacts/default.png';
        }
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

    const bookFields = [
      'book_author',
      'book_isbn',
      'book_websites',
      'book_pdfs',
    ];
    for (const field of bookFields) {
      const wrapper = document.getElementById(`${formPrefix}-${field}-wrapper`);
      if (wrapper) {
        wrapper.style.display =
          sourceData[field] && sourceData[field].length > 0 ? 'block' : 'none';
      }
    }

    // Load strategies for book type
    if (formType === 'edit') {
      const sourceId = document.getElementById('edit-source-id').value;
      if (sourceId) {
        loadStrategiesForSource(sourceId, 'edit-source-book-strategies-table');
      }
    } else if (formType === 'new') {
      const newSourceStrategiesContainer = document.getElementById(
        'new-source-book-strategies-table'
      );
      if (newSourceStrategiesContainer) {
        newSourceStrategiesContainer.innerHTML =
          '<h5>Strategies</h5><p>Strategies will appear here after the source is created.</p>';
      }
    }
  } else if (selectedType === 'website') {
    if (nameLabel) nameLabel.textContent = 'Website Name:';
    if (urlWrapper) urlWrapper.style.display = 'block';
    if (urlLabel) urlLabel.textContent = 'Website URL:';

    const websiteFields = ['website_websites', 'website_pdfs'];
    for (const field of websiteFields) {
      const wrapper = document.getElementById(`${formPrefix}-${field}-wrapper`);
      if (wrapper) {
        wrapper.style.display =
          sourceData[field] && sourceData[field].length > 0 ? 'block' : 'none';
      }
    }

    // Load strategies for website type
    if (formType === 'edit') {
      const sourceId = document.getElementById('edit-source-id').value;
      if (sourceId) {
        loadStrategiesForSource(
          sourceId,
          'edit-source-website-strategies-table'
        );
      }
    } else if (formType === 'new') {
      const newSourceStrategiesContainer = document.getElementById(
        'new-source-website-strategies-table'
      );
      if (newSourceStrategiesContainer) {
        newSourceStrategiesContainer.innerHTML =
          '<h5>Strategies</h5><p>Strategies will appear here after the source is created.</p>';
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

export async function handleSourceItemClick(sourceId) {
  console.log('Handler: handleSourceItemClick called', sourceId);
  const sourceDetailModal = document.getElementById('source-detail-modal');
  if (!sourceDetailModal) {
    console.error('Source detail modal not found.');
    return;
  }

  try {
    const source = await getSource(sourceId);
    if (!source) {
      console.error('Source not found for ID:', sourceId);
      return;
    }

    // Populate source profile container
    const sourceProfileContainer = document.getElementById(
      'source-profile-container'
    );
    if (sourceProfileContainer) {
      sourceProfileContainer.innerHTML = `
        <h3>${source.name} (${source.type})</h3>
        <p>Description: ${source.description || 'N/A'}</p>
        <p>URL: <a href="${source.url}" target="_blank">${source.url || 'N/A'}</a></p>
        ${source.image_path ? `<img src="${source.image_path}" alt="${source.name}" style="max-width: 100px;">` : ''}
      `;
    }

    // Populate source feature button container (Add Strategy/Idea, Edit Strategy)
    const sourceFeatureBtnContainer = document.getElementById(
      'source-feature-btn-container'
    );
    if (sourceFeatureBtnContainer) {
      sourceFeatureBtnContainer.innerHTML = `
        <button id="add-strategy-btn" class="btn" data-source-id="${source.id}">Add Strategy</button>
        <button id="edit-strategy-btn" class="btn" data-source-id="${source.id}">Edit Strategy</button>
        <button id="add-idea-btn" class="btn" data-source-id="${source.id}">Add Idea</button>
      `;
    }

    // Load strategies for book/website types
    if (source.type === 'book') {
      loadStrategiesForSource(source.id, 'source-detail-strategies-table');
    } else if (source.type === 'website') {
      loadStrategiesForSource(source.id, 'source-detail-strategies-table');
    }

    sourceDetailModal.style.display = 'block'; // Show the modal
  } catch (error) {
    console.error('Error fetching source for detail view:', error);
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
      sourceElement.dataset.id = source.id; // Store source ID on the element

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

      // Add event listener to the source item itself to open the detail modal
      sourceElement.addEventListener('click', (event) => {
        // Prevent opening detail modal if edit/delete buttons are clicked
        if (
          !event.target.classList.contains('edit-source-btn') &&
          !event.target.classList.contains('delete-source-btn')
        ) {
          handleSourceItemClick(source.id);
        }
      });

      // **NEW:** Add event listener for the edit button
      const editButton = sourceElement.querySelector('.edit-source-btn');
      if (editButton) {
        editButton.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevent handleSourceItemClick from firing
          // @ts-ignore
          openEditSourceModal(event.target.dataset.id);
        });
      }

      // **NEW:** Add event listener for the delete button
      const deleteButton = sourceElement.querySelector('.delete-source-btn');
      if (deleteButton) {
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevent handleSourceItemClick from firing
          // @ts-ignore
          handleDeleteSourceClick(event.target.dataset.id);
        });
      }
    }
  }
}

export async function openEditSourceModal(sourceId) {
  console.log('Handler: openEditSourceModal called', sourceId);
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
    // @ts-ignore
    document.getElementById('edit-source-id').value = source.id;
    // @ts-ignore
    document.getElementById('edit-source-type').value = source.type;
    // @ts-ignore
    document.getElementById('edit-source-name').value = source.name;
    // @ts-ignore
    document.getElementById('edit-source-url').value = source.url || '';
    // @ts-ignore
    document.getElementById('edit-source-description').value =
      source.description || '';
    // @ts-ignore
    document.getElementById('edit-source-image-path').value =
      source.image_path || '';

    // Populate type-specific fields
    if (source.type === 'person') {
      // @ts-ignore
      document.getElementById('edit-source-contact-email').value =
        source.person_email || '';
      // @ts-ignore
      document.getElementById('edit-source-contact-phone').value =
        source.person_phone || '';
      // @ts-ignore
      document.getElementById('edit-source-contact-app-type').value =
        source.person_app_type || '';
      // @ts-ignore
      document.getElementById('edit-source-contact-app-handle').value =
        source.person_app_handle || '';
    } else if (source.type === 'group') {
      // @ts-ignore
      document.getElementById('edit-source-group-person').value =
        source.group_primary_contact || '';
      // @ts-ignore
      document.getElementById('edit-source-group-email').value =
        source.group_email || '';
      // @ts-ignore
      document.getElementById('edit-source-group-phone').value =
        source.group_phone || '';
      // @ts-ignore
      document.getElementById('edit-source-group-app-type').value =
        source.group_app_type || '';
      // @ts-ignore
      document.getElementById('edit-source-group-app-handle').value =
        source.group_app_handle || '';
    } else if (source.type === 'book') {
      // @ts-ignore
      document.getElementById('edit-source-book-author').value =
        source.book_author || '';
      // @ts-ignore
      document.getElementById('edit-source-book-isbn').value =
        source.book_isbn || '';
      // @ts-ignore
      document.getElementById('edit-source-book-websites').value =
        source.book_websites || '';
      // @ts-ignore
      document.getElementById('edit-source-book-pdfs').value =
        source.book_pdfs || '';
    } else if (source.type === 'website') {
      // @ts-ignore
      document.getElementById('edit-source-website-websites').value =
        source.website_websites || '';
      // @ts-ignore
      document.getElementById('edit-source-website-pdfs').value =
        source.website_pdfs || '';
    }

    // Trigger the change handler to show/hide appropriate panels and load strategies
    handleSourceTypeChange({ target: { value: source.type } }, 'edit', source);

    editSourceModal.style.display = 'block'; // Show the modal
  } catch (error) {
    console.error('Error fetching source for editing:', error);
  }
}

export async function handleEditSourceSubmit(event) {
  event.preventDefault();
  console.log('Handler: handleEditSourceSubmit called');

  const form = event.target;
  // @ts-ignore
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

/**
 * Closes the edit source modal.
 */
export function closeEditSourceModal() {
  const modal = document.getElementById('edit-source-modal');
  const form = document.getElementById('edit-source-form');
  if (modal && form) {
    modal.style.display = 'none';
    form.reset(); // Clear form fields
    // Hide all type-specific panels
    for (const panel of document.querySelectorAll('.source-type-panel')) {
      // @ts-ignore
      if (panel.id.startsWith('edit-source-panel-')) {
        // @ts-ignore
        panel.style.display = 'none';
      }
    }
    const fieldsContainer = document.getElementById(
      'edit-source-fields-container'
    );
    if (fieldsContainer) {
      fieldsContainer.style.display = 'none';
    }
  }
}
