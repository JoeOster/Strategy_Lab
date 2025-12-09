// public/js/modules/strategy-lab/sources/modal.handlers.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').Transaction} Transaction */
/** @typedef {import('../../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../../types.js').TransactionWithPrice} TransactionWithPrice */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import { showModal, hideModal } from "../../../services/modal.js";
import { loadHtmlPartial } from "../../../utils/loadHtmlPartial.js";
import { getSource } from "../../settings/sources.api.js";
import { openSourceFormModal } from "../../settings/sources.handlers.js";
import { openAddStrategyModal } from "../../settings/strategies.handlers.js";
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

let tradeCreatedHandler = null;

export async function pct_loadTrades(/** @type {number | string} */ sourceId) {
	const openContainerId = "paper-trades-table-placeholder";
	const closedContainerId = "pct-closed-paper-trades-table-placeholder";

	try {
		/** @type {Transaction[]} */
		const allTransactions = await getPaperTradesForSource(sourceId);

		const buyTransactions = allTransactions.filter(
			(t) => t.transaction_type === "buy",
		);
		const sellTransactions = allTransactions.filter(
			(t) => t.transaction_type === "sell",
		);

		// Create a map of original transaction IDs to their total sold quantity
		const soldQuantities = sellTransactions.reduce((acc, sell) => {
			if (sell.original_transaction_id) {
				acc[sell.original_transaction_id] =
					(acc[sell.original_transaction_id] || 0) + Math.abs(sell.quantity);
			}
			return acc;
		}, {});

		const openPaperTrades = [];
		const closedPaperTrades = [];

		for (const buy of buyTransactions) {
			const totalSold = soldQuantities[buy.id] || 0;
			const remainingQty = buy.quantity - totalSold;

			if (remainingQty > 0) {
				// This is an open trade
				openPaperTrades.push({
					...buy,
					sold_quantity: totalSold, // for rendering
				});
			}
		}

		for (const sell of sellTransactions) {
			const buyTrade = buyTransactions.find(
				(b) => b.id === sell.original_transaction_id,
			);
			if (buyTrade) {
				const pnl = (sell.price - buyTrade.price) * Math.abs(sell.quantity);
				const return_pct =
					(pnl / (buyTrade.price * Math.abs(sell.quantity))) * 100;
				closedPaperTrades.push({
					...buyTrade, // base info from the buy
					id: sell.id, // Use sell id for any actions on this closed trade view
					entry_date: buyTrade.transaction_date,
					exit_date: sell.transaction_date,
					exit_price: sell.price,
					entry_price: buyTrade.price,
					quantity: Math.abs(sell.quantity), // show the sold quantity
					pnl,
					return_pct,
					ticker: buyTrade.ticker,
				});
			}
		}

		renderPaperTradesForSource(openPaperTrades, openContainerId);
		pct_renderTradesTable(closedPaperTrades, closedContainerId);
	} catch (err) {
		const e = err instanceof Error ? err : new Error(String(err));
		renderPaperTradesForSource(null, openContainerId, e);
		pct_renderTradesTable(null, closedContainerId, e);
	}
}

export async function openSourceDetailModal(/** @type {number | string} */ sourceId) {
    const modalBodyHtml = await loadHtmlPartial("_source-detail-content.html");

    try {
        const source = await getSource(sourceId);

        showModal({
            title: `Source Details: ${source.name}`,
            body: modalBodyHtml,
            actions: [],
        });

        const profileContainer = document.getElementById("source-profile-container");
        const loggedStrategiesContainer = document.getElementById("logged-strategies-container");
        const ideasPlaceholder = document.getElementById("open-ideas-table-placeholder");
        const openTradesPlaceholder = document.getElementById("open-trades-table-placeholder");
        const testClosedTradesPlaceholder = document.getElementById("test-closed-trades-table-placeholder");

        if (ideasPlaceholder) {
            ideasPlaceholder.style.display = "block";
            ideasPlaceholder.innerHTML = "<h3>Open Ideas</h3><p>Loading...</p>";
        }

        if (openTradesPlaceholder) {
            openTradesPlaceholder.innerHTML = "<h3>Retail Trades - Open</h3><p>Loading...</p>";
        }

        if (testClosedTradesPlaceholder) {
            testClosedTradesPlaceholder.innerHTML = "<h3>Test Closed Trades</h3><p>Loading...</p>";
        }

        if (!profileContainer || !loggedStrategiesContainer) {
            error("Source detail modal content elements not found.");
            return;
        }

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

        if ((source.type === "book" || source.type === "website") && imageFile.startsWith("http")) {
            finalImagePath = imageFile;
        } else {
            finalImagePath = folderPath + imageFile;
        }

        const genericPlaceholder = "images/contacts/default.png";
        const descriptionHtml = formatDescriptionWithReadMore(source.description, 200);

        profileContainer.innerHTML = `
            <a href="${finalImagePath}" target="_blank" class="source-profile-image-link">
                <img src="${finalImagePath}" alt="${source.name}" class="source-profile-image ${source.type === "book" ? "source-profile-book-thumbnail" : ""}" onerror="this.onerror=null; this.src='${genericPlaceholder}';">
            </a>
            <h3>${source.name}</h3>
            <p>Type: ${source.type}</p>
            ${descriptionHtml}
            ${source.url ? `<p>URL: <a href="${source.url}" target="_blank">${source.url}</a></p>` : ""}
            ${source.book_author ? `<p>Author: ${source.book_author}</p>` : ""}
            ${source.book_isbn ? `<p>ISBN: ${source.book_isbn}</p>` : ""}
            ${source.person_email ? `<p>Email: ${source.person_email}</p>` : ""}
            ${source.person_phone ? `<p>Phone: ${source.person_phone}</p>` : ""}
            ${source.group_primary_contact ? `<p>Primary Contact: ${source.group_primary_contact}</p>` : ""}
            <button class="btn" id="edit-source-btn" data-source-id="${source.id}">Edit</button>
        `;

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

        await loadSourceDetailContent(sourceId, source.type, loggedStrategiesContainer);
		loadOpenIdeasForSource(sourceId);
		loadOpenTradesForSource(sourceId);
		pct_loadTrades(sourceId);
		tct_loadTrades(sourceId);

        const editButton = profileContainer.querySelector("#edit-source-btn");
        if (editButton) {
            editButton.addEventListener("click", (e) => {
                if (!(e.target instanceof HTMLElement)) return;
                const sourceId = e.target.dataset.sourceId;
                if (sourceId) {
                    openSourceFormModal(sourceId);
                }
            });
        }

        const addStrategyButton = loggedStrategiesContainer.querySelector("#add-strategy-btn");
        if (addStrategyButton) {
            addStrategyButton.addEventListener("click", () => openAddStrategyModal(source.id));
        }

        const addIdeaButton = loggedStrategiesContainer.querySelector("#add-idea-btn");
        if (addIdeaButton) {
            addIdeaButton.addEventListener("click", (event) => {
                handleShowIdeaForm(event, source.id, null, false, false);
            });
        }

        const modalBody = document.getElementById("global-modal-body");
        if (modalBody) {
            modalBody.addEventListener("click", handleModalBottomPanelClicks);
        }

        const strategyTable = loggedStrategiesContainer.querySelector("#strategy-table");
        if (strategyTable) {
            strategyTable.addEventListener("click", handleStrategyTableClicks);
        }

        tradeCreatedHandler = (/** @type {Event} */ e) => {
			if (e instanceof CustomEvent) {
				const { sourceId: eventSourceId } = e.detail;
                const modal = document.getElementById("global-modal");
                if (modal && modal.dataset.sourceId === eventSourceId) {
                    loadOpenTradesForSource(eventSourceId);
                    loadOpenIdeasForSource(eventSourceId);
                }
			}
		};

		document.addEventListener("tradeCreated", tradeCreatedHandler);

        const globalModal = document.getElementById("global-modal");
        if(globalModal) {
            globalModal.dataset.sourceId = String(sourceId);

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (globalModal.style.display === 'none') {
                            if (tradeCreatedHandler) {
                                document.removeEventListener("tradeCreated", tradeCreatedHandler);
                            }
                            observer.disconnect();
                        }
                    }
                });
            });

            observer.observe(globalModal, { attributes: true });
        }
    } catch (e) {
        error(`Failed to load source details for modal ${sourceId}:`, e);
        showModal({
            title: "Error",
            body: "<p>Failed to load source details.</p>",
            actions: [{ label: "Close", onClick: hideModal }],
        });
    }
}

async function loadSourceDetailContent(
	/** @type {number | string} */ sourceId,
	/** @type {string} */ sourceType,
	/** @type {HTMLElement} */ targetElement,
) {
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
        <div class="source-detail-right-header source-detail-header-flex">
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

export async function loadStrategiesForSource(/** @type {number | string} */ sourceId) {
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

export async function loadTradeIdeasForSource(/** @type {number | string} */ sourceId) {
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

export async function loadOpenIdeasForSource(/** @type {number | string} */ sourceId) {
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

export async function loadOpenTradesForSource(/** @type {number | string} */ sourceId) {
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

export async function loadPaperTradesForSource(/** @type {number | string} */ sourceId) {
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

async function tct_loadTrades(/** @type {number | string} */ sourceId) {
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

async function handleModalBottomPanelClicks(/** @type {MouseEvent} */ event) {
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

	const sourceId = /** @type {HTMLElement} */ (event.target.closest("#global-modal"))?.dataset
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

async function handleStrategyTableClicks(/** @type {MouseEvent} */ event) {
	if (!(event.target instanceof HTMLElement)) return;
	const target = event.target;

	const button = target.closest("button");
	if (!button) return;

	const strategyId = button.dataset.strategyId;
	if (!strategyId) return;

	const modal = /** @type {HTMLElement | null} */ (event.target.closest("#global-modal"));
	if (!modal) return;

	const sourceId = modal.dataset.sourceId;
	const ticker = button.dataset.ticker;

	if (button.classList.contains("strategy-delete-btn")) {
		await handleDeleteStrategyClick(strategyId, sourceId);
	} else if (button.classList.contains("strategy-edit-btn")) {
		handleShowEditStrategyForm(strategyId);
	} else if (button.classList.contains("strategy-add-idea-btn")) {
		handleShowIdeaForm(event, sourceId, strategyId, false, false, ticker);
	}
}

async function handleDeleteStrategyClick(
	/** @type {number | string} */ strategyId,
	/** @type {number | string} */ sourceId,
) {
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

