// public/js/modules/strategy-lab/paper-trades/api.js

/** @typedef {import('../../../types.js').Transaction} Transaction */

import { api } from "../../../services/apiFetch.js";

/**
 * Fetches the list of all paper trades.
 * @returns {Promise<PaperTradeSummary[]>} A promise that resolves to an array of paper trades.
 */
export async function getPaperTrades() {
	// --- FIX: Call the real API endpoint ---
	return api.get("/api/transactions/paper-trades");
	// --- END FIX ---
}

/**
 * Fetches a single trade by its ID.
 * @param {string} tradeId - The ID of the trade to fetch.
 * @returns {Promise<Transaction>} A promise that resolves to a single trade object.
 */
export async function getTradeById(tradeId) {
	return api.get(`/api/transactions/${tradeId}`);
}

/**
 * Deletes a paper trade transaction.
 * @param {string | number} id - The ID of the transaction to delete.
 * @returns {Promise<any>}
 */
export async function deletePaperTrade(id) {
	return api.delete(`/api/transactions/${id}`);
}

/**
 * Records a sell transaction for a given trade.
 * @param {string} tradeId - The ID of the original buy trade.
 * @param {number} quantity - The quantity to sell.
 * @param {number} price - The sell price.
 * @returns {Promise<any>}
 */
export async function sellTrade(tradeId, quantity, price) {
	return api.post("/api/transactions/sell", { tradeId, quantity, price });
}
