// d:\Code Projects\Strategy_lab\public\js\modules\strategy-lab\paper-trades\new-render.js

/** @typedef {import('../../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../../types.js').Transaction} Transaction */
/** @typedef {import('../../../types.js').TransactionWithPrice} TransactionWithPrice */

/**
 * Renders the table of "Paper Trades".
 * @param {PaperTradeSummary[] | null} trades - An array of PaperTradeSummary objects.
 * @param {HTMLElement | null} container - The container element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderPaperTrades(trades, container, error = null) {
	const openTrades = trades
		? trades.filter((trade) => trade.status === "open")
		: [];
	renderTradesTable(container, "Paper Trades", openTrades, error, true);
}

/**
 * Renders the table of "Closed Trades".
 * @param {PaperTradeSummary[] | null} trades - An array of PaperTradeSummary objects.
 * @param {HTMLElement | null} container - The container element to render into.
 * @param {Error | null} [error] - An optional error object.
 * @param {boolean} [isPaperTrade=false] - True if rendering closed paper trades, false for real closed trades.
 */
export function renderClosedTrades(
	trades,
	container,
	error = null,
	isPaperTrade = false,
) {
	const closedTrades = trades
		? trades.filter((trade) => trade.status === "closed")
		: [];
	renderTradesTable(
		container,
		"Closed Trades",
		closedTrades,
		error,
		isPaperTrade,
	);
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

	const table = document.createElement("table");
	table.className = "strategy-table";
	table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Qty</th>
        <th>Entry Date</th>
        <th>Entry Price</th>
        <th class="${title === "Closed Trades" ? "hidden" : ""}">Current Price</th>
        <th class="${title === "Closed Trades" ? "hidden" : ""}">Unrealized P/L $</th>
        <th class="${title === "Closed Trades" ? "hidden" : ""}">Unrealized P/L %</th>
        <th class="${
					title === "Open Trades" || title === "Paper Trades" ? "hidden" : ""
				}">Realized P/L $</th>
        <th class="${
					title === "Open Trades" || title === "Paper Trades" ? "hidden" : ""
				}">Realized P/L %</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${trades.map((trade) => renderTradeRow(trade, isPaper, title)).join("")}
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
	// For Open Trades, use the direct properties. For Paper and Closed, use the summary/joined properties.
	const entryPrice =
		isPaper || title === "Closed Trades" ? trade.entry_price : trade.price;
	const entryDate =
		isPaper || title === "Closed Trades"
			? trade.entry_date
			: trade.transaction_date;

	const unrealizedPl = trade.current_price
		? (trade.current_price - entryPrice) * trade.quantity
		: null;
	const unrealizedPlPct = trade.current_price
		? ((trade.current_price - entryPrice) / entryPrice) * 100
		: null;

	// Closed trades have the same actions as paper trades (Details/Delete)
	let actions = "";
	if (isPaper || title === "Closed Trades") {
		actions = `
      <button class="btn small-btnbtn-secondary paper-details-btn" data-id="${trade.id}">Details</button>
      <button class="btn small-btnbtn-danger paper-delete-btn" data-id="${trade.id}">Delete</button>
    `;
	} else if (trade.status === "open") {
		// Only show sell button for open real trades
		actions = `
      <button class="btn small-btnbtn-warning real-sell-btn" data-id="${trade.id}">Sell</button>
      <button class="btn small-btnbtn-secondary real-edit-btn" data-id="${trade.id}">Edit</button>
    `;
	} else {
		actions = "N/A"; // No actions for closed real trades
	}

	return `
    <tr data-id="${trade.id}">
      <td>${trade.ticker}</td>
      <td>${trade.quantity}</td>
      <td>${entryDate ? entryDate.split("T")[0] : "N/A"}</td>
      <td>${entryPrice}</td>
      <td class="${title === "Closed Trades" ? "hidden" : ""}">${
				trade.current_price || "N/A"
			}</td>
      <td class="${title === "Closed Trades" ? "hidden" : ""}">${
				unrealizedPl !== null ? unrealizedPl.toFixed(2) : "N/A"
			}</td>
      <td class="${title === "Closed Trades" ? "hidden" : ""}">${
				unrealizedPlPct !== null ? `${unrealizedPlPct.toFixed(2)}%` : "N/A"
			}</td>
      <td class="${
				title === "Open Trades" || title === "Paper Trades" ? "hidden" : ""
			}">${
				(isPaper || title === "Closed Trades") && trade.pnl
					? trade.pnl.toFixed(2)
					: "N/A"
			}</td>
      <td class="${
				title === "Open Trades" || title === "Paper Trades" ? "hidden" : ""
			}">${
				(isPaper || title === "Closed Trades") && trade.return_pct
					? `${trade.return_pct.toFixed(2)}%`
					: "N/A"
			}</td>
      <td>${actions}</td>
    </tr>
  `;
}
