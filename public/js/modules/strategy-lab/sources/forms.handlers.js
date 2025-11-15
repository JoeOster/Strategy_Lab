// public/js/modules/strategy-lab/sources/forms.handlers.js

/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import { addIdea } from '../watched-list/api.js';
import { loadWatchedListContent } from '../watched-list/handlers.js';
import { addStrategy } from './api.js';
// --- START: FIX ---
// Import the modal's refresh functions instead of redefining them
import {
  loadOpenIdeasForSource,
  loadStrategiesForSource,
} from './modal.handlers.js';
// --- END: FIX ---

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

// --- START: "Log New Idea" Modal Functions ---

/**
 * Shows the "Log New Idea" form modal.
 * @param {Event} event - The click event.
 */
export function handleShowIdeaForm(event, sourceId, strategyId) {
  if (!(event.target instanceof HTMLElement)) return;

  const addIdeaModal = document.getElementById('add-idea-modal');
  const ideaSourceIdInput = document.getElementById('idea-source-id');
  const ideaStrategyIdInput = document.getElementById('idea-strategy-id');

  if (addIdeaModal && ideaSourceIdInput && ideaStrategyIdInput) {
    if (sourceId) {
      // @ts-ignore
      ideaSourceIdInput.value = sourceId;
    }
    const buttonSourceId = event.target.dataset.sourceId;
    if (buttonSourceId) {
      // @ts-ignore
      ideaSourceIdInput.value = buttonSourceId;
    }
    if (strategyId) {
      // @ts-ignore
      ideaStrategyIdInput.value = strategyId;
    }
    // @ts-ignore
    addIdeaModal.style.display = 'block';

    // Attach listeners
    document
      .getElementById('cancel-idea-form-btn')
      ?.addEventListener('click', handleCancelIdeaForm);
    addIdeaModal
      .querySelector('.close-button')
      ?.addEventListener('click', handleCancelIdeaForm);
    document
      .getElementById('log-idea-form')
      ?.addEventListener('submit', handleLogIdeaSubmit);
    /** @param {MouseEvent} event */
    window.onclick = (event) => {
      if (event.target === addIdeaModal) {
        handleCancelIdeaForm();
      }
    };
  }
}

/**
 * Hides the "Log New Idea" form modal.
 */
export function handleCancelIdeaForm() {
  const addIdeaModal = document.getElementById('add-idea-modal');
  if (addIdeaModal) {
    // @ts-ignore
    addIdeaModal.style.display = 'none';
    const form = /** @type {HTMLFormElement | null} */ (
      document.getElementById('log-idea-form')
    );
    if (form) form.reset();

    // Clean up listeners
    document
      .getElementById('cancel-idea-form-btn')
      ?.removeEventListener('click', handleCancelIdeaForm);
    addIdeaModal
      .querySelector('.close-button')
      ?.removeEventListener('click', handleCancelIdeaForm);
    document
      .getElementById('log-idea-form')
      ?.removeEventListener('submit', handleLogIdeaSubmit);
    window.onclick = null; // Be careful if other modals use this
  }
}

/**
 * Handles the submission of the "Log New Idea" form.
 * @param {Event} event - The form submission event.
 */
async function handleLogIdeaSubmit(event) {
  event.preventDefault();
  console.log('Idea form submitted.');

  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  const form = event.target;
  const formData = new FormData(form);
  const ideaData = Object.fromEntries(formData.entries());

  if (!ideaData.ticker) {
    alert('Ticker is a required field.');
    return;
  }

  try {
    // @ts-ignore
    await addIdea(ideaData);
    alert('Idea saved successfully!');
    handleCancelIdeaForm(); // Hide and clear the form

    // Refresh the "Watched List" tab to show the new idea
    loadWatchedListContent();

    // Also refresh the "Open Ideas" table in the modal if it's open
    // @ts-ignore
    if (ideaData.source_id) {
      // @ts-ignore
      loadOpenIdeasForSource(ideaData.source_id);
    }
  } catch (error) {
    console.error('Failed to save idea:', error);
    alert('Error: Could not save idea. Please check the console.');
  }
}
// --- END: "Log New Idea" Modal Functions ---

// --- START: FIX ---
// REMOVED the duplicate functions loadStrategiesForSource and loadOpenIdeasForSource
// --- END: FIX ---
