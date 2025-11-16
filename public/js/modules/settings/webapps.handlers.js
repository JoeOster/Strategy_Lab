// public/js/modules/settings/webapps.handlers.js
import * as api from './webapps.api.js';

// --- START: ADD CACHE ---
let cachedWebApps = null;
// --- END: ADD CACHE ---

/**
 * Renders the list of web apps into the container.
 * @param {Array<object>} webApps - The array of web app objects.
 * @param {HTMLElement} container - The container element to render into.
 */
function renderWebAppsList(webApps, container) {
  if (!webApps || webApps.length === 0) {
    container.innerHTML = '<p>No Web Apps found.</p>';
    return;
  }

  // Create list
  const list = document.createElement('ul');
  list.className = 'settings-list'; // A generic class
  for (const app of webApps) {
    const item = document.createElement('li');
    item.className = 'webapp-item'; // From components.css
    item.innerHTML = `
      <span class="webapp-name">${app.name}</span>
      <div class="webapp-actions">
        <button class="btn btn-danger table-action-btn delete-webapp-btn" data-id="${app.id}">Delete</button>
      </div>
    `;
    list.appendChild(item);
  }
  container.innerHTML = ''; // Clear "Loading..."
  container.appendChild(list);
}

/**
 * Handles the submission of the "Add New Web App" form.
 * @param {Event} event - The form submission event.
 */
export async function handleAddWebAppSubmit(event) {
  event.preventDefault();

  const form = /** @type {HTMLFormElement} */ (event.target);
  const formData = new FormData(form);
  const webAppName = /** @type {string} */ (formData.get('name'));

  if (!webAppName) {
    alert('Please enter a name for the Web App.');
    return;
  }

  try {
    await api.addWebApp(webAppName);
    // --- START: CACHE ---
    cachedWebApps = null; // Invalidate cache
    // --- END: CACHE ---
    form.reset();
    loadWebAppsList(); // Refresh the list
  } catch (error) {
    console.error('Error adding Web App:', error);
    alert('Failed to add Web App. See console for details.');
  }
}

/**
 * Loads and renders the list of Web Apps.
 */
export async function loadWebAppsList() {
  const container = document.getElementById('webapp-list');
  if (!container) return;

  // --- START: CACHE ---
  if (cachedWebApps) {
    console.log('Loading Web Apps from cache...');
    renderWebAppsList(cachedWebApps, container);
    return;
  }
  // --- END: CACHE ---

  container.innerHTML = '<p>Loading Web Apps...</p>'; // Placeholder

  try {
    const webApps = await api.getWebApps();
    // --- START: CACHE ---
    cachedWebApps = webApps; // Store in cache
    // --- END: CACHE ---
    renderWebAppsList(webApps, container);
  } catch (error) {
    console.error('Error loading Web Apps list:', error);
    container.innerHTML = '<p class="error">Failed to load Web Apps.</p>';
  }
}

/**
 * Handles delete button clicks for Web Apps.
 * @param {string} webAppId - The ID of the web app to delete.
 */
export async function handleDeleteWebAppClick(webAppId) {
  if (!confirm('Are you sure you want to delete this Web App?')) {
    return;
  }

  try {
    await api.deleteWebApp(webAppId);
    // --- START: CACHE ---
    cachedWebApps = null; // Invalidate cache
    // --- END: CACHE ---
    loadWebAppsList(); // Refresh the list
  } catch (error) {
    console.error('Error deleting Web App:', error);
    alert('Failed to delete Web App. See console for details.');
  }
}