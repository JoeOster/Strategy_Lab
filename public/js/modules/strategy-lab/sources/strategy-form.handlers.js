// public/js/modules/strategy-lab/sources/strategy-form.handlers.js

/** @typedef {import('../../../types.js').Strategy} Strategy */

import { addStrategy, getStrategy, updateStrategy } from './api.js';
import {
  loadStrategiesForSource,
} from './modal.handlers.js';

// --- START: "Log New Strategy" Modal Functions ---

/**
 * Shows the "Log New Strategy" form modal.
 * @param {Event} event - The click event.
 */
export function handleShowStrategyForm(event) {
  if (!(event.target instanceof HTMLElement)) return;

  const addStrategyModal = document.getElementById('add-strategy-modal');
  const strategySourceIdInput = document.getElementById('strategy-source-id');

  if (addStrategyModal && strategySourceIdInput) {
    const sourceId = event.target.dataset.sourceId;
    if (sourceId) {
      // @ts-ignore
      strategySourceIdInput.value = sourceId;
    }
    // @ts-ignore
    addStrategyModal.style.display = 'block';

    // Attach listener for the new "Cancel" button
    document
      .getElementById('cancel-strategy-form-btn')
      ?.addEventListener('click', handleCancelStrategyForm);

    // Attach listener for the modal's close button
    addStrategyModal
      .querySelector('.close-button')
      ?.addEventListener('click', handleCancelStrategyForm);

    // Attach listener for the form submission
    document
      .getElementById('log-strategy-form')
      ?.addEventListener('submit', handleLogStrategySubmit);

    // Attach listener for closing the modal by clicking outside
    /** @param {MouseEvent} event */
    window.onclick = (event) => {
      if (event.target === addStrategyModal) {
        handleCancelStrategyForm();
      }
    };
  }
}

/**
 * Hides the "Log New Strategy" form modal.
 */
export function handleCancelStrategyForm() {
  const addStrategyModal = document.getElementById('add-strategy-modal');
  if (addStrategyModal) {
    // @ts-ignore
    addStrategyModal.style.display = 'none';
    const form = /** @type {HTMLFormElement | null} */ (
      document.getElementById('log-strategy-form')
    );
    if (form) form.reset();

    // Clean up listeners
    document
      .getElementById('cancel-strategy-form-btn')
      ?.removeEventListener('click', handleCancelStrategyForm);
    addStrategyModal
      .querySelector('.close-button')
      ?.removeEventListener('click', handleCancelStrategyForm);
    document
      .getElementById('log-strategy-form')
      ?.removeEventListener('submit', handleLogStrategySubmit);
    // @ts-ignore
    window.onclick = null; // Be careful if other modals use this
  }
}

/**
 * Handles the submission of the "Log New Strategy" form.
 * @param {Event} event - The form submission event.
 */
async function handleLogStrategySubmit(event) {
  event.preventDefault(); // This STOPS the page from reloading
  console.log('Strategy form submitted.');

  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  const form = event.target;

  const formData = new FormData(form);
  const strategyData = Object.fromEntries(formData.entries());
  console.log('Strategy data being sent:', strategyData);

  try {
    // @ts-ignore
    await addStrategy(strategyData);
    alert('Strategy saved successfully!');
    handleCancelStrategyForm(); // Hide and clear the form

    // Refresh the strategies table in the (still open) detail modal
    // @ts-ignore
    await loadStrategiesForSource(String(strategyData.source_id));
  } catch (error) {
    console.error('Failed to save strategy:', error);
    alert('Error: Could not save strategy. Please check the console.');
  }
}

// --- END: "Log New Strategy" Modal Functions ---

// --- START: "Edit Strategy" Modal Functions ---

/**
 * Shows the "Edit Strategy" form modal and populates it with data.
 * @param {string} strategyId - The ID of the strategy to edit.
 */
export async function handleShowEditStrategyForm(strategyId) {
  const editStrategyModal = document.getElementById('edit-strategy-modal');
  if (!editStrategyModal) return;

  try {
    const strategy = await getStrategy(strategyId);

    // Populate the form
    // @ts-ignore
    document.getElementById('edit-strategy-id').value = strategy.id;
    // @ts-ignore
    document.getElementById('edit-strategy-source-id').value =
      strategy.source_id;
    // @ts-ignore
    document.getElementById('edit-strategy-title').value = strategy.title;
    // @ts-ignore
    document.getElementById('edit-strategy-ticker').value = strategy.ticker;
    // @ts-ignore
    document.getElementById('edit-strategy-chapter').value = strategy.chapter;
    // @ts-ignore
    document.getElementById('edit-strategy-page-number').value =
      strategy.page_number;
    // @ts-ignore
    document.getElementById('edit-strategy-description').value =
      strategy.description;
    // @ts-ignore
    document.getElementById('edit-strategy-pdf-path').value = strategy.pdf_path;

    // @ts-ignore
    editStrategyModal.style.display = 'block';

    // Attach listeners
    document
      .getElementById('cancel-edit-strategy-form-btn')
      ?.addEventListener('click', handleCancelEditStrategyForm);
    editStrategyModal
      .querySelector('.close-button')
      ?.addEventListener('click', handleCancelEditStrategyForm);
    document
      .getElementById('edit-strategy-form')
      ?.addEventListener('submit', handleEditStrategySubmit);
    /** @param {MouseEvent} event */
    window.onclick = (event) => {
      if (event.target === editStrategyModal) {
        handleCancelEditStrategyForm();
      }
    };
  } catch (error) {
    console.error('Failed to show edit strategy form:', error);
    alert('Could not load strategy data for editing.');
  }
}

/**
 * Hides the "Edit Strategy" form modal.
 */
export function handleCancelEditStrategyForm() {
  const editStrategyModal = document.getElementById('edit-strategy-modal');
  if (editStrategyModal) {
    // @ts-ignore
    editStrategyModal.style.display = 'none';
    const form = document.getElementById('edit-strategy-form');
    // @ts-ignore
    if (form) form.reset();

    // Clean up listeners
    document
      .getElementById('cancel-edit-strategy-form-btn')
      ?.removeEventListener('click', handleCancelEditStrategyForm);
    editStrategyModal
      .querySelector('.close-button')
      ?.removeEventListener('click', handleCancelEditStrategyForm);
    document
      .getElementById('edit-strategy-form')
      ?.removeEventListener('submit', handleEditStrategySubmit);
    // @ts-ignore
    window.onclick = null;
  }
}

/**
 * Handles the submission of the "Edit Strategy" form.
 * @param {Event} event - The form submission event.
 */
async function handleEditStrategySubmit(event) {
  event.preventDefault();
  // @ts-ignore
  const form = event.target;
  const formData = new FormData(form);
  const strategyData = Object.fromEntries(formData.entries());
  // @ts-ignore
  const strategyId = strategyData.strategy_id;

  try {
    // @ts-ignore
    await updateStrategy(strategyId, strategyData);
    alert('Strategy updated successfully!');
    handleCancelEditStrategyForm();
    // @ts-ignore
    await loadStrategiesForSource(strategyData.source_id);
  } catch (error) {
    console.error('Failed to update strategy:', error);
    alert('Error: Could not update strategy.');
  }
}

// --- END: "Edit Strategy" Modal Functions ---
