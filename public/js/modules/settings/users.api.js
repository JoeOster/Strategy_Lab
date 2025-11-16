// public/js/modules/settings/users.api.js

import { api } from '../../services/apiFetch.js';

export async function addAccountHolder(name) {
  return api.post('/api/holders', { username: name });
}

export async function getAccountHolders() {
  return api.get('/api/holders');
}

// --- START: ADDED MISSING FUNCTIONS ---

/**
 * Deletes an account holder by their ID.
 * @param {string} holderId - The ID of the holder to delete.
 */
export async function deleteAccountHolder(holderId) {
  return api.delete(`/api/holders/${holderId}`);
}

/**
 * Sets an account holder as the default.
 * @param {string} holderId - The ID of the holder to set as default.
 */
export async function setDefaultAccountHolder(holderId) {
  // Assuming the API endpoint is a POST to /api/holders/set-default
  // and expects the ID in the body.
  return api.post('/api/holders/set-default', { id: holderId });
}
// --- END: ADDED MISSING FUNCTIONS ---
