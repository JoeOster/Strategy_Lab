// public/js/modules/transactions/render.js

/** @typedef {import('../../types.js').Transaction} Transaction */

import { formatCurrency } from '../../utils/formatters.js';

/**
 * Renders the table of "Open Trades" (real money) for a source.
 * @param {Transaction[] | null} trades - An array of Transaction objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderOpenTradesForSource(trades, containerId, error = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  container.innerHTML = '<h3>Open Trades</h3>';

  if (error) {
    container.innerHTML += '<p class="error">Failed to load open trades.</p>';
    return;
  }

  if (!trades || trades.length === 0) {
    container.innerHTML += '<p>No open trades from this source.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Ticker</th>
        <th>Type</th>
        <th>Qty</th>
        <th>Entry Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${trades
        .map(
          (trade) => `
        <tr data-id="${trade.id}">
          <td>${trade.transaction_date.split('T')[0] || ''}</td>
          <td>${trade.ticker || ''}</td>
          <td>${trade.transaction_type || ''}</td>
          <td>${trade.quantity || ''}</td>
          <td>${formatCurrency(trade.price)}</td>
          <td>
            <button class="btn table-action-btn real-sell-btn" data-id="${
              trade.id
            }">Sell</button>
            <button class="btn table-action-btn real-edit-btn" data-id="${
              trade.id
            }">Edit</button>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}

/**
 * Renders the table of "Paper Trades" for a source.
 * @param {Transaction[] | null} trades - An array of Transaction objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderPaperTradesForSource(trades, containerId, error = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  container.innerHTML = '<h3>Paper Trades</h3>';

  if (error) {
    container.innerHTML += '<p class="error">Failed to load paper trades.</p>';
    return;
  }

  if (!trades || trades.length === 0) {
    container.innerHTML += '<p>No paper trades from this source.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Entry Date</th>
        <th>Symbol</th>
        <th>Qty</th>
        <th>Entry Price</th>
        <th>Exit Date</th>
        <th>Exit Price</th>
        <th>P/L</th>
        <th>Return %</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${trades
        .map(
          (trade) => `
        <tr data-id="${trade.id}">
          <td>${trade.entry_date.split('T')[0] || ''}</td>
          <td>${trade.ticker || ''}</td>
          <td>${trade.quantity || ''}</td>
          <td>${formatCurrency(trade.entry_price)}</td>
          <td>${trade.exit_date ? trade.exit_date.split('T')[0] : ''}</td>
          <td>${trade.exit_price ? formatCurrency(trade.exit_price) : ''}</td>
          <td>${trade.pnl ? formatCurrency(trade.pnl) : ''}</td>
          <td>${
            trade.return_pct ? `${trade.return_pct.toFixed(2)}%` : ''
          }</td>
          <td>
            <button class="btn table-action-btn paper-details-btn" data-id="${
              trade.id
            }">Details</button>
            <button class="btn table-action-btn paper-delete-btn" data-id="${
              trade.id
            }">Delete</button>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}
