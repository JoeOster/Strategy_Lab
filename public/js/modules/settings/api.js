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

export async function addExchange(exchange) {
  try {
    const response = await fetch('/api/exchanges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exchange),
    });
    if (!response.ok) {
      throw new Error('Failed to add exchange');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding exchange:', error);
    throw error;
  }
}

export async function getExchanges() {
  try {
    const response = await fetch('/api/exchanges');
    if (!response.ok) {
      throw new Error('Failed to fetch exchanges');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    throw error;
  }
}

export async function deleteExchange(id) {
  try {
    const response = await fetch(`/api/exchanges/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete exchange');
    }
  } catch (error) {
    console.error('Error deleting exchange:', error);
    throw error;
  }
}

export async function addHolder(holder) {
  try {
    const response = await fetch('/api/holders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: holder.username }),
    });
    if (!response.ok) {
      throw new Error('Failed to add holder');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding holder:', error);
    throw error;
  }
}

export async function deleteHolder(id) {
  try {
    const response = await fetch(`/api/holders/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete holder');
    }
  } catch (error) {
    console.error('Error deleting holder:', error);
    throw error;
  }
}

export async function getAccountHolders() {
  try {
    const response = await fetch('/api/holders');
    if (!response.ok) {
      throw new Error('Failed to fetch account holders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching account holders:', error);
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
