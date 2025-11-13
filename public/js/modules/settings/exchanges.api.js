// public/js/modules/settings/exchanges.api.js

/**
 * Fetches the list of exchanges from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of exchange objects.
 */
export async function getExchanges() {
  const response = await fetch('/api/exchanges');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Adds a new exchange to the backend.
 * @param {Object} exchange - The exchange object to add.
 * @returns {Promise<Object>} A promise that resolves to the added exchange object.
 */
export async function addExchange(exchange) {
  const response = await fetch('/api/exchanges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(exchange),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Deletes an exchange from the backend.
 * @param {number} id - The ID of the exchange to delete.
 * @returns {Promise<void>} A promise that resolves when the exchange is deleted.
 */
export async function deleteExchange(id) {
  const response = await fetch(`/api/exchanges/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
