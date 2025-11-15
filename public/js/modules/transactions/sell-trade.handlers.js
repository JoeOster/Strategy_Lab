// public/js/modules/transactions/sell-trade.handlers.js

import { formatCurrency } from '../../utils/formatters.js';
import { getTransaction, sellTransaction } from './api.js';

/**
 * Opens the "Sell Trade" modal.
 * @param {string} tradeId - The ID of the trade to sell.
 */
export async function openSellTradeModal(tradeId) {
  const modal = document.getElementById('sell-trade-modal');
  if (modal) {
    try {
      const trade = await getTransaction(tradeId);
      const detailsContainer = document.getElementById('sell-trade-details');
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

      const confirmBtn = document.getElementById('confirm-sell-btn');
      if (confirmBtn) {
        confirmBtn.onclick = async () => {
          try {
            await sellTransaction(tradeId);
            alert('Trade sold successfully!');
            closeSellTradeModal();
            // TODO: Refresh the table
          } catch (error) {
            console.error('Failed to sell trade:', error);
            alert('Error: Could not sell trade. Please check the console.');
          }
        };
      }
    } catch (error) {
      console.error('Failed to get trade details:', error);
      alert('Error: Could not get trade details. Please check the console.');
    }

    const closeButton = modal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', closeSellTradeModal);
    }

    const cancelBtn = document.getElementById('cancel-sell-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeSellTradeModal);
    }
  }
}

/**
 * Closes the "Sell Trade" modal.
 */
export function closeSellTradeModal() {
  const modal = document.getElementById('sell-trade-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}
