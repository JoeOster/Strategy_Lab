// public/js/services/apiFetch.js
// (Content is identical to the old utils/apiFetch.js)

/**
 * Custom Error class for API fetch errors.
 * @extends {Error}
 */
class ApiFetchError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code.
   * @param {string} statusText - The HTTP status text.
   * @param {object | string} [data] - The parsed JSON error response or text.
   */
  constructor(message, status, statusText, data) {
    super(message);
    this.name = 'ApiFetchError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * A wrapper for the fetch API to handle common scenarios.
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options] - Fetch options (method, headers, body, etc.).
 * @returns {Promise<any>} - A promise that resolves to the JSON response.
 * @throws {ApiFetchError} - Throws on network error or non-OK HTTP status.
 */
async function apiFetch(url, options = {}) {
  // Set default headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Stringify body if it's an object and Content-Type is JSON
  if (
    config.body &&
    typeof config.body === 'object' &&
    config.headers['Content-Type'] === 'application/json'
  ) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    console.error('API Fetch Error (Network):', networkError);
    throw new ApiFetchError(
      'Network error, please check connection.',
      0,
      'Network Error',
      networkError
    );
  }

  if (!response.ok) {
    let errorData;
    const errorText = await response.text();
    try {
      // Try to parse error response as JSON
      errorData = JSON.parse(errorText);
    } catch (e) {
      // If not JSON, use the raw text
      errorData = errorText;
    }
    console.error(
      `API Fetch Error: ${response.status} ${response.statusText}`,
      errorData
    );
    throw new ApiFetchError(
      `Failed to ${options.method || 'GET'} ${url}`,
      response.status,
      response.statusText,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (jsonError) {
    console.error('API Fetch Error (JSON Parse):', jsonError);
    throw new ApiFetchError(
      'Failed to parse JSON response.',
      response.status,
      response.statusText,
      jsonError
    );
  }
}

// Helper methods
export const api = {
  get: (url) => apiFetch(url),
  post: (url, body) => apiFetch(url, { method: 'POST', body }),
  put: (url, body) => apiFetch(url, { method: 'PUT', body }),
  delete: (url) => apiFetch(url, { method: 'DELETE' }),
};