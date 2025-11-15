// public/js/modules/strategy-lab/paper-trades/render.js

/**
 * Renders the paper trades table.
 * @param {import('../../../types.js').Transaction[] | null} paperTrades - An array of paper trade items.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderPaperTrades(paperTrades, error = null) {
  const container = document.getElementById('paper-trades-table');
  if (!container) {
    console.error('Paper trades container not found.');
    return;
  }

  if (error) {
    container.innerHTML = '<p class="error">Failed to load paper trades.</p>';
    return;
  }

  if (!paperTrades || paperTrades.length === 0) {
    container.innerHTML = '<p>No paper trades recorded.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style

  // --- START: FIX ---
  // Updated columns to match the Transaction type
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Symbol</th>
        <th>Type</th>
        <th>Quantity</th>
        <th>Entry Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${paperTrades
        .map(
          (trade) => `
        <tr>
          <td>${trade.transaction_date.split('T')[0] || ''}</td>
          <td>${trade.ticker}</td>
          <td>${trade.transaction_type}</td>
          <td>${trade.quantity}</td>
          <td>${trade.price}</td>
          <td>
            <button class="small-btn btn btn-secondary paper-details-btn" data-id="${
              trade.id
            }">Details</button>
            <button class="small-btn btn btn-danger paper-delete-btn" data-id="${
              trade.id
            }">Delete</button>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  // --- END: FIX ---

  container.innerHTML = ''; // Clear previous content
  container.appendChild(table);
}