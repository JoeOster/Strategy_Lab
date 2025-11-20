/** @typedef {import('../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../types.js').TransactionWithPrice} TransactionWithPrice */
/** @typedef {import('../../types.js').Transaction} Transaction */
import { formatCurrency } from "../../utils/formatters.js";
import { error, log } from "../../utils/logger.js";
import { makeTableSortable } from "../../utils/sortUtils.js";

/**
 * Renders the table of "Paper Trades" for a source.
 * @param {TransactionWithPrice[] | null} trades - An array of Transaction objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderPaperTradesForSource(trades, containerId, error = null) {
	const container = document.getElementById(containerId);
	if (!container) {
		error(`Container for "Paper Trades" not found.`);
		return;
	}

	// Create a wrapper div for the card content
	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = "<h3>Paper Trades - Open</h3>";

	if (error) {
		container.innerHTML += `<p class="error">Failed to load paper trades.</p>`;
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table";

	const tableHeaders = `
    <th class="text-center sortable" title="Stock Ticker" data-sort-key="ticker">Ticker</th>
    <th class="text-center sortable" title="Quantity Purchased" data-sort-key="quantity">Qty P.</th>
    <th class="text-center sortable" title="Quantity Remaining">Qty R.</th>
    <th class="text-center sortable" title="Entry Price" data-sort-key="entry_price">E. Price</th>
    <th class="text-center sortable" title="Limit High" data-sort-key="limit_high">L. High</th>
    <th class="text-center sortable" title="Limit Low" data-sort-key="limit_low">L. Low</th>
    <th class="text-center sortable" title="Unrealized Profit/Loss Dollar" data-sort-key="unrealizedPl">U. P/L $</th>
    <th class="text-center sortable" title="Unrealized Profit/Loss Percentage" data-sort-key="unrealizedPlPct">U. P/L %</th>
    <th class="text-center sortable" title="Current Price" data-sort-key="current_price">C. Price</th>
    <th class="text-center">Actions</th>
  `;

	table.innerHTML = `
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>
      ${
				!trades || trades.length === 0
					? `<tr><td colspan="10">No open paper trades from this source.</td></tr>`
					: trades
							.map((trade) => renderTradeRow(trade, true, "Paper Trades"))
							.join("")
			}
    </tbody>
  `;
	// Append the table to the card wrapper, then the wrapper to the container
	cardWrapper.appendChild(table);
	container.innerHTML = ""; // Clear loading message
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}

/**
 * PCT: Renders the "Test Closed Paper Trades" table.
 * @param {PaperTradeSummary[] | null} trades - An array of PaperTradeSummary objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function pct_renderTradesTable(trades, containerId, error = null) {
	const container = document.getElementById(containerId);
	if (!container) {
		error(`PCT Container not found: ${containerId}`);
		return;
	}

	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = "<h3>Paper Trades - Closed</h3>";

	if (error) {
		cardWrapper.innerHTML +=
			'<p class="error">Failed to load test closed paper trades.</p>';
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table";
	table.innerHTML = `
    <thead>
      <tr>
        <th class="sortable" data-sort-key="ticker">Ticker</th>
        <th class="sortable" data-sort-key="entry_date">Entry Date</th>
        <th class="sortable" data-sort-key="exit_date">Exit Date</th>
        <th class="sortable" data-sort-key="entry_price">Entry Price</th>
        <th class="sortable" data-sort-key="exit_price">Exit Price</th>
        <th class="sortable" data-sort-key="pnl">P/L $</th>
        <th class="sortable" data-sort-key="return_pct">P/L %</th>
      </tr>
    </thead>
    <tbody>
      ${
				!trades || trades.length === 0
					? `<tr><td colspan="7">No closed paper trades found.</td></tr>`
					: trades.map((trade) => renderClosedPaperTradeRow(trade)).join("")
			}
    </tbody>`;
	cardWrapper.appendChild(table);
	container.innerHTML = "";
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}

/**
 * Renders the table of "Open Trades" (real money) for a source.
 * @param {TransactionWithPrice[] | null} trades - An array of Transaction objects with current price.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 * @param {string} [title="Open Trades"] - The title for the table section.
 */
export function renderOpenTradesForSource(
	trades,
	containerId,
	error = null,
	title = "Open Trades",
) {
	const container = document.getElementById(containerId);
	if (!container) {
		error(`Container for "${title}" not found.`);
		return;
	}

	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = `<h3>${title}</h3>`;

	if (error) {
		container.innerHTML += `<p class="error">Failed to load ${title.toLowerCase()}.</p>`;
		return;
	}

	// This is the filter that was being bypassed.
	const realTrades = trades
		? trades.filter((trade) => trade.is_paper_trade !== 1)
		: [];

	const table = document.createElement("table");
	table.className = "strategy-table";

	const tableHeaders = `
    <th class="text-center sortable" title="Stock Ticker" data-sort-key="ticker">Ticker</th>
    <th class="text-center sortable" title="Quantity Purchased" data-sort-key="quantity">Qty P.</th>
    <th class="text-center sortable" title="Quantity Remaining" data-sort-key="qtyRemaining">Qty R.</th>
    <th class="text-center sortable" title="Entry Price" data-sort-key="price">E. Price</th>
    <th class="text-center sortable" title="Limit High" data-sort-key="limit_high">L. High</th>
    <th class="text-center sortable" title="Limit Low" data-sort-key="limit_low">L. Low</th>
    <th class="text-center sortable" title="Unrealized Profit/Loss Dollar" data-sort-key="unrealizedPl">U. P/L $</th>
    <th class="text-center sortable" title="Unrealized Profit/Loss Percentage" data-sort-key="unrealizedPlPct">U. P/L %</th>
    <th class="text-center sortable" title="Current Price" data-sort-key="current_price">C. Price</th>
    <th class="text-center">Actions</th>
  `;

	table.innerHTML = `
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>
      ${
				!realTrades || realTrades.length === 0
					? `<tr><td colspan="10">No ${title.toLowerCase()} from this source.</td></tr>`
					: realTrades
							.map((trade) => renderTradeRow(trade, false, title))
							.join("")
			}
    </tbody>
  `;
	cardWrapper.appendChild(table);
	container.innerHTML = "";
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}

/**
 * TCT: Renders the "Test Closed Trades" table.
 * This is a new, isolated function for testing purposes.
 * @param {any[] | null} trades - An array of trade objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function tct_renderTradesTable(trades, containerId, error = null) {
	const container = document.getElementById(containerId);
	if (!container) {
		error(`TCT Container not found: ${containerId}`);
		return;
	}

	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = "<h3>Retail Trades - Closed</h3>";

	if (error) {
		cardWrapper.innerHTML += '<p class="error">Failed to load test trades.</p>';
		container.innerHTML = "";
		container.appendChild(cardWrapper);
		return;
	}

	// Filter for only REAL closed trades (where is_paper_trade is not 1)
	const realTrades = trades
		? trades.filter((trade) => trade.is_paper_trade !== 1)
		: [];

	const table = document.createElement("table");
	table.className = "strategy-table";

	// Since this is a copy of Open Trades, we use the same headers.
	// UPDATED: Use the new headers for closed trades.
	const tableHeaders = `
    <th class="sortable" data-sort-key="ticker">Ticker</th>
    <th class="sortable" data-sort-key="qty_sold">Qty Sold</th>
    <th class="sortable" data-sort-key="basis">Basis</th>
    <th class="sortable" data-sort-key="proceeds">Sold $</th>
    <th class="sortable" data-sort-key="realized_pl">Realized P/L $</th>
    <th class="sortable" data-sort-key="realized_pl_pct">Realized P/L %</th>
    <th>Actions</th>
  `;

	const rowsHtml =
		!realTrades || realTrades.length === 0
			? `<tr><td colspan="7">No trades found.</td></tr>`
			: realTrades
					.map((trade) => {
						return `
      <tr data-id="${trade.id}">
        <td>${trade.ticker || ""}</td>
        <td>${trade.qty_sold}</td>
        <td>${formatCurrency(trade.basis)}</td>
        <td>${formatCurrency(trade.proceeds)}</td>
        <td>${formatCurrency(trade.realized_pl)}</td>
        <td>${trade.realized_pl_pct.toFixed(2)}%</td>
        <td class="actions-column">
          <div class="table-actions">
            <button class="btn table-action-btn btn-secondary small-btn" data-id="${
							trade.id
						}">Details</button>
          </div>
        </td>
      </tr>
    `;
					})
					.join("");

	table.innerHTML = `
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  `;
	cardWrapper.appendChild(table);
	container.innerHTML = "";
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}

/**
 * Renders a single row for a trade table.
 * @param {any} trade - The trade object.
 * @param {boolean} isPaper - True if it's a paper trade row.
 * @param {string} title - The title of the table being rendered.
 * @returns {string} The HTML string for the table row.
 */
function renderTradeRow(trade, isPaper, title) {
	const entryPrice = isPaper ? trade.price : trade.price;
	const entryDate = isPaper ? trade.transaction_date : trade.transaction_date;

	const unrealizedPl = trade.current_price
		? (trade.current_price - entryPrice) * trade.quantity
		: null;
	const unrealizedPlPct = trade.current_price
		? ((trade.current_price - entryPrice) / entryPrice) * 100
		: null;

	const qtyRemaining = trade.quantity - (trade.sold_quantity || 0);

	// Logic for the current price cell, including the new placeholder icon
	const currentPriceCell =
		trade.current_price !== null && trade.current_price !== undefined
			? `${formatCurrency(
					trade.current_price,
				)} <i class="price-movement-icon"></i>`
			: "N/A";

	let rowContent = "";
	let actions = "";

	if (isPaper) {
		actions = `
      <button class="btn table-action-btn btn-secondary paper-edit-btn" data-id="${trade.id}">Edit</button>
      <button class="btn table-action-btn btn-danger small-btn paper-trade-close-btn" data-id="${trade.id}">Close</button>
      <button class="btn table-action-btn btn-danger paper-delete-btn" data-id="${trade.id}">Delete</button>
    `;
		// UPDATED: Added SL, TP1, and TP2 cells to Paper Trades (Open)
		rowContent = `
      <td class="text-center">${trade.ticker}</td>
      <td class="text-center">${trade.quantity}</td>
      <td class="text-center">-</td>
      <td class="text-center">${formatCurrency(entryPrice)}</td>
      <td class="text-center">${
				trade.limit_high ? formatCurrency(trade.limit_high) : "N/A"
			}</td>
      <td class="text-center">${
				trade.limit_low ? formatCurrency(trade.limit_low) : "N/A"
			}</td>
      <td class="text-center">${
				unrealizedPl !== null ? formatCurrency(unrealizedPl) : "N/A"
			}</td>
      <td class="text-center">${
				unrealizedPlPct !== null ? `${unrealizedPlPct.toFixed(2)}%` : "N/A"
			}</td>
      <td class="text-center">${currentPriceCell}</td>
      <td class="actions-column text-center">
        <div class="table-actions">
          ${actions}
        </div>
      </td>
    `;
	} else {
		// Real Trades (Open Trades)
		actions = `
      <button class="btn table-action-btn btn-secondary small-btn open-trade-edit-btn" data-id="${trade.id}">Edit</button>
      <button class="btn table-action-btn btn-danger small-btn open-trade-sell-btn" data-id="${trade.id}">Sell</button>
    `;
		rowContent = `
      <td class="text-center">${trade.ticker || ""}</td>
      <td class="text-center">${trade.quantity || ""}</td>
      <td class="text-center">${qtyRemaining}</td>
      <td class="text-center">${formatCurrency(trade.price)}</td>
      <td class="text-center">${
				trade.limit_high ? formatCurrency(trade.limit_high) : "N/A"
			}</td>
      <td class="text-center">${
				trade.limit_low ? formatCurrency(trade.limit_low) : "N/A"
			}</td>
      <td class="text-center">${formatCurrency(unrealizedPl)}</td>
      <td class="text-center">${
				unrealizedPlPct !== null ? `${unrealizedPlPct.toFixed(2)}%` : "N/A"
			}</td>
      <td class="text-center">${currentPriceCell}</td>
      <td class="actions-column text-center">
        <div class="table-actions">
          ${actions}
        </div>
      </td>
    `;
	}

	// Added class and data attribute for the future modal handler to capture row click
	return `<tr data-id="${
		trade.id
	}" class="clickable-trade-row" data-trade-type="${title
		.toLowerCase()
		.replace(" ", "-")}">${rowContent}</tr>`;
}

/**
 * Renders a single row for the "Closed Paper Trades" table.
 * @param {PaperTradeSummary} trade - The closed paper trade summary object.
 * @returns {string} The HTML string for the table row.
 */
function renderClosedPaperTradeRow(trade) {
	return `
    <tr data-id="${trade.id}">
      <td class="text-center">${trade.ticker}</td>
      <td class="text-center">${
				trade.entry_date ? trade.entry_date.split("T")[0] : "N/A"
			}</td>
      <td class="text-center">${
				trade.exit_date ? trade.exit_date.split("T")[0] : "N/A"
			}</td>
      <td class="text-center">${formatCurrency(trade.entry_price)}</td>
      <td class="text-center">${
				trade.exit_price ? formatCurrency(trade.exit_price) : "N/A"
			}</td>
      <td class="text-center">${trade.pnl ? formatCurrency(trade.pnl) : "N/A"}</td>
      <td class="text-center">${
				trade.return_pct ? `${trade.return_pct.toFixed(2)}%` : "N/A"
			}</td>
    </tr>
  `;
}
