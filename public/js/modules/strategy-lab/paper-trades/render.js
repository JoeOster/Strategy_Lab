// public/js/modules/strategy-lab/paper-trades/render.js

/**
 * Renders the paper trades table.
 * @param {Array<object>} paperTrades - An array of paper trade items.
 */
export function renderPaperTrades(paperTrades) {
  const container = document.getElementById('paper-trades-table');
  if (!container) {
    console.error('Paper trades container not found.');
    return;
  }

  if (!paperTrades || paperTrades.length === 0) {
    container.innerHTML = '<p>No paper trades recorded.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style

  table.innerHTML = `
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Entry Price</th>
        <th>Exit Price</th>
        <th>Quantity</th>
        <th>Profit/Loss</th>
        <th>Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${paperTrades
        .map(
          (trade) => `
        <tr>
          <td>${trade.symbol}</td>
          <td>${trade.entryPrice}</td>
          <td>${trade.exitPrice}</td>
          <td>${trade.quantity}</td>
          <td style="color: ${trade.profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">${trade.profit}</td>
          <td>${trade.date}</td>
          <td>
            <button class="small-btn" data-id="${trade.id}">Details</button>
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
