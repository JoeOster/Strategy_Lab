// public/js/utils/apiFetch.js

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
  get: (url, options) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, data, options) =>
    apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (url, data, options) =>
    apiFetch(url, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (url, options) => apiFetch(url, { ...options, method: 'DELETE' }),
};
