// public/js/modules/settings/exchanges.handlers.js
import * as api from './exchanges.api.js';

// --- START: ADD CACHE ---
let cachedExchanges = null;
// --- END: ADD CACHE ---

/**
 * Renders the list of exchanges into the container.
 * @param {Array<object>} exchanges - The array of exchange objects.
 * @param {HTMLElement} container - The container element to render into.
 */
function renderExchangesList(exchanges, container) {
  if (!exchanges || exchanges.length === 0) {
    container.innerHTML = '<p>No exchanges found.</p>';
    return;
  }

  // Create list
  const list = document.createElement('ul');
  list.className = 'settings-list'; // A generic class
  for (const exchange of exchanges) {
    const item = document.createElement('li');
    item.className = 'exchange-item'; // From components.css
    item.innerHTML = `
      <span class="exchange-name">${exchange.name}</span>
      <div class="exchange-actions">
        <button class="btn btn-danger table-action-btn delete-exchange-btn" data-id="${exchange.id}">Delete</button>
      </div>
    `;
    list.appendChild(item);
  }
  container.innerHTML = ''; // Clear "Loading..."
  container.appendChild(list);
}

/**
 * Handles the submission of the "Add New Exchange" form.
 * @param {Event} event - The form submission event.
 */
export async function handleAddExchangeSubmit(event) {
  event.preventDefault();
  console.log('handleAddExchangeSubmit called');

  const form = /** @type {HTMLFormElement} */ (event.target);
  const formData = new FormData(form);
  const exchangeName = formData.get('name');

  if (!exchangeName) {
    alert('Please enter an exchange name.');
    return;
  }

  try {
    await api.addExchange(exchangeName);
    // --- START: CACHE ---
    cachedExchanges = null; // Invalidate cache
    // --- END: CACHE ---
    form.reset();
    loadExchangesList(); // Refresh the list
  } catch (error) {
    console.error('Error adding exchange:', error);
    alert('Failed to add exchange. See console for details.');
  }
}

/**
 * Loads and renders the list of exchanges.
 */
export async function loadExchangesList() {
  const container = document.getElementById('exchange-list');
  if (!container) return;

  // --- START: CACHE ---
  if (cachedExchanges) {
    console.log('Loading exchanges from cache...');
    renderExchangesList(cachedExchanges, container);
    return;
  }
  // --- END: CACHE ---

  container.innerHTML = '<p>Loading exchanges...</p>'; // Placeholder

  try {
    const exchanges = await api.getExchanges();
    // --- START: CACHE ---
    cachedExchanges = exchanges; // Store in cache
    // --- END: CACHE ---
    renderExchangesList(exchanges, container);
  } catch (error) {
    console.error('Error loading exchanges list:', error);
    container.innerHTML = '<p class="error">Failed to load exchanges.</p>';
  }
}

/**
 * Handles delete button clicks for exchanges.
 * @param {string} exchangeId - The ID of the exchange to delete.
 */
export async function handleDeleteExchangeClick(exchangeId) {
  if (!confirm('Are you sure you want to delete this exchange?')) {
    return;
  }

  try {
    await api.deleteExchange(exchangeId);
    // --- START: CACHE ---
    cachedExchanges = null; // Invalidate cache
    // --- END: CACHE ---
    loadExchangesList(); // Refresh the list
  } catch (error) {
    console.error('Error deleting exchange:', error);
    alert('Failed to delete exchange. See console for details.');
  }
}