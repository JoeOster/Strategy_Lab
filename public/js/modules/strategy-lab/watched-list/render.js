// public/js/modules/strategy-lab/watched-list/render.js

/**
 * Renders the watched list table.
 * @param {import('../../../types.js').WatchedItem[] | null} watchedList - An array of watched items.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderWatchedList(watchedList, error = null) {
  const container = document.getElementById('watched-list-table');
  if (!container) {
    console.error('Watched list container not found.');
    return;
  }

  // --- FIX: Added error handling ---
  if (error) {
    container.innerHTML = '<p class="error">Failed to load watched list.</p>';
    return;
  }
  // --- END FIX ---

  if (!watchedList || watchedList.length === 0) {
    container.innerHTML = '<p>No items in your watched list.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style

  table.innerHTML = `
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Entry Price</th>
        <th>Target Price</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${watchedList
        .map(
          (item) => `
        <tr>
          <td>${item.symbol}</td>
          <td>${item.entryPrice}</td>
          <td>${item.targetPrice}</td>
          <td>${item.notes}</td>
          <td>
            <button class="small-btn" data-id="${item.id}">Edit</button>
            <button class="small-btn" data-id="${item.id}">Delete</button>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;

  container.innerHTML = ''; // Clear previous content
  container.appendChild(table);
}
