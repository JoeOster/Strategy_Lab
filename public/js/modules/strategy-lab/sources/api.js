// public/js/modules/strategy-lab/sources/api.js
import { api } from '../../../utils/apiFetch.js';
/** @unused @typedef {import('../../../types.js').Strategy} Strategy */

// Re-export functions from the settings module.
// The types are already defined in the original file.
export {
  getSources,
  getSource,
} from '../../settings/sources.api.js';

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
