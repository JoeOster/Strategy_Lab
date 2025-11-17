// public/js/modules/strategy-lab/paper-trades/handlers.js

import { deletePaperTrade, getPaperTrades } from './api.js';

/**
 * Fetches and renders the content for the "Paper Trades" sub-tab.
 */
export async function loadPaperTradesContent() {
  console.log('Loading Paper Trades content...');
  try {
    const paperTrades = await getPaperTrades();
    // renderPaperTrades(paperTrades, 'paper-trades-table');
    console.log(
      'Paper Trades display is currently disabled as per user request.'
    );
  } catch (err) {
    console.error('Failed to load paper trades:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderPaperTrades(null, 'paper-trades-table', error);
  }
}

/**
 * Handles the click to delete a "Paper Trade".
 * @param {string} id - The ID of the transaction.
 * @returns {Promise<boolean>} True if the list should be refreshed.
 */
export async function handleDeletePaperTradeClick(id) {
  if (confirm('Are you sure you want to delete this paper trade?')) {
    try {
      await deletePaperTrade(id);
      return true; // Request refresh
    } catch (error) {
      console.error('Failed to delete paper trade:', error);
      alert('Failed to delete paper trade. See console for details.');
      return false;
    }
  }
  return false;
}
