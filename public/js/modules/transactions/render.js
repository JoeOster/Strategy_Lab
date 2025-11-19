/** @typedef {import('../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../types.js').Transaction} Transaction */
/** @typedef {import('../../types.js').TransactionWithPrice} TransactionWithPrice */
/** @typedef {import('../../types.js').Transaction} Transaction */
import { formatCurrency } from '../../utils/formatters.js';

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
  renderTradesTable(container, 'Closed Trades', trades, error, false);
}
/**
 * A generic function to render a table of trades.
 * @param {HTMLElement | null} container - The container element to render into.
 * @param {string} title - The title for the table section.
 * @param {any[] | null} trades - An array of trade objects.
 * @param {Error | null} error - An optional error object.
 * @param {boolean} isPaper - True if rendering paper trades, false for real trades.
 */
export function renderTradesTable(container, title, trades, error, isPaper) {
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

  let tableHeaders = '';
  if (title === 'Open Trades') {
    tableHeaders = `
      <th class="text-center sortable" title="Stock Ticker" data-sort-key="ticker">Ticker</th>
      <th class="text-center sortable" title="Quantity Purchased" data-sort-key="quantity">Qty P.</th>
      <th class="text-center sortable" title="Quantity Remaining" data-sort-key="qtyRemaining">Qty R.</th>
      <th class="text-center sortable" title="Entry Price" data-sort-key="price">E. Price</th>
      <th class="text-center sortable" title="Unrealized Profit/Loss Dollar" data-sort-key="unrealizedPl">U. P/L $</th>
      <th class="text-center sortable" title="Unrealized Profit/Loss Percentage" data-sort-key="unrealizedPlPct">U. P/L %</th>
      <th class="text-center sortable" title="Current Price" data-sort-key="current_price">C. Price</th>
      <th class="text-center">Actions</th>
    `;
  } else if (title === 'Closed Trades') {
    tableHeaders = `
      <th class="text-center sortable" title="Stock Ticker" data-sort-key="ticker">Ticker</th>
      <th class="text-center sortable" title="Entry Date" data-sort-key="entry_date">Entry Date</th>
      <th class="text-center sortable" title="Entry Price" data-sort-key="entry_price">E. Price</th>
      <th class="text-center sortable" title="Exit Date" data-sort-key="exit_date">Exit Date</th>
      <th class="text-center sortable" title="Exit Price" data-sort-key="exit_price">Exit Price</th>
      <th class="text-center sortable" title="Profit/Loss" data-sort-key="pnl">P&L</th>
      <th class="text-center sortable" title="Return Percentage" data-sort-key="return_pct">Return %</th>
      <th class="text-center">Actions</th>
    `;
  } else { // Paper Trades
    tableHeaders = `
      <th class="text-center sortable" title="Stock Ticker" data-sort-key="ticker">Ticker</th>
      <th class="text-center sortable" title="Quantity" data-sort-key="quantity">Qty</th>
      <th class="text-center sortable" title="Entry Date" data-sort-key="entry_date">Entry Date</th>
      <th class="text-center sortable" title="Entry Price" data-sort-key="entry_price">E. Price</th>
      <th class="text-center sortable" title="Current Price" data-sort-key="current_price">C. Price</th>
      <th class="text-center sortable" title="Unrealized Profit/Loss Dollar" data-sort-key="unrealizedPl">U. P/L $</th>
      <th class="text-center sortable" title="Unrealized Profit/Loss Percentage" data-sort-key="unrealizedPlPct">U. P/L %</th>
      <th class="text-center">Actions</th>
    `;
  }

  table.innerHTML = `
    <thead>
      <tr>
        ${tableHeaders}
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
  const entryPrice =
    isPaper || title === 'Closed Trades' ? trade.entry_price : trade.price;
  const entryDate =
    isPaper || title === 'Closed Trades'
      ? trade.entry_date
      : trade.transaction_date;

  const unrealizedPl = trade.current_price
    ? (trade.current_price - entryPrice) * trade.quantity
    : null;
  const unrealizedPlPct = trade.current_price
    ? ((trade.current_price - entryPrice) / entryPrice) * 100
    : null;

  const qtyRemaining = trade.quantity - (trade.sold_quantity || 0);

  let rowContent = '';
  let actions = '';

  if (title === 'Open Trades') {
    actions = `
      <button class="btn table-action-btn btn-secondary small-btn open-trade-edit-btn" data-id="${trade.id}">Edit</button>
      <button class="btn table-action-btn btn-danger small-btn open-trade-sell-btn" data-id="${trade.id}">Sell</button>
    `;
    rowContent = `
      <td class="text-center">${trade.ticker || ''}</td>
      <td class="text-center">${trade.quantity || ''}</td>
      <td class="text-center">${qtyRemaining}</td>
      <td class="text-center">${formatCurrency(trade.price)}</td>
      <td class="text-center">${formatCurrency(unrealizedPl)}</td>
      <td class="text-center">${unrealizedPlPct !== null ? `${unrealizedPlPct.toFixed(2)}%` : 'N/A'}</td>
      <td class="text-center">${formatCurrency(trade.current_price)}</td>
      <td class="actions-column text-center">
        <div class="table-actions">
          ${actions}
        </div>
      </td>
    `;
  } else if (title === 'Closed Trades') {
    actions = `
      <button class="btn table-action-btn btn-secondary small-btn closed-trade-edit-btn" data-id="${trade.id}">Edit</button>
      <button class="btn table-action-btn btn-danger small-btn closed-trade-delete-btn" data-id="${trade.id}">Delete</button>
    `;
    rowContent = `
      <td class="text-center">${trade.ticker || ''}</td>
      <td class="text-center">${entryDate ? entryDate.split('T')[0] : 'N/A'}</td>
      <td class="text-center">${formatCurrency(entryPrice)}</td>
      <td class="text-center">${trade.exit_date ? trade.exit_date.split('T')[0] : 'N/A'}</td>
      <td class="text-center">${formatCurrency(trade.exit_price)}</td>
      <td class="text-center">${formatCurrency(trade.pnl)}</td>
      <td class="text-center">${trade.return_pct !== null ? `${trade.return_pct.toFixed(2)}%` : 'N/A'}</td>
      <td class="actions-column text-center">
        <div class="table-actions">
          ${actions}
        </div>
      </td>
    `;
  } else { // Paper Trades
    actions = `
      <button class="btn table-action-btn btn-secondary paper-edit-btn" data-id="${trade.id}">Edit</button>
      <button class="btn table-action-btn btn-danger paper-delete-btn" data-id="${trade.id}">Delete</button>
    `;
    rowContent = `
      <td class="text-center">${trade.ticker}</td>
      <td class="text-center">${trade.quantity}</td>
      <td class="text-center">${entryDate ? entryDate.split('T')[0] : 'N/A'}</td>
      <td class="text-center">${formatCurrency(entryPrice)}</td>
      <td class="text-center">${formatCurrency(trade.current_price)}</td>
      <td class="text-center">${formatCurrency(unrealizedPl)}</td>
      <td class="text-center">${unrealizedPlPct !== null ? `${unrealizedPlPct.toFixed(2)}%` : 'N/A'}</td>
      <td class="actions-column text-center">
        <div class="table-actions">
          ${actions}
        </div>
      </td>
    `;
  }

  // Added class and data attribute for the future modal handler to capture row click
  return `<tr data-id="${trade.id}" class="clickable-trade-row" data-trade-type="${title.toLowerCase().replace(' ', '-')}">${rowContent}</tr>`;
}