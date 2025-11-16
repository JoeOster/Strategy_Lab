// public/js/modules/transactions/edit-trade.handlers.js

import { getIdeaForPrefill, moveIdeaToPaper, moveIdeaToRealTrade } from '../strategy-lab/watched-list/api.js';
import { getTransaction, updateTransaction } from './api.js';

/**
 * Opens the "Edit Trade" modal for editing an existing trade or creating a new one from an idea.
 * @param {object} options - The options for opening the modal.
 * @param {string} [options.tradeId] - The ID of the trade to edit.
 * @param {string} [options.ideaId] - The ID of the idea to create a trade from.
 * @param {boolean} [options.isPaper] - Whether the new trade is a paper trade.
 */
export async function openEditTradeModal({ tradeId, ideaId, isPaper }) {
  const modal = document.getElementById('edit-trade-modal');
  if (!modal) return;

  const form = document.getElementById('edit-trade-form');
  const modalTitle = document.getElementById('edit-trade-modal-title');
  const tickerInput = form.elements.ticker;
  const submitButton = form.querySelector('button[type="submit"]');

  // Reset form and ticker state
  form.reset();
  tickerInput.readOnly = false;

  try {
    if (tradeId) {
      // --- EDIT MODE ---
      modalTitle.textContent = 'Edit Trade';
      submitButton.textContent = 'Save Changes';

      const trade = await getTransaction(tradeId);
      form.elements.id.value = trade.id;
      tickerInput.value = trade.ticker;
      tickerInput.readOnly = true; // Lock ticker when editing
      form.elements.quantity.value = trade.quantity;
      form.elements.price.value = trade.price;
      // TODO: Populate other fields if they exist on the trade object
    } else if (ideaId) {
      // --- NEW TRADE MODE ---
      modalTitle.textContent = isPaper ? 'New Paper Trade' : 'New Real Trade';
      submitButton.textContent = 'Execute Trade';

      const idea = await getIdeaForPrefill(ideaId);
      form.elements.id.value = ''; // No trade ID yet
      form.elements['idea_id'].value = idea.id; // Store idea ID
      form.elements['source_id'].value = idea.source_id; // Store source ID
      form.elements['is_paper'].value = isPaper;
      tickerInput.value = idea.ticker;
      tickerInput.readOnly = true; // Lock ticker when creating from idea
    }

    modal.style.display = 'block';
  } catch (error) {
    console.error('Failed to open trade modal:', error);
    alert('Error: Could not open trade modal. Please check the console.');
  }

  // Attach listeners
  const closeButton = modal.querySelector('.close-button');
  closeButton?.addEventListener('click', closeEditTradeModal);

  const cancelBtn = document.getElementById('cancel-edit-trade-btn');
  cancelBtn?.addEventListener('click', closeEditTradeModal);

  form.addEventListener('submit', handleEditTradeSubmit);
}

/**
 * Closes the "Edit Trade" modal.
 */
export function closeEditTradeModal() {
  const modal = document.getElementById('edit-trade-modal');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('edit-trade-form');
    const tickerInput = form.elements.ticker;

    form.removeEventListener('submit', handleEditTradeSubmit);
    tickerInput.readOnly = false; // Always reset readonly state
    form.reset();
  }
}

/**
 * Handles the submission of the "Edit Trade" form.
 * @param {Event} event - The form submission event.
 */
async function handleEditTradeSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Set the time of submission
  data.time = new Date().toISOString();

  try {
    let sourceId;
    if (data.id) {
      // --- UPDATE EXISTING TRADE ---
      const updatedTrade = await updateTransaction(data.id, data);
      sourceId = updatedTrade.source_id;
      alert('Trade updated successfully!');
    } else if (data.idea_id) {
      // --- CREATE NEW TRADE FROM IDEA ---
      sourceId = data.source_id;
      if (data.is_paper === 'true') {
        await moveIdeaToPaper(data.idea_id, data);
        alert('Paper trade created successfully!');
      } else {
        await moveIdeaToRealTrade(data.idea_id, data);
        alert('Real trade created successfully!');
      }
    }
    closeEditTradeModal();

    // Dispatch an event to notify that a trade was created/updated
    if (sourceId) {
      document.dispatchEvent(
        new CustomEvent('tradeCreated', { detail: { sourceId } })
      );
    }
  } catch (error) {
    console.error('Failed to save trade:', error);
    alert('Error: Could not save trade. Please check the console.');
  }
}
