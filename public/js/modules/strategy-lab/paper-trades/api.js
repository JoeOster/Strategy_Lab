// public/js/modules/strategy-lab/paper-trades/api.js

import { api } from "../../../services/apiFetch.js";

/**
 * Fetches all paper trades from the API.
 * @returns {Promise<import('../../../types.js').TransactionWithPrice[]>}
 */
export async function getAllPaperTrades() {
	return api.get("/api/transactions/paper-trades/all");
}

/**
 * Deletes a paper trade by its ID.
 * @param {string} tradeId - The ID of the paper trade to delete.
 * @returns {Promise<any>}
 */
export async function deletePaperTrade(tradeId) {
	return api.delete(`/api/transactions/paper-trades/${tradeId}`);
}
