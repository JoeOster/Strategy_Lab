// public/js/modules/settings/sources.api.js

import { api } from '../../utils/apiFetch.js';
/** @unused @typedef {import('../../types.js').Source} Source */

/**
 * Fetches the list of advice sources from the backend.
 * @returns {Promise<Source[]>} A promise that resolves to an array of source objects.
 */
export async function getSources() {
  return api.get('/api/sources');
}

/**
 * Fetches a single source by its ID.
 * @param {number | string} id - The ID of the source to fetch.
 * @returns {Promise<Source>} A promise that resolves to the source object.
 */
export async function getSource(id) {
  return api.get(`/api/sources/${id}`);
}

/**
 * Adds a new advice source to the backend.
 * @param {Partial<Source>} source - The source object to add.
 * @returns {Promise<Source>} A promise that resolves to the added source object.
 */
export async function addSource(source) {
  return api.post('/api/sources', source);
}

/**
 * Deletes an advice source from the backend.
 * @param {number | string} id - The ID of the source to delete.
 * @returns {Promise<void>} A promise that resolves when the source is deleted.
 */
export async function deleteSource(id) {
  return api.delete(`/api/sources/${id}`);
}

/**
 * Updates an advice source in the backend.
 * @param {number | string} id - The ID of the source to update.
 * @param {Partial<Source>} source - The source object with updated data.
 * @returns {Promise<Source>} A promise that resolves to the updated source object.
 */
export async function updateSource(id, source) {
  return api.put(`/api/sources/${id}`, source);
}
