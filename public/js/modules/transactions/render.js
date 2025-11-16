// Suggested change for public/js/modules/transactions/render.js

/** @typedef {import('../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../types.js').Transaction} Transaction */
/** @typedef {import('../../types.js').TransactionWithPrice} TransactionWithPrice */
/** @typedef {import('../../types.js').Transaction} Transaction */

/**
 * Renders the table of "Paper Trades" for a source.
 * @param {PaperTradeSummary[] | null} trades - An array of PaperTradeSummary objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderPaperTradesForSource(trades, containerId, error = null) {
  const container = document.getElementById(containerId);
  renderTradesTable(container, 'Paper Trades', trades, error, true);
}

/**
 * Renders the table of "Open Trades" (real money) for a source.
 * @param {TransactionWithPrice[] | null} trades - An array of Transaction objects with current price.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderOpenTradesForSource(trades, containerId, error = null) {
  const container = document.getElementById(containerId);
  renderTradesTable(container, 'Open Trades', trades, error, false);
}

/**
 * Renders the table of "Closed Trades" for a source.
 * @param {PaperTradeSummary[] | null} trades - An array of PaperTradeSummary objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderClosedTradesForSource(trades, containerId, error = null) {
  const container = document.getElementById(containerId);
  renderTradesTable(container, 'Closed Trades', trades, error, true);
}
/**
 * A generic function to render a table of trades.
 * @param {HTMLElement | null} container - The container element to render into.
 * @param {string} title - The title for the table section.
 * @param {any[] | null} trades - An array of trade objects.
 * @param {Error | null} error - An optional error object.
 * @param {boolean} isPaper - True if rendering paper trades, false for real trades.
 */
function renderTradesTable(container, title, trades, error, isPaper) {
  if (!container) {
    console.error(`Container for "${title}" not found.`);
    return;
  }

  container.innerHTML = `<h3>${title}</h3>`;

  if (error) {
    container.innerHTML += `<p class="error">Failed to load ${title.toLowerCase()}.</p>`;
    return;
  }

  if (!trades || trades.length === 0) {
    container.innerHTML += `<p>No ${title.toLowerCase()} from this source.</p>`;
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Qty</th>
        <th>Entry Date</th>
        <th>Entry Price</th>
        <th>Current Price</th>
        <th>Unrealized P/L $</th>
        <th>Unrealized P/L %</th>
        <th class="${title === 'Open Trades' ? 'hidden' : ''}">Realized P/L $</th>
        <th class="${title === 'Open Trades' ? 'hidden' : ''}">Realized P/L %</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${trades.map((trade) => renderTradeRow(trade, isPaper, title)).join('')}
    </tbody>
  `;
  container.appendChild(table);
}

/**
 * Renders a single row for a trade table.
 * @param {any} trade - The trade object.
 * @param {boolean} isPaper - True if it's a paper trade row.
 * @param {string} title - The title of the table being rendered.
 * @returns {string} The HTML string for the table row.
 */
function renderTradeRow(trade, isPaper, title) {
  const entryPrice = isPaper ? trade.entry_price : trade.price;
  const entryDate = isPaper ? trade.entry_date : trade.transaction_date;

  const unrealizedPl = trade.current_price
    ? (trade.current_price - entryPrice) * trade.quantity
    : null;
  const unrealizedPlPct = trade.current_price
    ? ((trade.current_price - entryPrice) / entryPrice) * 100
    : null;

  const actions = isPaper
    ? `
    <button class="btn table-action-btn btn-secondary paper-details-btn" data-id="${trade.id}">Details</button>
    <button class="btn table-action-btn btn-danger paper-delete-btn" data-id="${trade.id}">Delete</button>
  `
    : `
    <button class="btn table-action-btn btn-warning real-sell-btn" data-id="${trade.id}">Sell</button>
    <button class="btn table-action-btn btn-secondary real-edit-btn" data-id="${trade.id}">Edit</button>
  `;

  return `
    <tr data-id="${trade.id}">
      <td>${trade.ticker}</td>
      <td>${trade.quantity}</td>
      <td>${entryDate ? entryDate.split('T')[0] : 'N/A'}</td>
      <td>${entryPrice}</td>
      <td>${trade.current_price || 'N/A'}</td>
      <td>${unrealizedPl !== null ? unrealizedPl.toFixed(2) : 'N/A'}</td>
      <td>${unrealizedPlPct !== null ? unrealizedPlPct.toFixed(2) + '%' : 'N/A'}</td>
      <td class="${title === 'Open Trades' ? 'hidden' : ''}">${
        isPaper && trade.pnl ? trade.pnl.toFixed(2) : 'N/A'
      }</td>
      <td class="${title === 'Open Trades' ? 'hidden' : ''}">${
        isPaper && trade.return_pct ? trade.return_pct.toFixed(2) + '%' : 'N/A'
      }</td>
      <td>${actions}</td>
    </tr>
  `;
}
