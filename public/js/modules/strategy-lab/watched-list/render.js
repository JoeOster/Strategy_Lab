import { formatCurrency, formatPercentage } from "../../../utils/formatters.js";

/**
 * Renders the watched list dashboard table.
 * @param {any[] | null} watchedList
 * @param {Error | null} [error]
 */
export function renderWatchedList(watchedList, error = null) {
	const container = document.getElementById("watched-list-table");
	if (!container) return;

	if (error) {
		container.innerHTML = '<p class="error">Failed to load watched list.</p>';
		return;
	}

	if (!watchedList || watchedList.length === 0) {
		container.innerHTML = "<p>No items being watched.</p>";
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table";

	// Columns requested: Ticker, Source, Current Price, Change Amount, Change %, High, Low, Open, Prev Close, Updated
	table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Source</th>
        <th>Price</th>
        <th>Chg $</th>
        <th>Chg %</th>
        <th>High</th>
        <th>Low</th>
        <th>Open</th>
        <th>Prev Close</th>
        <th>Updated</th>
        <th class="text-center">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${watchedList
				.map((item) => {
					const change = item.change_percent || 0;
					const changeClass = change >= 0 ? "text-success" : "text-danger";
					const changeSign = change >= 0 ? "+" : "";

					let badgeClass = "badge-secondary";
					if (item.type === "Real") badgeClass = "badge-success";
					if (item.type === "Paper") badgeClass = "badge-info";
					if (item.type === "Idea") badgeClass = "badge-warning";

					const isWatching = item.status === "WATCHING";
					const actionContent = isWatching
						? `<button class="btn small-btn btn-danger idea-delete-btn" data-id="${item.id}" title="Delete Idea">Delete</button>`
						: "";

					const displayTicker = (item.ticker || "").toUpperCase();

					// --- Logic for Arrow based on History ---
					let arrowIcon = "";
					let history = [];
					if (item.price_history) {
						try {
							history = JSON.parse(item.price_history);
						} catch (e) {}
					}

					// Compare current (last in array) vs previous (second to last)
					if (history.length >= 2) {
						const current = history[history.length - 1];
						const prev = history[history.length - 2];
						if (current > prev)
							arrowIcon = '<span class="text-success">↑</span>';
						else if (current < prev)
							arrowIcon = '<span class="text-danger">↓</span>';
						else arrowIcon = '<span class="text-muted">-</span>';
					}

					// Format Updated At
					let updatedTime = "-";
					if (item.price_updated_at) {
						const date = new Date(item.price_updated_at);
						updatedTime = date.toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						});
					}

					return `
        <tr data-id="${item.id}" class="watched-item-row" style="cursor: pointer;">
          <td class="fw-bold">
            <div class="ticker-cell">
                ${
									item.logo_url
										? `<img src="${item.logo_url}" alt="" class="ticker-logo-sm">`
										: ""
								}
                <span>${displayTicker}</span>
            </div>
          </td>
          <td><span class="badge ${badgeClass}">${item.type}</span></td>
          <td class="fw-bold">
            ${
							item.current_price
								? formatCurrency(item.current_price)
								: "Loading..."
						} ${arrowIcon}
          </td>
          <td class="${changeClass}">${
						item.change_amount ? formatCurrency(item.change_amount) : "-"
					}</td>
          <td class="${changeClass}">
            ${
							item.change_percent !== null
								? `${changeSign}${formatPercentage(change / 100)}`
								: "-"
						}
          </td>
          <td>${item.day_high ? formatCurrency(item.day_high) : "-"}</td>
          <td>${item.day_low ? formatCurrency(item.day_low) : "-"}</td>
          <td>${item.open_price ? formatCurrency(item.open_price) : "-"}</td>
          <td>${item.prev_close ? formatCurrency(item.prev_close) : "-"}</td>
          <td class="text-muted text-small">${updatedTime}</td>
          <td class="text-center">
            <div class="action-buttons">
                ${actionContent}
            </div>
          </td>
        </tr>
      `;
				})
				.join("")}
    </tbody>
  `;

	container.innerHTML = "";
	container.appendChild(table);
}
