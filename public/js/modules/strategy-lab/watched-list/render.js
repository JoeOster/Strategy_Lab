import { formatCurrency } from "../../../utils/formatters.js";

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

	table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Last Price</th>
        <th>Change %</th>
        <th>Type</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${watchedList
				.map((item) => {
                    const change = item.change_percent || 0;
                    const changeClass = change >= 0 ? 'text-success' : 'text-danger';
                    const changeSign = change >= 0 ? '+' : '';
                    
                    let badgeClass = 'badge-secondary';
                    if (item.type === 'Real') badgeClass = 'badge-success';
                    if (item.type === 'Paper') badgeClass = 'badge-info';
                    if (item.type === 'Idea') badgeClass = 'badge-warning';

                    const isActionable = item.status === 'WATCHING';
                    
                    // Safety net: Force ticker to uppercase for display
                    const displayTicker = (item.ticker || "").toUpperCase();

                    return `
        <tr data-id="${item.id}" class="watched-item-row">
          <td class="fw-bold">
            <div class="ticker-cell">
                ${item.logo_url ? `<img src="${item.logo_url}" alt="" class="ticker-logo-sm">` : ''}
                <span>${displayTicker}</span>
            </div>
          </td>
          <td>${item.current_price ? formatCurrency(item.current_price) : "Loading..."}</td>
          <td class="${changeClass}">
            ${item.change_percent !== null ? `${changeSign}${formatPercentage(change / 100)}` : "-"}
          </td>
          <td><span class="badge ${badgeClass}">${item.type}</span></td>
          <td>${item.status}</td>
          <td>
            <div class="action-buttons">
                ${isActionable ? 
                    `<button class="btn table-action-btn idea-buy-btn" data-id="${item.id}" title="Buy Real">Buy</button>
                     <button class="btn table-action-btn btn-secondary idea-paper-btn" data-id="${item.id}" title="Paper Trade">Paper</button>` 
                    : 
                    `<button class="btn table-action-btn btn-disabled" disabled>Executed</button>`
                }
                <button class="btn table-action-btn btn-secondary idea-edit-btn" data-id="${item.id}">Edit</button>
                <button class="btn table-action-btn btn-danger idea-delete-btn" data-id="${item.id}">Delete</button>
            </div>
          </td>
        </tr>
      `})
				.join("")}
    </tbody>
  `;

	container.innerHTML = ""; 
	container.appendChild(table);
}