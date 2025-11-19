// public/js/modules/strategy-lab/sources/render.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
/** @typedef {import('../../../types.js').Transaction} Transaction */
import { formatCurrency } from '../../../utils/formatters.js';

/**
 * Renders the list of advice sources as cards in the grid.
 * @param {Source[] | null} sources - An array of source objects from the API.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderSourceCards(sources, error = null) {
  const grid = document.getElementById('source-cards-grid');
  if (!grid) {
    console.error('Source cards grid container not found.');
    return;
  }

  grid.innerHTML = ''; // Clear any existing content

  if (error) {
    grid.innerHTML =
      '<p class="error">Failed to load advice sources. Please try again.</p>';
    return;
  }

  if (!sources || sources.length === 0) {
    grid.innerHTML =
      '<p>No advice sources found. You can add new ones in the Settings menu.</p>';
    return;
  }

  for (const source of sources) {
    const card = document.createElement('div');
    card.className = 'source-card';
    card.dataset.sourceId = String(source.id); // Cast to string for dataset

    // Build the card's inner HTML
    card.innerHTML = `
      <h4 class="source-card-title">${source.name}</h4>
      <p class="source-card-type">${source.type}</p>
      ${
        source.description
          ? `<p class="source-card-description">${source.description}</p>`
          : ''
      }
    `;
    grid.appendChild(card);
  }
}

/**
 * Renders the table of logged strategies for a source.
 * @param {Strategy[]} strategies - An array of strategy objects.
 */
export function renderStrategiesTable(strategies) {
  const container = document.getElementById('strategy-table');
  if (!container) {
    console.error('Strategy table container not found.');
    return;
  }

  if (!strategies || strategies.length === 0) {
    container.innerHTML = '<p>No strategies logged for this source yet.</p>';
    return;
  }

  // Create the table structure
  container.innerHTML = `
    <table class="strategy-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Ticker</th>
          <th>Chapter</th>
          <th>Page</th>
          <th>Description</th>
          <th>PDF</th>
          <th class="actions-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        </tbody>
    </table>
  `;

  const tbody = container.querySelector('tbody');

  if (tbody) {
    for (const strategy of strategies) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${strategy.title || ''}</td>
        <td>${strategy.ticker || ''}</td>
        <td>${strategy.chapter || ''}</td>
        <td>${strategy.page_number || ''}</td>
        <td>${strategy.description || ''}</td>
        <td>${strategy.pdf_path || ''}</td>
        <td class="actions-column">
          <div class="table-actions">
            <button class="table-action-btn btn btn-secondary small-btn" data-strategy-id="${
              strategy.id
            }" data-ticker="${strategy.ticker || ''}">Add Idea</button>
            <button class="table-action-btn btn btn-secondary small-btn strategy-edit-btn" data-strategy-id="${
              strategy.id
            }">Edit</button>
            <button class="table-action-btn btn btn-danger small-btn strategy-delete-btn" data-strategy-id="${
              strategy.id
            }">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    }
  }
}

/**
 * Renders the table of logged trade ideas for a source.
 * @param {WatchedItem[]} ideas - An array of watched item objects.
 */
export function renderTradeIdeasTable(ideas) {
  const container = document.getElementById('trade-ideas-table');
  if (!container) {
    console.error('Trade ideas table container not found.');
    return;
  }

  if (!ideas || ideas.length === 0) {
    container.innerHTML = '<p>No trade ideas logged for this source yet.</p>';
    return;
  }

  // Create the table structure
  container.innerHTML = `
    <table class="strategy-table">
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Entry Zone</th>
          <th>Targets</th>
          <th>Stop Loss</th>
          <th>Status</th>
          <th class="actions-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        </tbody>
    </table>
  `;

  const tbody = container.querySelector('tbody');

  if (tbody) {
    for (const item of ideas) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.ticker || ''}</td>
        <td>${formatCurrency(item.buy_price_low)} - ${formatCurrency(item.buy_price_high)}</td>
        <td>${formatCurrency(item.take_profit_low)} / ${formatCurrency(item.take_profit_high)}</td>
        <td>${formatCurrency(item.escape_price)}</td>
        <td>${item.status || 'WATCHING'}</td>
        <td class="actions-column">
          <div class="table-actions">
            <button class="btn table-action-btn small-btn idea-edit-btn" data-id="${
              item.id
            }">Edit</button>
            <button class="btn table-action-btn btn-danger small-btn idea-delete-btn" data-id="${
              item.id
            }">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    }
  }
}

// --- START: NEW RENDER FUNCTIONS FOR MODAL BOTTOM PANEL ---

/**
 * Renders the table of "Open Ideas" for a source.
 * @param {WatchedItem[] | null} ideas - An array of WatchedItem objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderOpenIdeasForSource(ideas, containerId, error = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  // Clear placeholder and add title
  container.innerHTML = '<h3>Open Ideas</h3>';

  if (error) {
    container.innerHTML += '<p class="error">Failed to load open ideas.</p>';
    return;
  }

  if (!ideas || ideas.length === 0) {
    container.innerHTML += '<p>No open ideas from this source.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Entry Zone</th>
        <th>Targets</th>
        <th>Stop Loss</th>
        <th>Status</th>
        <th>Notes</th>
        <th class="actions-column">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${ideas
        .map(
          (item) => `
        <tr data-id="${item.id}">
          <td>${item.ticker || ''}</td>
          <td>${formatCurrency(item.buy_price_low)} - ${formatCurrency(item.buy_price_high)}</td>
          <td>${formatCurrency(item.take_profit_low)} / ${
            formatCurrency(item.take_profit_high)
          }</td>
          <td>${formatCurrency(item.escape_price)}</td>
          <td>${item.status || 'WATCHING'}</td>
          <td>${item.notes || ''}</td>
          <td class="actions-column">
            <div class="table-actions">
            ${
              item.status === 'EXECUTED'
                ? `<button class="btn table-action-btn small-btn" disabled>&#10004; Executed</button>`
                : `
              <button class="btn table-action-btn small-btn idea-buy-btn" data-id="${item.id}">Buy</button>
              <button class="btn table-action-btn btn-secondary small-btn idea-paper-btn" data-id="${item.id}">Paper</button>
            `
            }
            <button class="btn table-action-btn btn-secondary small-btn idea-edit-btn" data-id="${
              item.id
            }">Edit</button>
            <button class="btn table-action-btn btn-danger small-btn idea-delete-btn" data-id="${
              item.id
            }">Delete</button>
            </div>
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
 * Renders the table of "Open Trades" for a source.
 * @param {import('../../../types.js').TransactionWithPrice[] | null} openTrades - An array of TransactionWithPrice objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderOpenTradesTable(openTrades, containerId, error = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  // Clear placeholder and add title
  container.innerHTML = '<h3>Open Trades</h3>';

  if (error) {
    container.innerHTML += '<p class="error">Failed to load open trades.</p>';
    return;
  }

  if (!openTrades || openTrades.length === 0) {
    container.innerHTML += '<p>No open trades from this source.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Qty Purchased</th>
        <th>Qty Remaining</th>
        <th>Entry $</th>
        <th>Unrealized $/ %</th>
        <th>Current Price</th>
        <th class="actions-column">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${openTrades
        .map((trade) => {
          const qtyRemaining = trade.quantity - (trade.sold_quantity || 0);
          const unrealizedPL = trade.pnl !== null ? trade.pnl.toFixed(2) : 'N/A';
          const unrealizedPLPct = trade.return_pct !== null ? `${trade.return_pct.toFixed(2)}%` : 'N/A';
          const unrealizedCombined = `${unrealizedPL} / ${unrealizedPLPct}`;

          return `
            <tr data-id="${trade.id}">
              <td>${trade.ticker || ''}</td>
              <td>${trade.quantity || ''}</td>
              <td>${qtyRemaining}</td>
              <td>${trade.price || 'N/A'}</td>
              <td>${unrealizedCombined}</td>
              <td>${trade.current_price || 'N/A'}</td>
              <td class="actions-column">
                <div class="table-actions">
                  <button class="btn table-action-btn btn-secondary small-btn open-trade-details-btn" data-id="${
                    trade.id
                  }">Details</button>
                  <button class="btn table-action-btn btn-danger small-btn open-trade-sell-btn" data-id="${
                    trade.id
                  }">Sell</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}

/**
 * Renders the table of "Closed Trades" for a source.
 * @param {import('../../../types.js').PaperTradeSummary[] | null} closedTrades - An array of PaperTradeSummary objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderClosedTradesTable(
  closedTrades,
  containerId,
  error = null
) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  // Clear placeholder and add title
  container.innerHTML = '<h3>Closed Trades</h3>';

  if (error) {
    container.innerHTML += '<p class="error">Failed to load closed trades.</p>';
    return;
  }

  if (!closedTrades || closedTrades.length === 0) {
    container.innerHTML += '<p>No closed trades from this source.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Entry Date</th>
        <th>Entry Price</th>
        <th>Exit Date</th>
        <th>Exit Price</th>
        <th>P&L</th>
        <th>Return %</th>
        <th class="actions-column">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${closedTrades
        .map(
          (trade) => `
        <tr data-id="${trade.id}">
          <td>${trade.ticker || ''}</td>
          <td>${trade.entry_date ? trade.entry_date.split('T')[0] : 'N/A'}</td>
          <td>${formatCurrency(trade.entry_price)}</td>
          <td>${trade.exit_date ? trade.exit_date.split('T')[0] : 'N/A'}</td>
          <td>${formatCurrency(trade.exit_price)}</td>
          <td>${formatCurrency(trade.pnl)}</td>
          <td>${trade.return_pct !== null ? `${trade.return_pct.toFixed(2)}%` : 'N/A'}</td>
          <td class="actions-column">
            <div class="table-actions">
              <button class="btn table-action-btn btn-secondary small-btn closed-trade-details-btn" data-id="${
                trade.id
              }">Details</button>
              <button class="btn table-action-btn btn-danger small-btn closed-trade-delete-btn" data-id="${
                trade.id
              }">Delete</button>
            </div>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// --- END: NEW RENDER FUNCTIONS ---
