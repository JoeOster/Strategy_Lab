// public/js/modules/strategy-lab/sources/modal.handlers.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').Transaction} Transaction */
/** @typedef {import('../../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../../types.js').TransactionWithPrice} TransactionWithPrice */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import { getSource } from "../../settings/sources.api.js";

import { openSourceFormModal } from "../../settings/sources.handlers.js";

import {
	pct_renderTradesTable,
	renderOpenTradesForSource,
	renderPaperTradesForSource,
	tct_renderTradesTable,
} from "../../transactions/render.js";

import { handleDeletePaperTradeClick } from "../paper-trades/handlers.js";

import * as watchedListHandlers from "../watched-list/handlers.js";

import {
	deleteStrategy,
	getOpenIdeasForSource,
	getOpenTradesForSource,
	getPaperTradesForSource,
	getStrategiesForSource,
	tct_getTradesForSource,
} from "./api.js";

import { handleShowIdeaForm } from "./idea-form.handlers.js";

import {
	renderOpenIdeasForSource,
	renderStrategiesTable,
	renderTradeIdeasTable,
} from "./render.js";

import {
	handleShowEditStrategyForm,
	handleShowStrategyForm,
} from "./strategy-form.handlers.js";

import { formatDescriptionWithReadMore } from "../../../utils/formatters.js";

import { error, log } from "../../../utils/logger.js";

/** @type {EventListener | null} */

let tradeCreatedHandler = null;

export async function pct_loadTrades(sourceId) {
	const openContainerId = "paper-trades-table-placeholder";

	const closedContainerId = "pct-closed-paper-trades-table-placeholder";

	try {
		const allPaperTransactions = await getPaperTradesForSource(sourceId);

		const closedTradeIds = new Set(
			allPaperTransactions

				.filter((t) => t.transaction_type === "sell")

				.map((t) => t.original_transaction_id),
		);

		const openPaperTrades = allPaperTransactions.filter(
			(t) => t.transaction_type === "BUY" && !closedTradeIds.has(t.id),
		);

		const closedPaperTrades = allPaperTransactions

			.filter((t) => t.transaction_type === "sell")

			.map((sellTrade) => {
				const buyTrade = allPaperTransactions.find(
					(t) => t.id === sellTrade.original_transaction_id,
				);

				if (!buyTrade) return null;

				const pnl = (sellTrade.price - buyTrade.price) * buyTrade.quantity;

				const return_pct = (pnl / (buyTrade.price * buyTrade.quantity)) * 100;

				return {
					id: buyTrade.id,

					ticker: buyTrade.ticker,

					entry_date: buyTrade.transaction_date,

					exit_date: sellTrade.transaction_date,

					entry_price: buyTrade.price,

					exit_price: sellTrade.price,

					pnl,

					return_pct,
				};
			})

			.filter(Boolean);

		renderPaperTradesForSource(openPaperTrades, openContainerId);

		pct_renderTradesTable(closedPaperTrades, closedContainerId);
	} catch (err) {
		const e = err instanceof Error ? err : new Error(String(err));

		renderPaperTradesForSource(null, openContainerId, e);

		pct_renderTradesTable(null, closedContainerId, e);
	}
}

export async function openSourceDetailModal(sourceId) {
	const modal = document.getElementById("source-detail-modal");

	const profileContainer = document.getElementById("source-profile-container");

	const loggedStrategiesContainer = document.getElementById(
		"logged-strategies-container",
	);

	const closeButton = modal?.querySelector(".close-button");

	const ideasPlaceholder = document.getElementById(
		"open-ideas-table-placeholder",
	);

	const openTradesPlaceholder = document.getElementById(
		"open-trades-table-placeholder",
	);

	const testClosedTradesPlaceholder = document.getElementById(
		"test-closed-trades-table-placeholder",
	);

	if (ideasPlaceholder) {
		ideasPlaceholder.style.display = "block";

		ideasPlaceholder.innerHTML = "<h3>Open Ideas</h3><p>Loading...</p>";
	}

	if (openTradesPlaceholder) {
		openTradesPlaceholder.innerHTML =
			"<h3>Retail Trades - Open</h3><p>Loading...</p>";
	}

	if (testClosedTradesPlaceholder) {
		testClosedTradesPlaceholder.innerHTML =
			"<h3>Test Closed Trades</h3><p>Loading...</p>";
	}

	if (
		!modal ||
		!profileContainer ||
		!loggedStrategiesContainer ||
		!closeButton
	) {
		error(
			"Source detail modal elements not found. One or more elements are null.",
		);

		return;
	}

	// @ts-ignore

	modal.dataset.sourceId = sourceId;

	try {
		const source = await getSource(sourceId);

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

		const imageFile = source.image_path || "default.png";
		let finalImagePath;

		if (source.type === "book" && imageFile.startsWith("http")) {
			finalImagePath = imageFile;
		} else {
			finalImagePath = folderPath + imageFile;
		}

		const genericPlaceholder = "images/contacts/default.png";

		const descriptionHtml = formatDescriptionWithReadMore(
			source.description,
			200,
		); // Use a larger maxLength for modal

		// Populate profile container

		// Added style="background-color: #fff; ..." to the image link to fix transparency issues

		profileContainer.innerHTML = `

      <a href="${finalImagePath}" target="_blank" class="source-profile-image-link">

        <img

          src="${finalImagePath}"

          alt="${source.name}"

          class="source-profile-image ${
						source.type === "book" ? "source-profile-book-thumbnail" : ""
					}"

          onerror="this.onerror=null; this.src='${genericPlaceholder}';"

        >

      </a>

      <h3>${source.name}</h3>

      <p>Type: ${source.type}</p>

      ${descriptionHtml}

      ${
				source.url
					? `<p>URL: <a href="${source.url}" target="_blank">${source.url}</a></p>`
					: ""
			}

      ${source.book_author ? `<p>Author: ${source.book_author}</p>` : ""}

      ${source.book_isbn ? `<p>ISBN: ${source.book_isbn}</p>` : ""}

      ${source.person_email ? `<p>Email: ${source.person_email}</p>` : ""}

      ${source.person_phone ? `<p>Phone: ${source.person_phone}</p>` : ""}

      ${
				source.group_primary_contact
					? `<p>Primary Contact: ${source.group_primary_contact}</p>`
					: ""
			}

      <button class="btn" id="edit-source-btn" data-source-id="${source.id}">Edit</button>

    `;

		// Add event listener for "See more" button in the modal

		const readMoreBtn = profileContainer.querySelector(".read-more-btn");

		if (readMoreBtn) {
			readMoreBtn.addEventListener("click", (event) => {
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

		await loadSourceDetailContent(
			sourceId,

			source.type,

			/** @type {HTMLElement} */ (loggedStrategiesContainer),
		);

		loadOpenIdeasForSource(sourceId);
		loadOpenTradesForSource(sourceId);
		pct_loadTrades(sourceId);
		tct_loadTrades(sourceId);

		// @ts-ignore

		modal.style.display = "block";

		/** @type {HTMLElement} */ (closeButton).onclick = closeSourceDetailModal;

		/** @param {MouseEvent} event */

		window.onclick = (event) => {
			if (event.target === modal) {
				closeSourceDetailModal();
			}
		};

		const editButton = profileContainer.querySelector("#edit-source-btn");

		const addStrategyButton =
			loggedStrategiesContainer.querySelector("#add-strategy-btn");

		const addIdeaButton =
			loggedStrategiesContainer.querySelector("#add-idea-btn");

		if (addStrategyButton) {
			addStrategyButton.addEventListener("click", handleShowStrategyForm);
		} else if (addIdeaButton) {
			addIdeaButton.addEventListener("click", (event) => {
				if (!modal) return;

				// @ts-ignore

				const currentSourceId = modal.dataset.sourceId || null;

				handleShowIdeaForm(event, currentSourceId, null, false, false);
			});
		}

		if (editButton) {
			editButton.addEventListener("click", handleEditSource);
		}

		const modalBody = modal.querySelector(".modal-body");

		if (modalBody) {
			modalBody.addEventListener("click", handleModalBottomPanelClicks);
		}

		const strategyTable =
			loggedStrategiesContainer.querySelector("#strategy-table");

		if (strategyTable) {
			strategyTable.addEventListener("click", handleStrategyTableClicks);
		}

		tradeCreatedHandler = (/** @type {Event} */ e) => {
			if (e instanceof CustomEvent) {
				const { sourceId: eventSourceId } = e.detail;

				// @ts-ignore

				const currentSourceId = modal.dataset.sourceId;

				if (eventSourceId === currentSourceId) {
					if (currentSourceId) {
						loadOpenTradesForSource(currentSourceId);

						loadOpenIdeasForSource(currentSourceId);
					}
				}
			}
		};

		document.addEventListener("tradeCreated", tradeCreatedHandler);
	} catch (e) {
		error(
			`Failed to load source details for modal ${sourceId}:`,

			e,
		);

		profileContainer.innerHTML =
			'<p class="error">Failed to load source details.</p>';
	}
}

function handleEditSource(event) {
	if (!(event.target instanceof HTMLElement)) return;
	// @ts-ignore
	const sourceId = event.target.dataset.sourceId;
	if (sourceId) {
		openSourceFormModal(sourceId);
	} else {
		error("Edit button clicked without a source ID.");
	}
}

export function closeSourceDetailModal() {
	const modal = document.getElementById("source-detail-modal");
	if (modal) {
		// @ts-ignore
		modal.style.display = "none";
		const profile = document.getElementById("source-profile-container");
		if (profile) profile.innerHTML = "";
		const loggedStrategies = document.getElementById(
			"logged-strategies-container",
		);
		if (loggedStrategies) loggedStrategies.innerHTML = "";
		const openIdeas = document.getElementById("open-ideas-table-placeholder");
		if (openIdeas) {
			openIdeas.innerHTML = "";
			openIdeas.style.display = "block";
		}
		const openTrades = document.getElementById("open-trades-table-placeholder");
		if (openTrades) openTrades.innerHTML = "";
		const pctClosedPaperTrades = document.getElementById(
			"pct-closed-paper-trades-table-placeholder",
		);
		if (pctClosedPaperTrades) pctClosedPaperTrades.innerHTML = "";

		const testClosedTrades = document.getElementById(
			"test-closed-trades-table-placeholder",
		);
		if (testClosedTrades) testClosedTrades.innerHTML = "";

		const modalBody = modal.querySelector(".modal-body");
		if (modalBody) {
			modalBody.removeEventListener("click", handleModalBottomPanelClicks);
		}
		const strategyTable = modal.querySelector("#strategy-table");
		if (strategyTable) {
			strategyTable.removeEventListener("click", handleStrategyTableClicks);
		}
		// @ts-ignore
		modal.dataset.sourceId = "";

		if (tradeCreatedHandler) {
			document.removeEventListener("tradeCreated", tradeCreatedHandler);
		}
	}
}

async function loadSourceDetailContent(sourceId, sourceType, targetElement) {
	log(
		`Loading content for source detail right panel for source ${sourceId}...`,
	);

	try {
		if (
			sourceType === "book" ||
			sourceType === "website" ||
			sourceType === "person" ||
			sourceType === "group"
		) {
			targetElement.innerHTML = `
        <div class="source-detail-right-header">
          <h3>Logged Strategies</h3>
          <button class="btn" id="add-strategy-btn" data-source-id="${sourceId}">Add Strategy</button>
        </div>
        <div id="strategy-table-container">
          <div id="strategy-table"></div> 
        </div>
      `;
			await loadStrategiesForSource(sourceId);
		}
	} catch (e) {
		error(`Failed to load source detail content for ${sourceId}:`, e);
		targetElement.innerHTML = '<p class="error">Failed to load content.</p>';
	}
}

export async function loadStrategiesForSource(sourceId) {
	log(`Loading strategies for source ${sourceId}...`);
	try {
		const strategies = await getStrategiesForSource(sourceId);
		renderStrategiesTable(strategies);
	} catch (e) {
		error(`Failed to load strategies for source ${sourceId}:`, e);
		const container = document.getElementById("strategy-table");
		if (container) {
			container.innerHTML = '<p class="error">Failed to load strategies.</p>';
		}
	}
}

export async function loadTradeIdeasForSource(sourceId) {
	log(`Loading trade ideas for source ${sourceId}...`);
	try {
		const ideas = await getOpenIdeasForSource(sourceId);
		renderTradeIdeasTable(ideas);
	} catch (e) {
		error(`Failed to load trade ideas for source ${sourceId}:`, e);
		const container = document.getElementById("trade-ideas-table");
		if (container) {
			container.innerHTML = '<p class="error">Failed to load trade ideas.</p>';
		}
	}
}

export async function loadOpenIdeasForSource(sourceId) {
	const containerId = "open-ideas-table-placeholder";
	try {
		const ideas = await getOpenIdeasForSource(sourceId);
		renderOpenIdeasForSource(ideas, containerId);
	} catch (err) {
		log(`Failed to load open ideas for source ${sourceId}:`, err);
		const e = err instanceof Error ? err : new Error(String(err));
		renderOpenIdeasForSource(null, containerId, e);
	}
}

export async function loadOpenTradesForSource(sourceId) {
	const containerId = "open-trades-table-placeholder";
	try {
		const trades = await getOpenTradesForSource(sourceId);
		renderOpenTradesForSource(
			trades,
			containerId,
			null,
			"Retail Trades - Open",
		);
	} catch (err) {
		log(`Failed to load open trades for source ${sourceId}:`, err);
		const e = err instanceof Error ? err : new Error(String(err));
		renderOpenTradesForSource(null, containerId, e);
	}
}

export async function loadPaperTradesForSource(sourceId) {
	const containerId = "paper-trades-table-placeholder";
	try {
		/** @type {PaperTradeSummary[]} */
		const trades = await getPaperTradesForSource(sourceId);
		renderPaperTradesForSource(trades, containerId);
	} catch (err) {
		log(`Failed to load paper trades for source ${sourceId}:`, err);
		const e = err instanceof Error ? err : new Error(String(err));
		renderPaperTradesForSource(null, containerId, e);
	}
}

async function tct_loadTrades(sourceId) {
	const containerId = "test-closed-trades-table-placeholder";
	try {
		const trades = await tct_getTradesForSource(sourceId);
		tct_renderTradesTable(trades, containerId);
	} catch (err) {
		log(`Failed to load test closed trades for source ${sourceId}:`, err);
		const e = err instanceof Error ? err : new Error(String(err));
		tct_renderTradesTable(null, containerId, e);
	}
}

import { openEditTradeModal } from "../../transactions/edit-trade.handlers.js";
import { openPaperTradeDetailsModal } from "../../transactions/paper-trade-details.handlers.js";

async function handleModalBottomPanelClicks(event) {
	if (!(event.target instanceof HTMLElement)) return;
	const target = event.target;

	const button = target.closest("button");
	if (!button) return;

	const id = button.dataset.id;
	if (!id) return;

	let shouldRefreshIdeas = false;
	let shouldRefreshPaperTrades = false;
	let paperTradeClosed = false;
	let movedToPaper = false;

	const tradeTypeInput = /** @type {HTMLInputElement | null} */ (
		document.getElementById("idea-trade-type")
	);

	if (button.classList.contains("idea-delete-btn")) {
		shouldRefreshIdeas = await watchedListHandlers.handleDeleteIdeaClick(id);
	} else if (button.classList.contains("idea-paper-btn")) {
		if (tradeTypeInput) tradeTypeInput.value = "paper";
		await watchedListHandlers.handleMoveIdeaToPaperClick(id);
		movedToPaper = true;
	} else if (button.classList.contains("idea-buy-btn")) {
		if (tradeTypeInput) tradeTypeInput.value = "real";
		await watchedListHandlers.handleBuyIdeaClick(id);
	} else if (button.classList.contains("idea-edit-btn")) {
		if (tradeTypeInput) tradeTypeInput.value = "edit";
		await watchedListHandlers.handleEditIdeaClick(id);
	}

	if (button.classList.contains("paper-delete-btn")) {
		shouldRefreshPaperTrades = await handleDeletePaperTradeClick(id);
	} else if (button.classList.contains("paper-trade-close-btn")) {
		paperTradeClosed = true;
		openEditTradeModal({ tradeId: id, isSell: true, isPaper: true });
	} else if (button.classList.contains("paper-details-btn")) {
		openPaperTradeDetailsModal(id);
	}

	if (button.classList.contains("open-trade-sell-btn")) {
		openEditTradeModal({ tradeId: id, isSell: true });
	} else if (button.classList.contains("real-edit-btn")) {
		openEditTradeModal({ tradeId: id });
	}

	// @ts-ignore
	const sourceId = event.target.closest("#source-detail-modal")?.dataset
		.sourceId;

	if (sourceId) {
		if (shouldRefreshIdeas) {
			loadOpenIdeasForSource(sourceId);
		} else if (movedToPaper || shouldRefreshPaperTrades || paperTradeClosed) {
			loadOpenIdeasForSource(sourceId);
			pct_loadTrades(sourceId);
		}
	}
}

async function handleStrategyTableClicks(event) {
	if (!(event.target instanceof HTMLElement)) return;
	const target = event.target;

	const button = target.closest("button");
	if (!button) return;

	const strategyId = button.dataset.strategyId;
	if (!strategyId) return;

	const modal = event.target.closest("#source-detail-modal");
	if (!modal) return;

	// @ts-ignore
	const sourceId = modal.dataset.sourceId;
	const ticker = button.dataset.ticker;

	if (button.classList.contains("strategy-delete-btn")) {
		await handleDeleteStrategyClick(strategyId, sourceId);
	} else if (button.classList.contains("strategy-edit-btn")) {
		handleShowEditStrategyForm(strategyId);
	} else if (button.classList.contains("table-action-btn")) {
		handleShowIdeaForm(event, sourceId, strategyId, false, false, ticker);
	}
}

async function handleDeleteStrategyClick(strategyId, sourceId) {
	if (!confirm("Are you sure you want to delete this strategy?")) {
		return;
	}

	try {
		await deleteStrategy(strategyId);
		alert("Strategy deleted successfully.");
		await loadStrategiesForSource(sourceId);
	} catch (error) {
		console.error("Failed to delete strategy:", error);
		alert("Failed to delete strategy. Please check the console.");
	}
}
