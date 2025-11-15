// public/js/modules/strategy-lab/sources/forms.handlers.js

/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import {
  addIdea,
  updateIdea,
  moveIdeaToPaper,
  moveIdeaToRealTrade,
} from '../watched-list/api.js';
import { loadWatchedListContent } from '../watched-list/handlers.js';
import { addStrategy } from './api.js';
// --- START: FIX ---
// Import the modal's refresh functions instead of redefining them
import {
  closeSourceDetailModal,
  loadOpenIdeasForSource,
  loadPaperTradesForSource,
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
export function handleShowIdeaForm(
  event,
  sourceId,
  strategyId,
  isPaperTrade = false,
  isRealTrade = false
) {
  const addIdeaModal = document.getElementById('add-idea-modal');
  const ideaSourceIdInput = document.getElementById('idea-source-id');
  const ideaStrategyIdInput = document.getElementById('idea-strategy-id');
  const modalTitle = addIdeaModal.querySelector('.modal-title');
  const quantityContainer = document.getElementById('quantity-container');
  const saveButton = addIdeaModal.querySelector('button[type="submit"]');

  if (
    addIdeaModal &&
    ideaSourceIdInput &&
    ideaStrategyIdInput &&
    modalTitle &&
    quantityContainer &&
    saveButton
  ) {
    if (isPaperTrade) {
      modalTitle.textContent = 'Add Paper Trade';
      saveButton.textContent = 'Save Paper Trade';
      quantityContainer.style.display = 'none';
    } else if (isRealTrade) {
      modalTitle.textContent = 'Add Real Trade';
      saveButton.textContent = 'Save Trade';
      quantityContainer.style.display = 'block';
    } else {
      modalTitle.textContent = 'Add New Trade Idea';
      saveButton.textContent = 'Save Idea';
      quantityContainer.style.display = 'none';
    }

    if (sourceId) {
      // @ts-ignore
      ideaSourceIdInput.value = sourceId;
    }
    if (event && event.target) {
      const buttonSourceId = event.target.dataset.sourceId;
      if (buttonSourceId) {
        // @ts-ignore
        ideaSourceIdInput.value = buttonSourceId;
      }
    }
    if (strategyId) {
      // @ts-ignore
      ideaStrategyIdInput.value = strategyId;
    }
    if (isPaperTrade) {
      const paperTradeInput = document.createElement('input');
      paperTradeInput.type = 'hidden';
      paperTradeInput.name = 'is_paper_trade';
      paperTradeInput.value = 'true';
      const form = document.getElementById('log-idea-form');
      form.appendChild(paperTradeInput);
    }
    if (isRealTrade) {
      const realTradeInput = document.createElement('input');
      realTradeInput.type = 'hidden';
      realTradeInput.name = 'is_real_trade';
      realTradeInput.value = 'true';
      const form = document.getElementById('log-idea-form');
      form.appendChild(realTradeInput);
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

    const saveButton = addIdeaModal.querySelector('button[type="submit"]');
    if (saveButton) {
      saveButton.textContent = 'Save Idea';
    }

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
    if (ideaData.is_paper_trade) {
      await moveIdeaToPaper(ideaData.id, ideaData);
      alert('Idea moved to Paper Trades.');
      if (ideaData.source_id) {
        loadPaperTradesForSource(ideaData.source_id);
      }
    } else if (ideaData.is_real_trade) {
      await moveIdeaToRealTrade(ideaData.id, ideaData);
      alert('Idea moved to Real Trades.');
      if (ideaData.source_id) {
        loadOpenIdeasForSource(ideaData.source_id);
        loadPaperTradesForSource(ideaData.source_id);
        loadStrategiesForSource(ideaData.source_id);
      }
    } else if (ideaData.id) {
      await updateIdea(ideaData.id, ideaData);
      alert('Idea updated successfully!');
    } else {
      await addIdea(ideaData);
      alert('Idea saved successfully!');
    }
    handleCancelIdeaForm(); // Hide and clear the form

    // Also refresh the "Open Ideas" table in the modal if it's open
    if (ideaData.source_id) {
      loadOpenIdeasForSource(ideaData.source_id);
    }
  } catch (error) {
    console.error('Failed to save idea:', error);
    alert(`Error: ${error.message}`);
  }
}
// --- END: "Log New Idea" Modal Functions ---

// --- START: FIX ---
// REMOVED the duplicate functions loadStrategiesForSource and loadOpenIdeasForSource
// --- END: FIX ---
