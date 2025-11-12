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
