// public/js/modules/settings/sources.handlers.js
import {
  addSource,
  deleteSource,
  getSource,
  getSources,
  updateSource,
} from './sources.api.js';
import { getWebApps } from './webapps.api.js';

/**
 * Updates the image preview in the add/edit source forms.
 * @param {string} type - The source type (e.g., 'person', 'book').
 * @param {string | null} filename - The filename from the input field.
 */
export function updateImagePreview(type, filename) {
  const previewImg = /** @type {HTMLImageElement | null} */ (
    document.getElementById('source-form-image-preview')
  );
  if (!previewImg) return;

  let folderPath = 'images/';
  switch (type) {
    case 'person':
      folderPath = 'images/contacts/';
      break;
    case 'group':
      folderPath = 'images/group/';
      break;
    case 'book':
      folderPath = 'images/books/';
      break;
    case 'website':
      folderPath = 'images/url/';
      break;
    default:
      // If no type, hide the image
      previewImg.style.display = 'none';
      return;
  }

  // Use 'default.png' if filename is empty or null
  const file = filename || 'default.png';
  previewImg.src = folderPath + file;
  previewImg.style.display = 'block'; // Show the image

  // Set fallback image for broken links or typos
  // --- START: FIX ---
  // Changed placeholder to a file that exists
  const genericPlaceholder = 'images/contacts/default.png';
  // --- END: FIX ---
  // @ts-ignore
  previewImg.onerror = () => {
    previewImg.onerror = null; // prevent infinite loops
    // @ts-ignore
    previewImg.src = genericPlaceholder;
  };
}

/**
 * Fetches web apps and populates the app type dropdowns.
 * @param {string | null} [personAppType] - The value to pre-select for person.
 * @param {string | null} [groupAppType] - The value to pre-select for group.
 */
async function populateWebAppDropdowns(
  personAppType = null,
  groupAppType = null
) {
  const personSelect = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('source-form-person-app-type')
  );
  const groupSelect = /** @type {HTMLSelectElement | null} */ (
    document.getElementById('source-form-group-app-type')
  );

  if (!personSelect || !groupSelect) return;

  // Clear existing options (except the first "Select..." option)
  personSelect.length = 1;
  groupSelect.length = 1;

  try {
    const webApps = await getWebApps();
    for (const app of webApps) {
      personSelect.add(new Option(app.name, app.name));
      groupSelect.add(new Option(app.name, app.name));
    }

    // Pre-select values if provided (for edit mode)
    if (personAppType) personSelect.value = personAppType;
    if (groupAppType) groupSelect.value = groupAppType;
  } catch (error) {
    console.error('Failed to load web apps for dropdowns:', error);
  }
}

/**
 * Handles changes to the source type dropdown.
 * @param {string} selectedType - The new type, e.g., 'person', 'book'.
 * @param {Partial<import('../../types.js').Source>} [sourceData={}] - Optional source data for pre-filling.
 */
export function handleSourceTypeChange(selectedType, sourceData = {}) {
  // Hide all dynamic panels first
  const panels = document.querySelectorAll(
    '#source-form-fields-container .source-type-panel'
  );
  for (const panel of panels) {
    // @ts-ignore
    panel.style.display = 'none';
  }

  // Show the selected panel
  const selectedPanel = document.getElementById(
    `source-form-panel-${selectedType}`
  );
  if (selectedPanel) {
    // @ts-ignore
    selectedPanel.style.display = 'block';
  }

  // Show/hide the fields container
  const fieldsContainer = document.getElementById(
    'source-form-fields-container'
  );
  if (fieldsContainer) {
    // @ts-ignore
    fieldsContainer.style.display = selectedType ? 'block' : 'none';
  }

  // --- START: Image Preview Logic ---
  const imgPathWrapper = document.getElementById(
    'source-form-image-path-wrapper'
  );
  if (imgPathWrapper) {
    if (selectedType) {
      imgPathWrapper.style.display = 'block';
      // @ts-ignore
      updateImagePreview(selectedType, sourceData.image_path || 'default.png');
    } else {
      imgPathWrapper.style.display = 'none';
      updateImagePreview(selectedType, null); // Will hide the image
    }
  }
  // --- END: Image Preview Logic ---

  // Handle label changes and URL field visibility
  const nameLabel = document.querySelector('label[for="source-form-name"]');
  const urlWrapper = document.getElementById('source-form-url-wrapper');
  const urlLabel = document.querySelector('label[for="source-form-url"]');

  if (!nameLabel || !urlWrapper || !urlLabel) return;

  if (selectedType === 'book') {
    nameLabel.textContent = 'Title:';
    urlWrapper.style.display = 'block';
    urlLabel.textContent = 'Book URL:';
  } else if (selectedType === 'website') {
    nameLabel.textContent = 'Website Name:';
    urlWrapper.style.display = 'block';
    urlLabel.textContent = 'Website URL:';
  } else {
    nameLabel.textContent = 'Name:';
    urlWrapper.style.display =
      selectedType === 'person' || selectedType === 'group' ? 'none' : 'block';
    urlLabel.textContent = 'URL:';
  }
}

export async function loadSourcesList() {
  console.log('Handler: loadSourcesList called');
  const sources = await getSources();
  const sourcesContainer = document.getElementById('advice-source-list');
  if (sourcesContainer) {
    sourcesContainer.innerHTML = ''; // Clear existing list
    if (sources.length === 0) {
      sourcesContainer.innerHTML = '<p>No advice sources found.</p>';
      return;
    }
    for (const source of sources) {
      const sourceElement = document.createElement('div');
      sourceElement.className = 'advice-source-item';
      sourceElement.dataset.id = String(source.id); // Ensure ID is string

      const infoSpan = document.createElement('span');
      infoSpan.classList.add('source-info');
      infoSpan.textContent = `${source.name} (${source.type})`;
      sourceElement.appendChild(infoSpan);

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('source-actions');
      actionsDiv.innerHTML = `
        <button class="edit-source-btn table-action-btn btn-secondary" data-id="${source.id}">Edit</button>
        <button class="delete-source-btn table-action-btn btn-danger" data-id="${source.id}">Delete</button>
      `;
      sourceElement.appendChild(actionsDiv);
      sourcesContainer.appendChild(sourceElement);

      // Event listener is now handled by delegation in settings/index.js
    }
  }
}

/**
 * Opens the single modal for adding or editing a source.
 * @param {string | null} sourceId - The ID of the source to edit, or null to add.
 */
export async function openSourceFormModal(sourceId = null) {
  const modal = document.getElementById('source-form-modal');
  const form = /** @type {HTMLFormElement | null} */ (
    document.getElementById('source-form-form')
  );
  const title = document.getElementById('source-form-title');
  const submitBtn = document.getElementById('source-form-submit-btn');

  if (!modal || !form || !title || !submitBtn) {
    console.error('Source form modal elements not found.');
    return;
  }

  // --- START: DICTIONARY PATTERN ---
  const elements = {
    id: /** @type {HTMLInputElement} */ (form.elements.namedItem('id')),
    type: /** @type {HTMLSelectElement} */ (form.elements.namedItem('type')),
    name: /** @type {HTMLInputElement} */ (form.elements.namedItem('name')),
    url: /** @type {HTMLInputElement} */ (form.elements.namedItem('url')),
    description: /** @type {HTMLTextAreaElement} */ (
      form.elements.namedItem('description')
    ),
    image_path: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('image_path')
    ),
    person_email: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('person_email')
    ),
    person_phone: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('person_phone')
    ),
    person_app_handle: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('person_app_handle')
    ),
    group_primary_contact: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('group_primary_contact')
    ),
    group_email: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('group_email')
    ),
    group_phone: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('group_phone')
    ),
    group_app_handle: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('group_app_handle')
    ),
    book_author: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('book_author')
    ),
    book_isbn: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('book_isbn')
    ),
    website_websites: /** @type {HTMLInputElement} */ (
      form.elements.namedItem('website_websites')
    ),
  };
  // --- END: DICTIONARY PATTERN ---

  form.reset(); // Clear the form

  if (sourceId) {
    // --- EDIT MODE ---
    title.textContent = 'Edit Source';
    submitBtn.textContent = 'Save Changes';
    try {
      const source = await getSource(sourceId);
      if (!source) {
        console.error('Source not found for ID:', sourceId);
        return;
      }

      // Populate common fields
      elements.id.value = source.id.toString();
      elements.type.value = source.type;
      elements.name.value = source.name;
      elements.url.value = source.url || '';
      elements.description.value = source.description || '';
      elements.image_path.value = source.image_path || '';

      // Populate person fields
      elements.person_email.value = source.person_email || '';
      elements.person_phone.value = source.person_phone || '';
      elements.person_app_handle.value = source.person_app_handle || '';

      // Populate group fields
      elements.group_primary_contact.value = source.group_primary_contact || '';
      elements.group_email.value = source.group_email || '';
      elements.group_phone.value = source.group_phone || '';
      elements.group_app_handle.value = source.group_app_handle || '';

      // Populate book/website fields (add as needed)
      if (elements.book_author)
        elements.book_author.value = source.book_author || '';
      if (elements.book_isbn) elements.book_isbn.value = source.book_isbn || '';
      if (elements.website_websites)
        elements.website_websites.value = source.website_websites || '';

      // Populate dropdowns AND pre-select values
      await populateWebAppDropdowns(
        source.person_app_type,
        source.group_app_type
      );

      // Trigger change handler to show panels and image
      handleSourceTypeChange(elements.type.value, source);
    } catch (error) {
      console.error('Error fetching source for editing:', error);
      return;
    }
  } else {
    // --- ADD MODE ---
    title.textContent = 'Add New Source';
    submitBtn.textContent = 'Save Source';
    elements.id.value = ''; // Ensure ID is empty

    // Populate dropdowns with no pre-selection
    await populateWebAppDropdowns();
    // Trigger change handler to reset/hide panels
    handleSourceTypeChange(elements.type.value);
  }

  // @ts-ignore
  modal.style.display = 'block'; // Show the modal
}

/**
 * Handles the submission of the "Add New Source" form.
 * @param {Event} event - The form submission event.
 */
export async function handleSourceFormSubmit(event) {
  event.preventDefault();
  console.log('Handler: handleSourceFormSubmit called');

  const form = /** @type {HTMLFormElement} */ (event.target);
  const formData = new FormData(form);
  const sourceData = Object.fromEntries(formData.entries());
  const sourceId = sourceData.id;

  try {
    if (sourceId) {
      // --- UPDATE (EDIT) ---
      await updateSource(/** @type {string} */ (sourceData.id), sourceData);
      console.log('Source updated:', sourceId);
    } else {
      // --- CREATE (ADD) ---
      await addSource(sourceData);
      console.log('Source added');
    }
    loadSourcesList(); // Refresh the list
    closeSourceFormModal(); // Hide the modal
  } catch (error) {
    console.error('Error saving source:', error);
    alert('Error saving source. See console for details.');
  }
}

/**
 * @param {string} sourceId
 */
export function handleDeleteSourceClick(sourceId) {
  console.log('Handler: handleDeleteSourceClick called', sourceId);
  if (confirm('Are you sure you want to delete this source?')) {
    deleteSource(sourceId)
      .then(() => {
        console.log('Source deleted:', sourceId);
        loadSourcesList(); // Refresh the list
      })
      .catch((error) => {
        console.error('Error deleting source:', error);
        alert('Error deleting source. See console for details.');
      });
  }
}

/**
 * Closes the edit source modal.
 */
export function closeSourceFormModal() {
  const modal = document.getElementById('source-form-modal');
  const form = /** @type {HTMLFormElement | null} */ (
    document.getElementById('source-form-form')
  );
  if (modal && form) {
    // @ts-ignore
    modal.style.display = 'none';
    form.reset(); // Clear form fields
    // Manually trigger type change to hide all panels
    const typeSelect = /** @type {HTMLSelectElement | null} */ (
      document.getElementById('source-form-type')
    );
    if (typeSelect) {
      typeSelect.value = '';
      handleSourceTypeChange(typeSelect.value);
    }
  }
}

/**
 * Handles clearing the source form.
 */
export function handleClearSourceForm() {
  const form = /** @type {HTMLFormElement | null} */ (
    document.getElementById('source-form-form')
  );
  if (!form) return;

  // --- START: DICTIONARY PATTERN ---
  const elements = {
    id: /** @type {HTMLInputElement} */ (form.elements.namedItem('id')),
    type: /** @type {HTMLSelectElement} */ (form.elements.namedItem('type')),
  };
  // --- END: DICTIONARY PATTERN ---

  if (elements.id && elements.type) {
    const id = elements.id.value; // Preserve ID if editing
    form.reset();
    elements.id.value = id; // Restore ID
    elements.type.value = ''; // Reset dropdown
    handleSourceTypeChange(elements.type.value); // Trigger UI reset
  }
}