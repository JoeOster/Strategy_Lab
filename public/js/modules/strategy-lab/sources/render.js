// public/js/modules/strategy-lab/sources/render.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
/** @typedef {import('../../../types.js').Transaction} Transaction */
import {
	formatCurrency,
	formatDescriptionWithReadMore,
} from "../../../utils/formatters.js";
import { error, log } from "../../../utils/logger.js";
import { makeTableSortable } from "../../../utils/sortUtils.js";

/**
 * Renders the list of advice sources as cards in the grid.
 * @param {Source[] | null} sources - An array of source objects from the API.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderSourceCards(sources, error = null) {
	const grid = document.getElementById("source-cards-grid");
	if (!grid) {
		error("Source cards grid container not found.");
		return;
	}

	grid.innerHTML = ""; // Clear any existing content

	if (error) {
		grid.innerHTML =
			'<p class="error">Failed to load advice sources. Please try again.</p>';
		return;
	}

	if (!sources || sources.length === 0) {
		grid.innerHTML =
			"<p>No advice sources found. You can add new ones in the Settings menu.</p>";
		return;
	}

	for (const source of sources) {
		const card = document.createElement("div");
		card.className = "source-card";
		card.dataset.sourceId = String(source.id); // Cast to string for dataset

		// --- START: Image Path Logic ---
		let folderPath = "images/";
		switch (source.type) {
			case "person":
				folderPath = "images/contacts/";
				break;
			case "group":
				folderPath = "images/group/";
				break;
			case "book":
				folderPath = "images/books/";
				break;
			case "website":
				folderPath = "images/url/";
				break;
		}
		const imageFile = source.image_path ? source.image_path : "default.png";
		const finalImagePath = folderPath + imageFile;
		const genericPlaceholder = "images/contacts/default.png";
		// --- END: Image Path Logic ---

		// --- START: Description Truncation Logic ---
		const descriptionHtml = formatDescriptionWithReadMore(source.description);
		// --- END: Description Truncation Logic ---

		// Build the card's inner HTML
		// Added Image at the top-left or top-center
		card.innerHTML = `
      <div class="source-card-header">
          <img
            src="${finalImagePath}"
            alt="${source.name}"
            class="source-card-thumbnail"
            onerror="this.onerror=null; this.src='${genericPlaceholder}';"
          >
          <div class="source-card-info">
             <h4 class="source-card-title">${source.name}</h4>
             <p class="source-card-type">${source.type}</p>
          </div>
      </div>
      ${descriptionHtml}
    `;
		grid.appendChild(card);
	}

	// Add event listeners for "See more" buttons after all cards are rendered
	for (const button of grid.querySelectorAll(".read-more-btn")) {
		button.addEventListener("click", (event) => {
			const target = /** @type {HTMLElement} */ (event.target);
			const descriptionContainer = target.closest(".source-card-description");
			if (descriptionContainer) {
				const dots = descriptionContainer.querySelector(".dots");
				const moreText = descriptionContainer.querySelector(".more-text");

				if (dots && moreText) {
					if (moreText.style.display === "none") {
						moreText.style.display = "inline";
						dots.style.display = "none";
						target.textContent = "See less";
					} else {
						moreText.style.display = "none";
						dots.style.display = "inline";
						target.textContent = "See more";
					}
				}
			}
		});
	}
}
/**
 * Renders the table of logged strategies for a source.
 * @param {Strategy[]} strategies - An array of strategy objects.
 */
export function renderStrategiesTable(strategies) {
	const container = document.getElementById("strategy-table");
	if (!container) {
		error("Strategy table container not found.");
		return;
	}

	if (!strategies || strategies.length === 0) {
		container.innerHTML = "<p>No strategies logged for this source yet.</p>";
		return;
	}

	// Create the table structure
	const table = document.createElement("table");
	table.className = "strategy-table";
	table.innerHTML = `
    <thead>
      <tr>
        <th class="sortable" data-sort-key="title">Title</th>
        <th class="sortable" data-sort-key="ticker">Ticker</th>
        <th class="sortable" data-sort-key="chapter">Chapter</th>
        <th class="sortable" data-sort-key="page_number">Page</th>
        <th class="sortable" data-sort-key="description">Description</th>
        <th>PDF</th>
        <th class="actions-column">Actions</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;
	container.innerHTML = "";
	container.appendChild(table);

	const tbody = container.querySelector("tbody");

	if (tbody) {
		for (const strategy of strategies) {
			const row = document.createElement("tr");
			row.innerHTML = `
        <td>${strategy.title || ""}</td>
        <td class="clickable-ticker">${strategy.ticker || ""}</td>
        <td>${strategy.chapter || ""}</td>
        <td>${strategy.page_number || ""}</td>
        <td>${strategy.description || ""}</td>
        <td>${strategy.pdf_path || ""}</td>
        <td class="actions-column">
          <div class="table-actions">
            <button class="table-action-btn btn btn-secondary small-btn" data-strategy-id="${
							strategy.id
						}" data-ticker="${strategy.ticker || ""}">Add Idea</button>
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
	makeTableSortable(table);
}

/**
 * Renders the table of logged trade ideas for a source.
 * @param {WatchedItem[]} ideas - An array of watched item objects.
 */
export function renderTradeIdeasTable(ideas) {
	const container = document.getElementById("trade-ideas-table");
	if (!container) {
		error("Trade ideas table container not found.");
		return;
	}

	if (!ideas || ideas.length === 0) {
		container.innerHTML = "<p>No trade ideas logged for this source yet.</p>";
		return;
	}

	// Create the table structure
	const table = document.createElement("table");
	table.className = "strategy-table";
	table.innerHTML = `
    <thead>
      <tr>
        <th class="sortable" data-sort-key="ticker">Ticker</th>
        <th class="sortable" data-sort-key="buy_price_low">Entry Zone</th>
        <th class="sortable" data-sort-key="take_profit_low">Targets</th>
        <th class="sortable" data-sort-key="escape_price">Stop Loss</th>
        <th class="sortable" data-sort-key="status">Status</th>
        <th class="actions-column">Actions</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;
	container.innerHTML = "";
	container.appendChild(table);

	const tbody = container.querySelector("tbody");

	if (tbody) {
		for (const item of ideas) {
			const row = document.createElement("tr");
			row.innerHTML = `
        <td class="clickable-ticker">${item.ticker || ""}</td>
        <td>${formatCurrency(item.buy_price_low)} - ${formatCurrency(
					item.buy_price_high,
				)}</td>
        <td>${formatCurrency(item.take_profit_low)} / ${formatCurrency(
					item.take_profit_high,
				)}</td>
        <td>${formatCurrency(item.escape_price)}</td>
        <td>${item.status || "WATCHING"}</td>
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
	makeTableSortable(table);
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
		error(`Container not found: ${containerId}`);
		return;
	}

	const cardWrapper = document.createElement("div");
	cardWrapper.className = "modal-section-card";
	cardWrapper.innerHTML = "<h3>Open Ideas</h3>";

	if (error) {
		cardWrapper.innerHTML += '<p class="error">Failed to load open ideas.</p>';
		container.innerHTML = "";
		container.appendChild(cardWrapper);
		return;
	}

	const table = document.createElement("table");
	table.className = "strategy-table"; // Re-use the existing table style
	table.innerHTML = `
    <thead>
      <tr>
        <th class="sortable" data-sort-key="ticker">Ticker</th>
        <th class="sortable" data-sort-key="buy_price_low">Entry Zone</th>
        <th class="sortable" data-sort-key="take_profit_low">Targets</th>
        <th class="sortable" data-sort-key="escape_price">Stop Loss</th>
        <th class="sortable" data-sort-key="status">Status</th>
        <th class="sortable" data-sort-key="notes">Notes</th>
        <th class="actions-column">Actions</th>
      </tr>
    </thead>
    <tbody>
      ${
				!ideas || ideas.length === 0
					? `<tr><td colspan="7">No open ideas from this source.</td></tr>`
					: ideas
							.map(
								(item) => `
        <tr data-id="${item.id}">
          <td class="clickable-ticker">${item.ticker || ""}</td>
          <td>${formatCurrency(item.buy_price_low)} - ${formatCurrency(
						item.buy_price_high,
					)}</td>
          <td>${formatCurrency(item.take_profit_low)} / ${formatCurrency(
						item.take_profit_high,
					)}</td>
          <td>${formatCurrency(item.escape_price)}</td>
          <td>${item.status || "WATCHING"}</td>
          <td>${item.notes || ""}</td>
          <td class="actions-column">
            <div class="table-actions">
            ${
							item.status === "EXECUTED" // If the idea has been actioned
								? item.executed_trade_type === "paper"
									? `<button class="btn table-action-btn btn-secondary small-btn" disabled>&#10004; Paper</button>` // It became a paper trade
									: `<button class="btn table-action-btn btn-success small-btn" disabled>&#10004; Bought</button>` // It became a real trade
								: // Otherwise, show the Buy and Paper buttons
									`
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
      `,
							)
							.join("")
			}
    </tbody>
  `;
	cardWrapper.appendChild(table);
	container.innerHTML = "";
	container.appendChild(cardWrapper);
	makeTableSortable(table);
}
