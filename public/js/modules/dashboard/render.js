// public/js/modules/dashboard/render.js

import { formatCurrency, formatPercentage } from "../../utils/formatters.js";
import { error, log } from "../../utils/logger.js";
import { makeTableSortable } from "../../utils/sortUtils.js";

/**
 * Renders a table of trades.
 * @param {any[]} trades - An array of trade objects.
 * @param {string} containerId - The ID of the element to render the table into.
 * @param {string} title - The title of the table.
 * @param {boolean} isClosed - Whether the trades are closed trades.
 */
function renderTradesTable(trades, containerId, title, isClosed) {
	const container = document.getElementById(containerId);
	if (!container) {
		error(`Container not found: ${containerId}`);
		return;
	}

	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = `<h3>${title}</h3>`;

	if (!trades || trades.length === 0) {
		cardWrapper.innerHTML += `<p>No ${
			isClosed ? "closed" : "open"
		} trades found.</p>`;
		container.innerHTML = "";
		container.appendChild(cardWrapper);
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table"; // Re-use the existing table style

	if (isClosed) {
		table.innerHTML = `
            <thead>
                <tr>
                    <th class="sortable" data-sort-key="symbol">Ticker</th>
                    <th class="sortable" data-sort-key="buy_date">Buy Date</th>
                    <th class="sortable" data-sort-key="sell_date">Sell Date</th>
                    <th class="sortable" data-sort-key="buy_price">Buy Price</th>
                    <th class="sortable" data-sort-key="sell_price">Sell Price</th>
                    <th class="sortable" data-sort-key="profit_loss">P/L</th>
                    <th class="sortable" data-sort-key="return_pct">Return %</th>
                </tr>
            </thead>
            <tbody>
                ${trades
									.map(
										(trade) => `
                    <tr data-id="${trade.buy_id}">
                        <td>${trade.symbol}</td>
                        <td>${new Date(trade.buy_date).toLocaleDateString()}</td>
                        <td>${new Date(trade.sell_date).toLocaleDateString()}</td>
                        <td>${formatCurrency(trade.buy_price)}</td>
                        <td>${formatCurrency(trade.sell_price)}</td>
                        <td class="${
													trade.profit_loss >= 0
														? "text-success"
														: "text-danger"
												}">${formatCurrency(trade.profit_loss)}</td>
                        <td class="${
													trade.profit_loss >= 0
														? "text-success"
														: "text-danger"
												}">${formatPercentage(
													trade.profit_loss /
														(trade.buy_price * trade.buy_quantity),
												)}</td>
                    </tr>
                `,
									)
									.join("")}
            </tbody>
        `;
	} else {
		table.innerHTML = `
            <thead>
                <tr>
                    <th class="sortable" data-sort-key="ticker">Ticker</th>
                    <th class="sortable" data-sort-key="quantity">Quantity</th>
                    <th class="sortable" data-sort-key="price">Entry Price</th>
                    <th class="sortable" data-sort-key="transaction_date">Entry Date</th>
                    <th class="sortable" data-sort-key="current_price">Current Price</th>
                    <th class="sortable" data-sort-key="pnl">P/L</th>
                    <th class="sortable" data-sort-key="return_pct">Return %</th>
                    <th class="actions-column">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${trades
									.map((trade) => {
										const pnl =
											(trade.current_price - trade.price) *
											trade.quantity;
										const return_pct =
											pnl / (trade.price * trade.quantity);
										return `
                    <tr data-id="${trade.id}">
                        <td>${trade.ticker}</td>
                        <td>${trade.quantity}</td>
                        <td>${formatCurrency(trade.price)}</td>
                        <td>${new Date(
													trade.transaction_date,
												).toLocaleDateString()}</td>
                        <td>${formatCurrency(trade.current_price)}</td>
                        <td class="${
													pnl >= 0 ? "text-success" : "text-danger"
												}">${formatCurrency(pnl)}</td>
                        <td class="${
													pnl >= 0 ? "text-success" : "text-danger"
												}">${formatPercentage(return_pct)}</td>
                        <td class="actions-column">
                            <div class="table-actions">
                                <button class="btn small-btnbtn-secondary small-btn open-trade-sell-btn" data-id="${
																	trade.id
																}">Sell</button>
                                <button class="btn small-btnbtn-secondary small-btn real-edit-btn" data-id="${
																	trade.id
																}">Edit</button>
                            </div>
                        </td>
                    </tr>
                `;
									})
									.join("")}
            </tbody>
        `;
	}

	cardWrapper.appendChild(table);
	container.innerHTML = "";
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}

export function renderOpenRetailTrades(trades) {
	renderTradesTable(
		trades,
		"open-retail-trades-table",
		"Open Retail Trades",
		false,
	);
}

export function renderClosedRetailTrades(trades) {
	renderTradesTable(
		trades,
		"closed-retail-trades-table",
		"Closed Retail Trades",
		true,
	);
}

export function renderOpenRetailTradesCards(trades) {
	const container = document.getElementById("open-retail-trades-cards");
	if (!container) {
		error("Container not found: open-retail-trades-cards");
		return;
	}

	if (!trades || trades.length === 0) {
		container.innerHTML = "<p>No open trades found.</p>";
		return;
	}

	container.innerHTML = trades
		.map(
			(trade) => `
        <div class="source-card" data-ticker="${trade.ticker}">
            <div class="source-card-header">
                <img src="https://logo.clearbit.com/${trade.ticker}.com" alt="${
									trade.ticker
								}" class="source-card-thumbnail" onerror="this.onerror=null; this.src='images/contacts/default.png';">
                <div class="source-card-info">
                    <h4 class="source-card-title">${trade.ticker}</h4>
                </div>
            </div>
            <div class="source-card-description">
                <p>Total Shares: ${trade.totalShares}</p>
                <p>Average Basis: ${formatCurrency(trade.averageBasis)}</p>
            </div>
            <div class="table-actions">
                <button class="btn small-btnbtn-secondary small-btn open-trade-sell-btn" data-ticker="${
									trade.ticker
								}">Sell</button>
                <button class="btn small-btnbtn-secondary small-btn real-edit-btn" data-ticker="${
									trade.ticker
								}">Edit</button>
            </div>
        </div>
    `,
		)
		.join("");
}
