// public/js/modules/strategy-lab/sources/api.js
import { api } from '../../../services/apiFetch.js';
/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
/** @typedef {import('../../../types.js').Transaction} Transaction */
// --- START: NEW IMPORT ---
/** @typedef {import('../../../types.js').PaperTradeSummary} PaperTradeSummary */
// --- END: NEW IMPORT ---

// Re-export functions from the settings module.
// The types are already defined in the original file.
export { getSource, getSources } from '../../settings/sources.api.js';

/**
 * Adds a new strategy to the database.
 * @param {object} strategyData - The data from the strategy form.
 * @returns {Promise<Strategy>} A promise that resolves to the new strategy object.
 */
export async function addStrategy(strategyData) {
  return api.post('/api/strategies', strategyData);
}

/**
 * Fetches all strategies for a specific source ID.
 * @param {string|number} sourceId - The ID of the source.
 * @returns {Promise<Strategy[]>} A promise that resolves to an array of strategies.
 */
export async function getStrategiesForSource(sourceId) {
  return api.get(`/api/sources/${sourceId}/strategies`);
}

/**
 * Fetches a single strategy by its ID.
 * @param {string | number} strategyId - The ID of the strategy to fetch.
 * @returns {Promise<Strategy>}
 */
export async function getStrategy(strategyId) {
  return api.get(`/api/strategies/${strategyId}`);
}

// --- START: NEW SOURCE-SPECIFIC API FUNCTIONS ---

/**
 * Fetches all "Open Ideas" for a specific source ID.
 * @param {string|number} sourceId - The ID of the source.
 * @returns {Promise<WatchedItem[]>} A promise that resolves to an array of WatchedItems.
 */
export async function getOpenIdeasForSource(sourceId) {
  return api.get(`/api/sources/${sourceId}/open-ideas`);
}

/**
 * Fetches all "Open Trades" (real money) for a specific source ID.
 * @param {string|number} sourceId - The ID of the source.
 * @returns {Promise<Transaction[]>} A promise that resolves to an array of Transactions.
 */
export async function getOpenTradesForSource(sourceId) {
  return api.get(`/api/sources/${sourceId}/open-trades`);
}

/**
 * Fetches all "Paper Trades" for a specific source ID.
 * @param {string|number} sourceId - The ID of the source.
 * @returns {Promise<PaperTradeSummary[]>} A promise that resolves to an array of Transactions.
 */
export async function getPaperTradesForSource(sourceId) {
  return api.get(`/api/sources/${sourceId}/paper-trades`);
}

/**
 * Deletes a strategy by marking it as inactive.
 * @param {string | number} strategyId - The ID of the strategy to delete.
 * @returns {Promise<any>}
 */
export async function deleteStrategy(strategyId) {
  return api.delete(`/api/strategies/${strategyId}`);
}

/**
 * Updates an existing strategy.
 * @param {string | number} strategyId - The ID of the strategy to update.
 * @param {object} strategyData - The data to update.
 * @returns {Promise<Strategy>}
 */
export async function updateStrategy(strategyId, strategyData) {
  return api.put(`/api/strategies/${strategyId}`, strategyData);
}
// --- END: NEW SOURCE-SPECIFIC API FUNCTIONS ---
