// public/js/modules/settings/sources.api.js

export async function getSources() {
  try {
    const response = await fetch('/api/sources');
    if (!response.ok) {
      throw new Error('Failed to fetch sources');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw error;
  }
}

export async function addSource(source) {
  try {
    const response = await fetch('/api/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(source),
    });
    if (!response.ok) {
      throw new Error('Failed to add source');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding source:', error);
    throw error;
  }
}

export async function deleteSource(id) {
  console.log('API: deleteSource called (placeholder)', id);
  // Placeholder for deleting a source from the backend
  return { success: true };
}

export async function updateSource(id, source) {
  console.log('API: updateSource called (placeholder)', id, source);
  // Placeholder for updating a source in the backend
  return { ...source, id: id };
}
