// public/js/modules/dashboard/modal.render.js

import { formatCurrency, formatPercentage } from "../../utils/formatters.js";
import { error, log } from "../../utils/logger.js";
import { makeTableSortable } from "../../utils/sortUtils.js";

function renderModalTable(trades, containerId, title, headers, rowRenderer) {
	const container = document.getElementById(containerId);
	if (!container) {
		error(`Container not found: ${containerId}`);
		return;
	}

	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = `<h3>${title}</h3>`;

	if (!trades || trades.length === 0) {
		cardWrapper.innerHTML += "<p>No data found.</p>";
		container.innerHTML = "";
		container.appendChild(cardWrapper);
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table"; // Re-use the existing table style

	table.innerHTML = `
        <thead>
            <tr>
                ${headers
									.map(
										(header) =>
											`<th class="sortable" data-sort-key="${header.key}">${header.label}</th>`,
									)
									.join("")}
            </tr>
        </thead>
        <tbody>
            ${trades.map(rowRenderer).join("")}
        </tbody>
    `;

	cardWrapper.appendChild(table);
	container.innerHTML = "";
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}

export function renderOpenOrdersTable(trades) {
	const headers = [
		{ key: "ticker", label: "Ticker" },
		{ key: "quantity", label: "Quantity" },
		{ key: "price", label: "Entry Price" },
		{ key: "transaction_date", label: "Entry Date" },
		{ key: "exchange", label: "Exchange" },
		{ key: "actions", label: "Actions" },
	];

	const rowRenderer = (trade) => `
        <tr data-id="${trade.id}">
            <td>${trade.ticker}</td>
            <td>${trade.quantity}</td>
            <td>${formatCurrency(trade.price)}</td>
            <td>${new Date(trade.transaction_date).toLocaleDateString()}</td>
            <td>${trade.exchange}</td>
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

	renderModalTable(
		trades,
		"open-orders-table",
		"Open Orders",
		headers,
		rowRenderer,
	);
}

export function renderSalesTable(trades) {
	const headers = [
		{ key: "ticker", label: "Ticker" },
		{ key: "quantity", label: "Quantity" },
		{ key: "price", label: "Sell Price" },
		{ key: "transaction_date", label: "Sell Date" },
		{ key: "exchange", label: "Exchange" },
	];

	const rowRenderer = (trade) => `
        <tr data-id="${trade.id}">
            <td>${trade.ticker}</td>
            <td>${trade.quantity}</td>
            <td>${formatCurrency(trade.price)}</td>
            <td>${new Date(trade.transaction_date).toLocaleDateString()}</td>
            <td>${trade.exchange}</td>
        </tr>
    `;

	renderModalTable(trades, "sales-table", "Sales", headers, rowRenderer);
}
