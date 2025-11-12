// public/js/modules/settings/sources.handlers.js
import { addSource, deleteSource, getSources } from './sources.api.js';

export function handleAddNewSourceSubmit(event) {
  event.preventDefault();
  console.log('Handler: handleAddNewSourceSubmit called (placeholder)');

  const form = event.target;
  const newSource = {
    name: form['new-source-name'].value,
    type: form['new-source-type'].value,
    author: form['new-source-author'] ? form['new-source-author'].value : '',
    contact: form['new-source-contact'] ? form['new-source-contact'].value : '',
    notes: form['new-source-notes'].value,
  };

  addSource(newSource)
    .then((addedSource) => {
      console.log('Source added:', addedSource);
      form.reset();
      loadSourcesList(); // Refresh the list
    })
    .catch((error) => console.error('Error adding source:', error));
}

export function handleSourceTypeChange(event, formType) {
  console.log(
    'Handler: handleSourceTypeChange called (placeholder)',
    event.target.value,
    formType
  );
  const selectedType = event.target.value;
  const formPrefix = formType === 'new' ? 'new-source' : 'edit-source';

  const authorGroup = document.getElementById(`${formPrefix}-author-group`);
  const contactGroup = document.getElementById(`${formPrefix}-contact-group`);

  if (selectedType === 'Book') {
    if (authorGroup) authorGroup.style.display = 'block';
    if (contactGroup) contactGroup.style.display = 'none';
  } else if (selectedType === 'Person') {
    if (authorGroup) authorGroup.style.display = 'none';
    if (contactGroup) contactGroup.style.display = 'block';
  } else {
    if (authorGroup) authorGroup.style.display = 'none';
    if (contactGroup) contactGroup.style.display = 'none';
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
      sourceElement.className = 'advice-source-item';
      sourceElement.innerHTML = `
        <span>${source.name} (${source.type})</span>
        <button class="edit-source-btn" data-id="${source.id}">Edit</button>
        <button class="delete-source-btn" data-id="${source.id}">Delete</button>
      `;
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
