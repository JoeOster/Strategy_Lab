// public/js/modules/strategy-lab/watched-list/render.js

/**
 * Renders the watched list table (which displays "Trade Ideas").
 * @param {any[] | null} watchedList - An array of watched items (ideas).
 * @param {Error | null} [error] - An optional error object.
 */
export function renderWatchedList(watchedList, error = null) {
  const container = document.getElementById('watched-list-table');
  if (!container) {
    console.error('Watched list container not found.');
    return;
  }

  if (error) {
    container.innerHTML = '<p class="error">Failed to load watched list.</p>';
    return;
  }

  if (!watchedList || watchedList.length === 0) {
    container.innerHTML = '<p>No items in your watched list.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style

  // Columns now match the 'watched_items' table schema for "Ideas"
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Buy Price (High)</th>
        <th>Buy Price (Low)</th>
        <th>Take Profit (High)</th>
        <th>Take Profit (Low)</th>
        <th>Escape Price</th>
        <th>Status</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${watchedList
        .map(
          (item) => `
        <tr data-id="${item.id}">
          <td>${item.ticker || ''}</td>
          <td>${item.buy_price_high || ''}</td>
          <td>${item.buy_price_low || ''}</td>
          <td>${item.take_profit_high || ''}</td>
          <td>${item.take_profit_low || ''}</td>
          <td>${item.escape_price || ''}</td>
          <td>${item.status || 'WATCHING'}</td>
          <td>${item.notes || ''}</td>
          <td>
            <button class="btn table-action-btn idea-buy-btn" data-id="${
              item.id
            }">Buy</button>
            <button class="btn table-action-btn btn-secondary idea-paper-btn" data-id="${
              item.id
            }">Paper</button>
            <button class="btn table-action-btn btn-secondary idea-edit-btn" data-id="${
              item.id
            }">Edit</button>
            <button class="btn table-action-btn btn-danger idea-delete-btn" data-id="${
              item.id
            }">Delete</button>
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