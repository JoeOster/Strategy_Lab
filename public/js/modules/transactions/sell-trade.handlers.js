// public/js/modules/transactions/sell-trade.handlers.js

import { formatCurrency } from '../../utils/formatters.js';
import { getTransaction, sellTransaction } from './api.js';

const sellTradeModal = document.getElementById('sell-trade-modal');
const sellTradeForm = document.getElementById('sell-trade-form');

/**
 * Opens the "Sell Trade" modal.
 * @param {string} tradeId - The ID of the trade to sell.
 */
export async function openSellTradeModal(tradeId) {
  const modal = document.getElementById('sell-trade-modal');
  if (modal) {
    try {
      const trade = await getTransaction(tradeId);
      // @ts-ignore
      document.getElementById('sell-trade-id').value = trade.id;

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

if (sellTradeForm) {
  sellTradeForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(sellTradeForm);
    const sellData = Object.fromEntries(formData.entries());
    const tradeId = sellData.trade_id;

    try {
      const result = await sellTransaction(tradeId, sellData);
      alert('Trade sold successfully!');
      closeSellTradeModal();

      // Dispatch an event to trigger UI refresh
      if (result.sourceId) {
        document.dispatchEvent(
          new CustomEvent('tradeCreated', {
            detail: { sourceId: result.sourceId },
          })
        );
      }
    } catch (error) {
      console.error('Failed to sell trade:', error);
      alert('Error: Could not sell trade. Please check the console.');
    }
  });
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
