import { addSource, deleteSource, getSources, updateSource } from './sources.api.js';

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
