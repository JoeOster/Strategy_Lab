// public/js/modules/strategy-lab/watched-list/api.js

/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import { api } from '../../../utils/apiFetch.js';

/**
 * Fetches the list of watched items (Trade Ideas) from the real API.
 * @returns {Promise<WatchedItem[]>} A promise that resolves to an array of watched items with live prices.
 */
export async function getWatchedList() {
  // This now calls the real server endpoint
  return api.get('/api/watched-items/ideas');
}

/**
 * Deletes a watched idea.
 * @param {number | string} id - The ID of the idea to delete.
 * @returns {Promise<any>}
 */
export async function deleteIdea(id) {
  return api.delete(`/api/watched-items/${id}`);
}

/**
 * Moves a watched idea to a paper trade.
 * @param {number | string} id - The ID of the idea to move.
 * @returns {Promise<any>}
 */
export async function moveIdeaToPaper(id, ideaData) {
  // This calls the new endpoint that creates a transaction and updates the idea
  return api.post(`/api/watched-items/${id}/to-paper`, ideaData);
}

/**
 * Gets a watched idea's data for pre-filling the Orders tab.
 * @param {number | string} id - The ID of the idea to fetch.
 * @returns {Promise<WatchedItem | undefined>}
 */
export async function getIdeaForPrefill(id) {
  return api.get(`/api/watched-items/${id}`);
}
// public/js/modules/strategy-lab/watched-list/api.js

// ... (existing functions getWatchedList, deleteIdea, etc.) ...

/**
 * Adds a new "Trade Idea" to the database.
 * @param {object} ideaData - The data from the idea form.
 * @returns {Promise<WatchedItem>} A promise that resolves to the new idea object.
 */
export async function addIdea(ideaData) {
  return api.post('/api/watched-items/ideas', ideaData);
}

/**
 * Updates a watched idea.
 * @param {string} ideaId - The ID of the idea to update.
 * @param {object} ideaData - The data to update.
 * @returns {Promise<WatchedItem>} A promise that resolves to the updated idea object.
 */
export async function updateIdea(ideaId, ideaData) {
  return api.put(`/api/watched-items/${ideaId}`, ideaData);
}

/**
 * Moves a watched idea to a real trade.
 * @param {string} id - The ID of the idea to move.
 * @param {object} ideaData - The data to update.
 * @returns {Promise<any>}
 */
export async function moveIdeaToRealTrade(id, ideaData) {
  return api.post(`/api/watched-items/${id}/to-real`, ideaData);
}
