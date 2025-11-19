// public/js/modules/transactions/edit-trade.handlers.js

import {
  getIdeaForPrefill,
  moveIdeaToPaper,
  moveIdeaToRealTrade,
} from '../strategy-lab/watched-list/api.js';
import {
  getExchanges,
  getSoldQuantity,
  getTransaction,
  sellTransaction,
  updateTransaction,
} from './api.js';

/**
 * Opens the "Edit Trade" modal for editing an existing trade or creating a new one from an idea.
 * @param {object} options - The options for opening the modal.
 * @param {string} [options.tradeId] - The ID of the trade to edit or sell.
 * @param {string} [options.ideaId] - The ID of the idea to create a trade from.
 * @param {boolean} [options.isPaper] - Whether the new trade is a paper trade.
 * @param {boolean} [options.isSell] - Whether this is a sell action.
 */
export async function openEditTradeModal({ tradeId, ideaId, isPaper, isSell }) {
  const modal = document.getElementById('edit-trade-modal');
  if (!modal) return;

  const form = document.getElementById('edit-trade-form');
  const modalTitle = document.getElementById('edit-trade-modal-title');
  const tickerInput = form.elements.ticker;
  const submitButton = form.querySelector('button[type="submit"]');
  const exchangeSelect = form.elements.exchange;
  const limitLowInput = form.elements.limit_low;
  const limitHighInput = form.elements.limit_high;
  const quantityInput = form.elements.quantity;

  // Get references to labels
  const exchangeLabel = document.querySelector(
    'label[for="edit-trade-exchange"]'
  );
  const limitLowLabel = document.querySelector(
    'label[for="edit-trade-limit-low"]'
  );
  const limitHighLabel = document.querySelector(
    'label[for="edit-trade-limit-high"]'
  );

  // Reset form and ticker state
  form.reset();
  tickerInput.readOnly = false;
  // Clear any previous is_sell input
  const existingSellInput = form.querySelector('input[name="is_sell"]');
  if (existingSellInput) {
    existingSellInput.remove();
  }

  // Default to showing all fields
  [
    exchangeSelect,
    limitLowInput,
    limitHighInput,
    exchangeLabel,
    limitLowLabel,
    limitHighLabel,
  ].forEach((el) => {
    if (el) el.style.display = '';
  });
  quantityInput.removeAttribute('max'); // Clear any previous max attribute

  try {
    // Populate exchanges dropdown
    const exchanges = await getExchanges();
    exchangeSelect.innerHTML =
      '<option value="" disabled selected>Select an Exchange</option>';
    exchanges.forEach((exchange) => {
      const option = document.createElement('option');
      option.value = exchange.id;
      option.textContent = exchange.name;
      exchangeSelect.appendChild(option);
    });

    if (tradeId) {
      const trade = await getTransaction(tradeId);
      if (isSell) {
        // --- SELL MODE ---
        modalTitle.textContent = 'Sell Trade';
        submitButton.textContent = 'Sell Trade';
        form.elements.id.value = trade.id;
        tickerInput.value = trade.ticker;
        tickerInput.readOnly = true;
        form.elements.price.value = trade.current_price || ''; // Pre-fill with current price if available
        exchangeSelect.value = trade.exchange_id; // Pre-select exchange

        // Fetch sold quantity and calculate available quantity
        const { sold_quantity: currentSoldQuantity } =
          await getSoldQuantity(tradeId);
        const availableQuantity = trade.quantity - currentSoldQuantity;
        quantityInput.value = availableQuantity; // Pre-fill with available quantity
        quantityInput.setAttribute('max', availableQuantity); // Set max attribute

        // Hide unnecessary fields for sell mode
        [
          exchangeSelect,
          limitLowInput,
          limitHighInput,
          exchangeLabel,
          limitLowLabel,
          limitHighLabel,
        ].forEach((el) => {
          if (el) el.style.display = 'none';
        });
        exchangeSelect.removeAttribute('required');

        // Add a hidden input to signify this is a sell action
        const sellInput = document.createElement('input');
        sellInput.type = 'hidden';
        sellInput.name = 'is_sell';
        sellInput.value = 'true';
        form.appendChild(sellInput);
      } else {
        // --- EDIT MODE ---
        modalTitle.textContent = 'Edit Trade';
        submitButton.textContent = 'Save Changes';
        form.elements.id.value = trade.id;
        tickerInput.value = trade.ticker;
        tickerInput.readOnly = true; // Lock ticker when editing
        quantityInput.value = trade.quantity;
        form.elements.price.value = trade.price;
        exchangeSelect.value = trade.exchange_id; // Pre-select exchange
        exchangeSelect.setAttribute('required', 'required');
      }
    } else if (ideaId) {
      // --- NEW TRADE MODE ---
      modalTitle.textContent = isPaper ? 'New Paper Trade' : 'New Real Trade';
      submitButton.textContent = 'Execute Trade';

      const idea = await getIdeaForPrefill(ideaId);
      form.elements.id.value = ''; // No trade ID yet
      form.elements.idea_id.value = idea.id; // Store idea ID
      form.elements.source_id.value = idea.source_id; // Store source ID
      form.elements.is_paper.value = isPaper;
      tickerInput.value = idea.ticker;
      tickerInput.readOnly = true; // Lock ticker when creating from idea
      exchangeSelect.setAttribute('required', 'required');
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
    const exchangeSelect = form.elements.exchange;
    const limitLowInput = form.elements.limit_low;
    const limitHighInput = form.elements.limit_high;

    // Get references to labels
    const exchangeLabel = document.querySelector(
      'label[for="edit-trade-exchange"]'
    );
    const limitLowLabel = document.querySelector(
      'label[for="edit-trade-limit-low"]'
    );
    const limitHighLabel = document.querySelector(
      'label[for="edit-trade-limit-high"]'
    );

    form.removeEventListener('submit', handleEditTradeSubmit);
    tickerInput.readOnly = false; // Always reset readonly state
    form.reset();

    // Ensure all fields are visible when closing the modal
    [
      exchangeSelect,
      limitLowInput,
      limitHighInput,
      exchangeLabel,
      limitLowLabel,
      limitHighLabel,
    ].forEach((el) => {
      if (el) el.style.display = '';
    });
    exchangeSelect.setAttribute('required', 'required');
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
    if (data.is_sell === 'true') {
      // --- SELL EXISTING TRADE ---
      const soldTrade = await sellTransaction(data);
      sourceId = soldTrade.source_id;
      alert('Trade sold successfully!');
    } else if (data.id) {
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
