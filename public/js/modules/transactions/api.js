// public/js/modules/transactions/api.js

import { api } from '../../utils/apiFetch.js';

/** @typedef {import('../../types.js').Transaction} Transaction */

/**
 * Fetches the details of a single transaction.
 * @param {string} transactionId - The ID of the transaction to fetch.
 * @returns {Promise<Transaction>} A promise that resolves to the transaction object.
 */
export async function getTransaction(transactionId) {
  return api.get(`/api/transactions/${transactionId}`);
}

/**
 * Updates a transaction.
 * @param {string} transactionId - The ID of the transaction to update.
 * @param {object} transactionData - The data to update.
 * @returns {Promise<Transaction>} A promise that resolves to the updated transaction object.
 */
export async function updateTransaction(transactionId, transactionData) {
  return api.put(`/api/transactions/${transactionId}`, transactionData);
}

/**
 * Sells a transaction.
 * @param {string} transactionId - The ID of the transaction to sell.
 * @returns {Promise<any>}
 */
export async function sellTransaction(transactionId) {
  return api.post(`/api/transactions/${transactionId}/sell`);
}
