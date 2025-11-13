// public/js/modules/settings/users.api.js

export async function addAccountHolder(name) {
  try {
    const response = await fetch('/api/holders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: name }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding account holder:', error);
    throw error;
  }
}

export async function getAccountHolders() {
  try {
    const response = await fetch('/api/holders');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching account holders:', error);
    throw error;
  }
}