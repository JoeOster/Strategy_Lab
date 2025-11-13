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

export async function getSettings() {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
}

export async function updateSettings(settings) {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}
