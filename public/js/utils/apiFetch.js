/**
 * @typedef {object} FetchOptions
 * @property {object} [headers] - Custom headers for the request.
 * @property {string} [method] - The HTTP method (e.g., 'GET', 'POST').
 * @property {string} [body] - The request body.
 */

/**
 * @typedef {object} ApiResponse
 * @property {string} [message] - A message from the API.
 * @property {string} [error] - An error message from the API.
 */

/**
 * Generic API fetch function.
 * @param {string} url - The URL to fetch.
 * @param {FetchOptions} [options={}] - Fetch options.
 * @returns {Promise<any>} - The JSON response or null if 204.
 * @throws {Error} - Throws an error if the response is not ok.
 */
async function apiFetch(url, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData = { message: `HTTP error! status: ${response.status}` };

      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData.message = await response.text();
      }
      throw new Error(errorData.error || errorData.message);
    }

    // Handle cases where response might be 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

export const api = {
  /**
   * Performs a GET request.
   * @param {string} url - The URL to fetch.
   * @param {FetchOptions} [options] - Fetch options.
   * @returns {Promise<any>} - The JSON response.
   */
  get: (url, options) => apiFetch(url, { ...options, method: 'GET' }),
  /**
   * Performs a POST request.
   * @param {string} url - The URL to post to.
   * @param {object} data - The data to send in the request body.
   * @param {FetchOptions} [options] - Fetch options.
   * @returns {Promise<any>} - The JSON response.
   */
  post: (url, data, options) =>
    apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  /**
   * Performs a PUT request.
   * @param {string} url - The URL to put to.
   * @param {object} data - The data to send in the request body.
   * @param {FetchOptions} [options] - Fetch options.
   * @returns {Promise<any>} - The JSON response.
   */
  put: (url, data, options) =>
    apiFetch(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  /**
   * Performs a DELETE request.
   * @param {string} url - The URL to delete from.
   * @param {FetchOptions} [options] - Fetch options.
   * @returns {Promise<any>} - The JSON response.
   */
  delete: (url, options) => apiFetch(url, { ...options, method: 'DELETE' }),
};
