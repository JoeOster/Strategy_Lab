// public/js/modules/strategy-lab/sources/strategy-form.handlers.js

import { addStrategy, getStrategy, updateStrategy } from './api.js';
import { loadStrategiesForSource } from './modal.handlers.js'; // To refresh the table

const addStrategyModal = document.getElementById('add-strategy-modal');
const editStrategyModal = document.getElementById('edit-strategy-modal');
const logStrategyForm = document.getElementById('log-strategy-form');
const editStrategyForm = document.getElementById('edit-strategy-form');

/**
 * Opens the add strategy modal.
 * @param {Event} event
 */
export function handleShowStrategyForm(event) {
  // @ts-ignore
  const sourceId = event.target.dataset.sourceId;
  if (!sourceId) {
    console.error('Source ID not found for adding strategy.');
    return;
  }

  // @ts-ignore
  document.getElementById('strategy-source-id').value = sourceId;
  // Reset form fields
  // @ts-ignore
  logStrategyForm.reset();
  // @ts-ignore
  addStrategyModal.style.display = 'block';
}

/**
 * Opens the edit strategy modal and populates it with existing data.
 * @param {string} strategyId
 */
export async function handleShowEditStrategyForm(strategyId) {
  try {
    const strategy = await getStrategy(strategyId);
    if (!strategy) {
      console.error(`Strategy with ID ${strategyId} not found.`);
      return;
    }

    // Populate form fields
    // @ts-ignore
    document.getElementById('edit-strategy-id').value = strategy.id;
    // @ts-ignore
    document.getElementById('edit-strategy-source-id').value =
      strategy.source_id;
    // @ts-ignore
    document.getElementById('edit-strategy-title').value = strategy.title;
    // @ts-ignore
    document.getElementById('edit-strategy-ticker').value =
      strategy.ticker || '';
    // @ts-ignore
    document.getElementById('edit-strategy-chapter').value =
      strategy.chapter || '';
    // @ts-ignore
    document.getElementById('edit-strategy-page-number').value =
      strategy.page_number || '';
    // @ts-ignore
    document.getElementById('edit-strategy-description').value =
      strategy.description || '';
    // @ts-ignore
    document.getElementById('edit-strategy-pdf-path').value =
      strategy.pdf_path || '';

    // @ts-ignore
    editStrategyModal.style.display = 'block';
  } catch (error) {
    console.error(`Failed to load strategy ${strategyId} for editing:`, error);
    alert('Failed to load strategy for editing.');
  }
}

// Event listener for adding a strategy
if (logStrategyForm) {
  logStrategyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // @ts-ignore
    const formData = new FormData(logStrategyForm);
    const strategyData = Object.fromEntries(formData.entries());

    try {
      await addStrategy(strategyData);
      alert('Strategy added successfully!');
      // @ts-ignore
      addStrategyModal.style.display = 'none';
      // Refresh strategies table in the source detail modal
      // @ts-ignore
      const sourceId = document.getElementById('strategy-source-id').value;
      if (sourceId) {
        loadStrategiesForSource(sourceId);
      }
    } catch (error) {
      console.error('Failed to add strategy:', error);
      alert('Failed to add strategy.');
    }
  });
}

// Event listener for editing a strategy
if (editStrategyForm) {
  editStrategyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // @ts-ignore
    const formData = new FormData(editStrategyForm);
    const strategyData = Object.fromEntries(formData.entries());
    // @ts-ignore
    const strategyId = document.getElementById('edit-strategy-id').value;

    try {
      await updateStrategy(strategyId, strategyData);
      alert('Strategy updated successfully!');
      // @ts-ignore
      editStrategyModal.style.display = 'none';
      // Refresh strategies table in the source detail modal
      // @ts-ignore
      const sourceId = document.getElementById('edit-strategy-source-id').value;
      if (sourceId) {
        loadStrategiesForSource(sourceId);
      }
    } catch (error) {
      console.error('Failed to update strategy:', error);
      alert('Failed to update strategy.');
    }
  });
}

// Close buttons for modals
if (addStrategyModal) {
  addStrategyModal
    .querySelector('.close-button')
    ?.addEventListener('click', () => {
      // @ts-ignore
      addStrategyModal.style.display = 'none';
    });
  addStrategyModal
    .querySelector('#cancel-strategy-form-btn')
    ?.addEventListener('click', () => {
      // @ts-ignore
      addStrategyModal.style.display = 'none';
    });
}

if (editStrategyModal) {
  editStrategyModal
    .querySelector('.close-button')
    ?.addEventListener('click', () => {
      // @ts-ignore
      editStrategyModal.style.display = 'none';
    });
  editStrategyModal
    .querySelector('#cancel-edit-strategy-form-btn')
    ?.addEventListener('click', () => {
      // @ts-ignore
      editStrategyModal.style.display = 'none';
    });
}

// Close modals when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === addStrategyModal) {
    // @ts-ignore
    addStrategyModal.style.display = 'none';
  }
  if (event.target === editStrategyModal) {
    // @ts-ignore
    editStrategyModal.style.display = 'none';
  }
});
