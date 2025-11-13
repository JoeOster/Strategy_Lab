// public/js/modules/settings/exchanges.api.js

import { api } from '../../utils/apiFetch.js';

/**
 * Fetches the list of exchanges from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of exchange objects.
 */
export async function getExchanges() {
  return api.get('/api/exchanges');
}

/**
 * Adds a new exchange to the backend.
 * @param {Object} exchange - The exchange object to add.
 * @returns {Promise<Object>} A promise that resolves to the added exchange object.
 */
export async function addExchange(exchange) {
  return api.post('/api/exchanges', exchange);
}

/**
 * Deletes an exchange from the backend.
 * @param {number} id - The ID of the exchange to delete.
 * @returns {Promise<void>} A promise that resolves when the exchange is deleted.
 */
export async function deleteExchange(id) {
  return api.delete(`/api/exchanges/${id}`);
}
