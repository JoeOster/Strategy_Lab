// public/js/modules/ledger/render.js

import { formatCurrency } from "../../utils/formatters.js";
import { error, log } from "../../utils/logger.js";
import { makeTableSortable } from "../../utils/sortUtils.js";

export function renderLedgerTable(transactions) {
	const container = document.getElementById("ledger-table-container");
	if (!container) {
		error("Container not found: ledger-table-container");
		return;
	}

	if (!transactions || transactions.length === 0) {
		container.innerHTML = "<p>No transactions found.</p>";
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table";

	table.innerHTML = `
        <thead>
            <tr>
                <th></th>
                <th class="sortable" data-sort-key="ticker">Ticker</th>
                <th class="sortable" data-sort-key="quantity">Quantity</th>
                <th class="sortable" data-sort-key="price">Price</th>
                <th class="sortable" data-sort-key="transaction_date">Date</th>
                <th class="sortable" data-sort-key="transaction_type">Type</th>
                <th class="actions-column">Actions</th>
            </tr>
        </thead>
        <tbody>
            ${transactions
							.map(
								(transaction) => `
                <tr data-id="${transaction.id}">
                    <td><input type="checkbox" /></td>
                    <td class="clickable-ticker">${transaction.ticker}</td>
                    <td>${transaction.quantity}</td>
                    <td>${formatCurrency(transaction.price)}</td>
                    <td>${new Date(
											transaction.transaction_date,
										).toLocaleDateString()}</td>
                    <td>${transaction.transaction_type}</td>
                    <td class="actions-column">
                        <div class="table-actions">
                            <button class="btn btn-danger small-btn delete-transaction-btn" data-id="${
															transaction.id
														}">Delete</button>
                        </div>
                    </td>
                </tr>
            `,
							)
							.join("")}
        </tbody>
    `;

	container.innerHTML = "";
	container.appendChild(table);
	makeTableSortable(table);
}
