// public/js/modules/settings/exchanges.handlers.js

import { addExchange, deleteExchange, getExchanges } from './exchanges.api.js';

/**
 * Loads the list of exchanges and renders them in the UI.
 */
export async function loadExchangesList() {
  console.log('loadExchangesList called');
  const exchangeListDiv = document.getElementById('exchange-list');
  if (!exchangeListDiv) {
    console.error('Exchange list div not found.');
    return;
  }

  try {
    const exchanges = await getExchanges();
    exchangeListDiv.innerHTML = ''; // Clear existing list

    if (exchanges.length === 0) {
      exchangeListDiv.innerHTML = '<p>No exchanges added yet.</p>';
      return;
    }

    const ul = document.createElement('ul');
    for (const exchange of exchanges) {
      const li = document.createElement('li');
      li.classList.add('exchange-item'); // Add a class for consistent styling of list items

      const nameSpan = document.createElement('span');
      nameSpan.classList.add('exchange-name');
      nameSpan.textContent = exchange.name;
      li.appendChild(nameSpan);

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('exchange-actions');
      actionsDiv.innerHTML = `
        <button class="delete-exchange-btn table-action-btn" data-id="${exchange.id}">Delete</button>
      `;
      li.appendChild(actionsDiv);
      ul.appendChild(li);
    }
    exchangeListDiv.appendChild(ul);
  } catch (error) {
    console.error('Failed to load exchanges:', error);
    exchangeListDiv.innerHTML = '<p>Failed to load exchanges.</p>';
  }
}

/**
 * Handles the submission of the add new exchange form.
 * @param {Event} event - The form submission event.
 */
export async function handleAddExchangeSubmit(event) {
  event.preventDefault();

  const newExchangeNameInput = document.getElementById('new-exchange-name');
  const name = newExchangeNameInput.value.trim();

  if (!name) {
    alert('Exchange name cannot be empty.');
    return;
  }

  try {
    await addExchange({ name });
    newExchangeNameInput.value = ''; // Clear the form
    await loadExchangesList(); // Refresh the list
  } catch (error) {
    console.error('Failed to add exchange:', error);
    alert('Failed to add exchange. Please try again.');
  }
}

/**
 * Handles the deletion of an exchange.
 * @param {string} id - The ID of the exchange to delete.
 */
export async function handleDeleteExchangeClick(id) {
  if (!confirm('Are you sure you want to delete this exchange?')) {
    return;
  }
  try {
    await deleteExchange(id);
    await loadExchangesList(); // Refresh the list
  } catch (error) {
    console.error('Failed to delete exchange:', error);
    alert('Failed to delete exchange. Please try again.');
  }
}

/**
 * Handles clearing the exchange form.
 */
export function handleClearExchangeForm() {
  console.log('handleClearExchangeForm called');
  const addExchangeForm = document.getElementById('add-exchange-form');
  if (addExchangeForm) {
    addExchangeForm.reset();
  }
}
