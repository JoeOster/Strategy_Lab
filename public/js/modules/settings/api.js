// public/js/modules/ideas/api.js

import { api } from '../../services/apiFetch.js';

/**
 * Converts a watched item to a paper trade.
 * @param {string} ideaId The ID of the watched item.
 * @param {object} tradeData The data from the buy modal form.
 */
export async function convertToPaperTrade(ideaId, tradeData) {
  return api.post(`/api/watched-items/${ideaId}/to-paper`, tradeData);
}

/**
 * Converts a watched item to a real trade.
 * @param {string} ideaId The ID of the watched item.
 * @param {object} tradeData The data from the buy modal form.
 */
export async function convertToRealTrade(ideaId, tradeData) {
  return api.post(`/api/watched-items/${ideaId}/to-real`, tradeData);
}
