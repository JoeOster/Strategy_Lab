// public/js/modules/strategy-lab/paper-trades/api.js

/** @typedef {import('../../../types.js').Transaction} Transaction */

import { api } from '../../../utils/apiFetch.js';

/**
 * Fetches the list of all paper trades.
 * @returns {Promise<Transaction[]>} A promise that resolves to an array of paper trades.
 */
export async function getPaperTrades() {
  // --- FIX: Call the real API endpoint ---
  return api.get('/api/transactions/paper-trades');
  // --- END FIX ---
}

/**
 * Deletes a paper trade transaction.
 * @param {string | number} id - The ID of the transaction to delete.
 * @returns {Promise<any>}
 */
export async function deletePaperTrade(id) {
  return api.delete(`/api/transactions/${id}`);
}
