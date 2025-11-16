// public/js/modules/strategy-lab/sources/forms.handlers.js

/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import {
  addIdea,
  moveIdeaToPaper,
  moveIdeaToRealTrade,
  updateIdea,
} from '../watched-list/api.js';
// Import the content loaders for each sub-tab
import { addStrategy, getStrategy, updateStrategy } from './api.js';
import {
  loadOpenIdeasForSource,
  loadPaperTradesForSource,
  loadStrategiesForSource,
  loadTradeIdeasForSource,
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
    document.getElementById('edit-strategy-source-id').value = strategy.source_id;
    // @ts-ignore
    document.getElementById('edit-strategy-title').value = strategy.title;
    // @ts-ignore
    document.getElementById('edit-strategy-ticker').value = strategy.ticker;
    // @ts-ignore
    document.getElementById('edit-strategy-chapter').value = strategy.chapter;
    // @ts-ignore
    document.getElementById('edit-strategy-page-number').value = strategy.page_number;
    // @ts-ignore
    document.getElementById('edit-strategy-description').value = strategy.description;
    // @ts-ignore
    document.getElementById('edit-strategy-pdf-path').value = strategy.pdf_path;

    // @ts-ignore
    editStrategyModal.style.display = 'block';

    // Attach listeners
    document.getElementById('cancel-edit-strategy-form-btn')?.addEventListener('click', handleCancelEditStrategyForm);
    editStrategyModal.querySelector('.close-button')?.addEventListener('click', handleCancelEditStrategyForm);
    document.getElementById('edit-strategy-form')?.addEventListener('submit', handleEditStrategySubmit);
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
function handleCancelEditStrategyForm() {
  const editStrategyModal = document.getElementById('edit-strategy-modal');
  if (editStrategyModal) {
    // @ts-ignore
    editStrategyModal.style.display = 'none';
    const form = document.getElementById('edit-strategy-form');
    // @ts-ignore
    if (form) form.reset();

    // Clean up listeners
    document.getElementById('cancel-edit-strategy-form-btn')?.removeEventListener('click', handleCancelEditStrategyForm);
    editStrategyModal.querySelector('.close-button')?.removeEventListener('click', handleCancelEditStrategyForm);
    document.getElementById('edit-strategy-form')?.removeEventListener('submit', handleEditStrategySubmit);
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

// --- START: "Log New Idea" Modal Functions ---

/**
 * Shows the "Log New Idea" form modal.
 * @param {Event | null} event - The click event (can be null).
 * @param {string | null} sourceId - The source ID.
 * @param {string | null} strategyId - The strategy ID (optional).
 * @param {boolean} [isPaperTrade=false] - Is this to create a paper trade?
 * @param {boolean} [isRealTrade=false] - Is this to create a real trade?
 * @param {string | null} [ticker=null] - The ticker symbol (optional).
 */
export function handleShowIdeaForm(
  event,
  sourceId,
  strategyId,
  isPaperTrade = false,
  isRealTrade = false,
  ticker = null
) {
  const addIdeaModal = document.getElementById('add-idea-modal');
  const ideaSourceIdInput = document.getElementById('idea-source-id');
  const ideaStrategyIdInput = document.getElementById('idea-strategy-id');
  const modalTitle = addIdeaModal?.querySelector('.modal-title');
  const quantityContainer = document.getElementById('quantity-container');
  const saveButton = addIdeaModal?.querySelector('button[type="submit"]');
  const tickerInput = /** @type {HTMLInputElement | null} */ (
    document.getElementById('idea-ticker')
  );

  if (
    addIdeaModal &&
    ideaSourceIdInput &&
    ideaStrategyIdInput &&
    modalTitle &&
    quantityContainer &&
    saveButton &&
    tickerInput
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
    // --- START: LINT FIX ---
    if (event?.target) {
      // @ts-ignore
      const buttonSourceId = event.target.dataset.sourceId;
      if (buttonSourceId) {
        // @ts-ignore
        ideaSourceIdInput.value = buttonSourceId;
      }
    }
    // --- END: LINT FIX ---
    if (strategyId) {
      // @ts-ignore
      ideaStrategyIdInput.value = strategyId;
    }

    // Handle pre-filled ticker
    if (ticker) {
      tickerInput.value = ticker;
      tickerInput.readOnly = true;
    } else {
      tickerInput.value = '';
      tickerInput.readOnly = false;
    }

    const form = document.getElementById('log-idea-form');
    if (form) {
      // Clear any previous hidden inputs
      const oldPaperInput = form.querySelector('input[name="is_paper_trade"]');
      if (oldPaperInput) oldPaperInput.remove();
      const oldRealInput = form.querySelector('input[name="is_real_trade"]');
      if (oldRealInput) oldRealInput.remove();

      if (isPaperTrade) {
        const paperTradeInput = document.createElement('input');
        paperTradeInput.type = 'hidden';
        paperTradeInput.name = 'is_paper_trade';
        paperTradeInput.value = 'true';
        form.appendChild(paperTradeInput);
      }
      if (isRealTrade) {
        const realTradeInput = document.createElement('input');
        realTradeInput.type = 'hidden';
        realTradeInput.name = 'is_real_trade';
        realTradeInput.value = 'true';
        form.appendChild(realTradeInput);
      }
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

    // Reset ticker input to be editable
    const tickerInput = /** @type {HTMLInputElement | null} */ (
      document.getElementById('idea-ticker')
    );
    if (tickerInput) {
      tickerInput.readOnly = false;
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
    // @ts-ignore
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
    if (ideaData.is_paper_trade) {
      // If it's a new idea being created as a paper trade
      if (!ideaData.id) {
        await addIdea({ ...ideaData, is_paper_trade: true }); // Pass the flag to addIdea
        alert('New idea saved as Paper Trade!');
      } else {
        // Existing idea being moved to paper trade
        await moveIdeaToPaper(ideaData.id, ideaData);
        alert('Idea moved to Paper Trades.');
      }
      if (ideaData.source_id) {
        loadPaperTradesForSource(ideaData.source_id);
      }
    } else if (ideaData.is_real_trade) {
      // If it's a new idea being created as a real trade
      if (!ideaData.id) {
        await addIdea({ ...ideaData, is_real_trade: true }); // Pass the flag to addIdea
        alert('New idea saved as Real Trade!');
      } else {
        // Existing idea being moved to real trade
        await moveIdeaToRealTrade(ideaData.id, ideaData);
        alert('Idea moved to Real Trades.');
      }
      if (ideaData.source_id) {
        loadOpenIdeasForSource(ideaData.source_id);
        loadPaperTradesForSource(ideaData.source_id);
        loadStrategiesForSource(ideaData.source_id);
      }
    } else if (ideaData.id) {
      // Existing idea being updated
      await updateIdea(ideaData.id, ideaData);
      alert('Idea updated successfully!');
    } else {
      // Brand new idea (not a trade yet)
      await addIdea(ideaData);
      alert('Idea saved successfully!');
      document.dispatchEvent(new CustomEvent('ideaAdded')); // Dispatch event
    }
    handleCancelIdeaForm(); // Hide and clear the form

    // Also refresh the "Open Ideas" table in the modal if it's open
    if (ideaData.source_id) {
      // @ts-ignore
      loadOpenIdeasForSource(ideaData.source_id);
      // @ts-ignore
      loadTradeIdeasForSource(ideaData.source_id);
    }
  } catch (error) {
    console.error('Failed to save idea:', error);
    // @ts-ignore
    alert(`Error: ${error.message}`);
  }
}
// --- END: "Log New Idea" Modal Functions ---
