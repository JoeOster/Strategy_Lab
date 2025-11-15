// public/js/modules/transactions/edit-trade.handlers.js

import { getTransaction, updateTransaction } from './api.js';

/**
 * Opens the "Edit Trade" modal.
 * @param {string} tradeId - The ID of the trade to edit.
 */
export async function openEditTradeModal(tradeId) {
  const modal = document.getElementById('edit-trade-modal');
  if (modal) {
    try {
      const trade = await getTransaction(tradeId);
      const form = document.getElementById('edit-trade-form');
      if (form) {
        form.elements.id.value = trade.id;
        form.elements.ticker.value = trade.ticker;
        form.elements.quantity.value = trade.quantity;
        form.elements.price.value = trade.price;
      }
      modal.style.display = 'block';
    } catch (error) {
      console.error('Failed to get trade details:', error);
      alert('Error: Could not get trade details. Please check the console.');
    }

    const closeButton = modal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', closeEditTradeModal);
    }

    const cancelBtn = document.getElementById('cancel-edit-trade-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeEditTradeModal);
    }

    const form = document.getElementById('edit-trade-form');
    if (form) {
      form.addEventListener('submit', handleEditTradeSubmit);
    }
  }
}

/**
 * Closes the "Edit Trade" modal.
 */
export function closeEditTradeModal() {
  const modal = document.getElementById('edit-trade-modal');
  if (modal) {
    modal.style.display = 'none';
    const form = document.getElementById('edit-trade-form');
    if (form) {
      form.removeEventListener('submit', handleEditTradeSubmit);
    }
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
  const tradeData = Object.fromEntries(formData.entries());

  try {
    await updateTransaction(tradeData.id, tradeData);
    alert('Trade updated successfully!');
    closeEditTradeModal();
    // TODO: Refresh the table
  } catch (error) {
    console.error('Failed to update trade:', error);
    alert('Error: Could not update trade. Please check the console.');
  }
}
