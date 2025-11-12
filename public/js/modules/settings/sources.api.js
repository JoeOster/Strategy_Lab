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
  try {
    const response = await fetch(`/api/sources/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete source');
    }
  } catch (error) {
    console.error('Error deleting source:', error);
    throw error;
  }
}

export async function updateSource(source) {
  try {
    const response = await fetch(`/api/sources/${source.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(source),
    });
    if (!response.ok) {
      throw new Error('Failed to update source');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating source:', error);
    throw error;
  }
}
