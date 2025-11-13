// public/js/modules/settings/webapps.handlers.js
import { addWebApp, deleteWebApp, getWebApps } from './webapps.api.js';

const webAppList = document.getElementById('webapp-list');
const addWebAppForm = document.getElementById('add-webapp-form');
const newWebAppNameInput = document.getElementById('new-webapp-name');
const clearWebAppBtn = document.getElementById('clear-webapp-btn');

export async function renderWebApps() {
  try {
    const webApps = await getWebApps();
    webAppList.innerHTML = ''; // Clear existing list

    if (webApps.length === 0) {
      webAppList.innerHTML = '<p>No web apps added yet.</p>';
      return;
    }

    const ul = document.createElement('ul');
    for (const app of webApps) {
      const li = document.createElement('li');
      li.dataset.id = app.id;
      li.innerHTML = `
                <span>${app.name}</span>
                <button type="button" class="delete-webapp-btn">Delete</button>
            `;
      ul.appendChild(li);
    }
    webAppList.appendChild(ul);

    attachDeleteListeners();
  } catch (error) {
    console.error('Error rendering web apps:', error);
    webAppList.innerHTML = `<p class="error">Failed to load web apps: ${error.message}</p>`;
  }
}

async function handleAddWebApp(event) {
  event.preventDefault();
  const name = newWebAppNameInput.value.trim();

  if (!name) {
    alert('Web app name cannot be empty.');
    return;
  }

  try {
    await addWebApp(name);
    newWebAppNameInput.value = ''; // Clear input
    await renderWebApps(); // Re-render the list
  } catch (error) {
    console.error('Error adding web app:', error);
    alert(`Failed to add web app: ${error.message}`);
  }
}

async function handleDeleteWebApp(event) {
  if (event.target.classList.contains('delete-webapp-btn')) {
    const button = event.target;
    const li = button.closest('li');
    const id = li.dataset.id;
    const name = li.querySelector('span').textContent;

    if (confirm(`Are you sure you want to delete the web app "${name}"?`)) {
      try {
        await deleteWebApp(id);
        await renderWebApps(); // Re-render the list
      } catch (error) {
        console.error('Error deleting web app:', error);
        alert(`Failed to delete web app: ${error.message}`);
      }
    }
  }
}

function attachDeleteListeners() {
  const deleteButtons = webAppList.querySelectorAll('.delete-webapp-btn');
  for (const button of deleteButtons) {
    button.removeEventListener('click', handleDeleteWebApp); // Prevent duplicate listeners
    button.addEventListener('click', handleDeleteWebApp);
  }
}

function clearForm() {
  newWebAppNameInput.value = '';
}

export function initializeWebAppsPanel() {
  if (addWebAppForm) {
    addWebAppForm.removeEventListener('submit', handleAddWebApp); // Prevent duplicate listeners
    addWebAppForm.addEventListener('submit', handleAddWebApp);
  }
  if (clearWebAppBtn) {
    clearWebAppBtn.removeEventListener('click', clearForm); // Prevent duplicate listeners
    clearWebAppBtn.addEventListener('click', clearForm);
  }
  // Initial render when the panel is initialized
  renderWebApps();
}
