// public/js/modules/transactions/paper-trade-details.handlers.js

import { formatCurrency } from '../../utils/formatters.js';
import { getTransaction } from './api.js';

/**
 * Opens the "Paper Trade Details" modal.
 * @param {string} tradeId - The ID of the paper trade to view.
 */
export async function openPaperTradeDetailsModal(tradeId) {
  const modal = document.getElementById('paper-trade-details-modal');
  if (modal) {
    try {
      const trade = await getTransaction(tradeId);
      const detailsContainer = document.getElementById('paper-trade-details');
      if (detailsContainer) {
        detailsContainer.innerHTML = `
          <p><strong>Ticker:</strong> ${trade.ticker}</p>
          <p><strong>Type:</strong> ${trade.transaction_type}</p>
          <p><strong>Quantity:</strong> ${trade.quantity}</p>
          <p><strong>Price:</strong> ${formatCurrency(trade.price)}</p>
          <p><strong>Date:</strong> ${trade.transaction_date.split('T')[0]}</p>
        `;
      }
      modal.style.display = 'block';
    } catch (error) {
      console.error('Failed to get paper trade details:', error);
      alert(
        'Error: Could not get paper trade details. Please check the console.'
      );
    }

    const closeButton = modal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', closePaperTradeDetailsModal);
    }

    const closeBtn = document.getElementById('close-paper-trade-details-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closePaperTradeDetailsModal);
    }
  }
}

/**
 * Closes the "Paper Trade Details" modal.
 */
export function closePaperTradeDetailsModal() {
  const modal = document.getElementById('paper-trade-details-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}
