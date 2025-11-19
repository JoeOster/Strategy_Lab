// public/js/modules/strategy-lab/sources/modal.handlers.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').Transaction} Transaction */
// --- START: NEW IMPORT ---
/** @typedef {import('../../../types.js').PaperTradeSummary} PaperTradeSummary */
/** @typedef {import('../../../types.js').TransactionWithPrice} TransactionWithPrice */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
// --- END: NEW IMPORT ---

import { getSource } from "../../settings/sources.api.js";
// --- START: MODIFICATION ---
// Replaced openEditSourceModal with openSourceFormModal from the refactor
import { openSourceFormModal } from "../../settings/sources.handlers.js";
// --- END: MODIFICATION ---
import {
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
	getStrategiesForSource, // TCT: Import the new API function
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

/** @type {EventListener | null} */
let tradeCreatedHandler = null; // Use the generic EventListener type

/**
 * Opens the source detail modal and populates it with data.
 * @param {string} sourceId - The ID of the source to display.
 */
export async function openSourceDetailModal(sourceId) {
	const modal = document.getElementById("source-detail-modal");
	const profileContainer = document.getElementById("source-profile-container");
	const loggedStrategiesContainer = document.getElementById(
		"logged-strategies-container",
	);
	const closeButton = modal?.querySelector(".close-button");

	// Reset bottom panel placeholders
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
		ideasPlaceholder.style.display = "block"; // Ensure it's visible by default
		ideasPlaceholder.innerHTML = "<h3>Open Ideas</h3><p>Loading...</p>";
	}
	if (openTradesPlaceholder) {
		openTradesPlaceholder.innerHTML = "<h3>Open Trades</h3><p>Loading...</p>";
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
		console.error(
			"Source detail modal elements not found. One or more elements are null.",
		);
		return;
	}

	// Store sourceId on the modal for the click handler to use
	// @ts-ignore
	modal.dataset.sourceId = sourceId;

	try {
		const source = await getSource(sourceId);

		// --- START: IMAGE PATH LOGIC (from previous fix) ---
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
		// --- START: FIX ---
		// Changed placeholder to a file that exists
		const genericPlaceholder = "images/contacts/default.png";
		// --- END: FIX ---

		// Populate profile container
		profileContainer.innerHTML = `
      <a href="${finalImagePath}" target="_blank" class="source-profile-image-link">
        <img 
          src="${finalImagePath}" 
          alt="${source.name}" 
          class="source-profile-image source-profile-thumbnail"
          onerror="this.onerror=null; this.src='${genericPlaceholder}';"
        >
      </a>
      <h3>${source.name}</h3> 
      <p>Type: ${source.type}</p>
      ${source.description ? `<p>${source.description}</p>` : ""}
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
		// --- END: IMAGE PATH LOGIC ---

		// Load content for the right panel (Strategies or Ideas)
		await loadSourceDetailContent(
			sourceId,
			source.type,
			/** @type {HTMLElement} */ (loggedStrategiesContainer),
		);

		// Load bottom panel tables, conditionally hiding Open Ideas for groups
		if (source.type === "group" || source.type === "person") {
			if (ideasPlaceholder) {
				ideasPlaceholder.style.display = "none"; // Hide for groups
			}
		} else {
			loadOpenIdeasForSource(sourceId);
		}
		loadOpenTradesForSource(sourceId);
		tct_loadTrades(sourceId); // TCT: Call the new loader function

		// Display the modal
		// @ts-ignore
		modal.style.display = "block";

		// Attach event listeners
		/** @type {HTMLElement} */ (closeButton).onclick = closeSourceDetailModal;
		/** @param {MouseEvent} event */
		window.onclick = (event) => {
			if (event.target === modal) {
				closeSourceDetailModal();
			}
		};

		// Attach listener for the feature button
		const editButton = profileContainer.querySelector("#edit-source-btn");
		const addStrategyButton =
			loggedStrategiesContainer.querySelector("#add-strategy-btn");
		const addIdeaButton =
			loggedStrategiesContainer.querySelector("#add-idea-btn");

		if (addStrategyButton) {
			addStrategyButton.addEventListener("click", handleShowStrategyForm);
		} else if (addIdeaButton) {
			// --- START: MODIFICATION ---
			// This function is complex and cannot be a direct event listener.
			// We wrap it in an arrow function to provide the correct context.
			addIdeaButton.addEventListener("click", (event) => {
				if (!modal) return;
				// @ts-ignore
				const currentSourceId = modal.dataset.sourceId || null;
				handleShowIdeaForm(event, currentSourceId, null, false, false);
			});
			// --- END: MODIFICATION ---
		}

		if (editButton) {
			editButton.addEventListener("click", handleEditSource);
		}

		// Add event listener for the modal body
		const modalBody = modal.querySelector(".modal-body");
		if (modalBody) {
			modalBody.addEventListener("click", handleModalBottomPanelClicks);
		}

		// Attach listener for the strategy table
		const strategyTable =
			loggedStrategiesContainer.querySelector("#strategy-table");
		if (strategyTable) {
			strategyTable.addEventListener("click", handleStrategyTableClicks);
		}

		// Add listener for trade creation events
		tradeCreatedHandler = (/** @type {Event} */ e) => {
			if (e instanceof CustomEvent) {
				const { sourceId: eventSourceId } = e.detail;
				// @ts-ignore
				const currentSourceId = modal.dataset.sourceId;
				if (eventSourceId === currentSourceId) {
					if (currentSourceId) {
						loadOpenTradesForSource(currentSourceId);
						// Also refresh open ideas, as one was just executed
						loadOpenIdeasForSource(currentSourceId);
					}
				}
			}
		};
		document.addEventListener("tradeCreated", tradeCreatedHandler); // This now works with the corrected type
	} catch (error) {
		console.error(
			`Failed to load source details for modal ${sourceId}:`,
			error,
		);
		profileContainer.innerHTML =
			'<p class="error">Failed to load source details.</p>';
	}
}

/**
 * Handles the edit source action by opening the edit source modal.
 * @param {Event} event - The click event.
 */
function handleEditSource(event) {
	if (!(event.target instanceof HTMLElement)) return;
	// @ts-ignore
	const sourceId = event.target.dataset.sourceId;
	if (sourceId) {
		// --- START: MODIFICATION ---
		// Call the new, refactored function
		openSourceFormModal(sourceId);
		// --- END: MODIFICATION ---
	} else {
		console.error("Edit button clicked without a source ID.");
	}
}

/**
 * Closes the source detail modal.
 */
export function closeSourceDetailModal() {
	const modal = document.getElementById("source-detail-modal");
	if (modal) {
		// @ts-ignore
		modal.style.display = "none";
		// Clear content
		const profile = document.getElementById("source-profile-container");
		if (profile) profile.innerHTML = "";
		const loggedStrategies = document.getElementById(
			"logged-strategies-container",
		);
		if (loggedStrategies) loggedStrategies.innerHTML = "";
		const openIdeas = document.getElementById("open-ideas-table-placeholder");
		if (openIdeas) {
			openIdeas.innerHTML = "";
			openIdeas.style.display = "block"; // Reset display style
		}
		const openTrades = document.getElementById("open-trades-table-placeholder");
		if (openTrades) openTrades.innerHTML = "";

		// Remove event listener for the modal body
		const modalBody = modal.querySelector(".modal-body");
		if (modalBody) {
			modalBody.removeEventListener("click", handleModalBottomPanelClicks);
		}
		const strategyTable = modal.querySelector("#strategy-table");
		if (strategyTable) {
			strategyTable.removeEventListener("click", handleStrategyTableClicks);
		}
		// @ts-ignore
		modal.dataset.sourceId = ""; // Clear the stored ID

		// Remove the trade creation event listener
		if (tradeCreatedHandler) {
			document.removeEventListener("tradeCreated", tradeCreatedHandler);
		}
	}
}

/**
 * Fetches and renders the detailed view for a single source (right panel).
 * @param {string} sourceId - The ID of the source to load.
 * @param {string} sourceType - The type of the source (e.g., 'book', 'person').
 * @param {HTMLElement} targetElement - The element to render the content into.
 */
async function loadSourceDetailContent(sourceId, sourceType, targetElement) {
	console.log(
		`Loading content for source detail right panel for source ${sourceId}...`,
	);

	try {
		if (sourceType === "book" || sourceType === "website") {
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
		} else if (sourceType === "person" || sourceType === "group") {
			targetElement.innerHTML = `
        <div class="source-detail-right-header">
          <h3>Logged Trade Ideas</h3>
          <button class="btn" id="add-idea-btn" data-source-id="${sourceId}">Add Idea</button>
        </div>
        <div id="trade-ideas-table-container">
          <div id="trade-ideas-table">
            <p>No trade ideas logged for this source yet.</p>
          </div>
        </div>
      `;
			await loadTradeIdeasForSource(sourceId);
		}
	} catch (error) {
		console.error(
			`Failed to load source detail content for ${sourceId}:`,
			error,
		);
		targetElement.innerHTML = '<p class="error">Failed to load content.</p>';
	}
}

/**
 * Fetches and renders the strategies table for a given source.
 * @param {string|number} sourceId - The ID of the source.
 */
// --- START: FIX ---
export async function loadStrategiesForSource(sourceId) {
	// --- END: FIX ---
	console.log(`Loading strategies for source ${sourceId}...`);
	try {
		const strategies = await getStrategiesForSource(sourceId);
		renderStrategiesTable(strategies);
	} catch (error) {
		console.error(`Failed to load strategies for source ${sourceId}:`, error);
		const container = document.getElementById("strategy-table");
		if (container) {
			container.innerHTML = '<p class="error">Failed to load strategies.</p>';
		}
	}
}

/**
 * Fetches and renders the trade ideas table for a given source.
 * @param {string|number} sourceId - The ID of the source.
 */
export async function loadTradeIdeasForSource(sourceId) {
	console.log(`Loading trade ideas for source ${sourceId}...`);
	try {
		const ideas = await getOpenIdeasForSource(sourceId);
		renderTradeIdeasTable(ideas);
	} catch (error) {
		console.error(`Failed to load trade ideas for source ${sourceId}:`, error);
		const container = document.getElementById("trade-ideas-table");
		if (container) {
			container.innerHTML = '<p class="error">Failed to load trade ideas.</p>';
		}
	}
}

// --- START: NEW LOADER FUNCTIONS FOR BOTTOM PANEL ---

/**
 * Fetches and renders the "Open Ideas" table for the source.
 * @param {string|number} sourceId - The ID of the source.
 */
// --- START: FIX ---
export async function loadOpenIdeasForSource(sourceId) {
	// --- END: FIX ---
	const containerId = "open-ideas-table-placeholder";
	try {
		const ideas = await getOpenIdeasForSource(sourceId);
		renderOpenIdeasForSource(ideas, containerId);
	} catch (err) {
		console.error(`Failed to load open ideas for source ${sourceId}:`, err);
		const error = err instanceof Error ? err : new Error(String(err));
		renderOpenIdeasForSource(null, containerId, error);
	}
}

/**
 * Fetches and renders the "Open Trades" (real) table for the source.
 * @param {string|number} sourceId - The ID of the source.
 */
// --- START: FIX ---
export async function loadOpenTradesForSource(sourceId) {
	const containerId = "open-trades-table-placeholder";
	try {
		const trades = await getOpenTradesForSource(sourceId);
		renderOpenTradesForSource(trades, containerId, null, "Open Trades");
	} catch (err) {
		console.error(`Failed to load open trades for source ${sourceId}:`, err);
		const error = err instanceof Error ? err : new Error(String(err));
		renderOpenTradesForSource(null, containerId, error);
	}
}

/**
 * Fetches and renders the "Paper Trades" table for the source.
 * @param {string|number} sourceId - The ID of the source.
 */
export async function loadPaperTradesForSource(sourceId) {
	const containerId = "paper-trades-table-placeholder";
	try {
		// --- START: MODIFICATION ---
		/** @type {PaperTradeSummary[]} */
		const trades = await getPaperTradesForSource(sourceId);
		// --- END: MODIFICATION ---
		renderPaperTradesForSource(trades, containerId);
	} catch (err) {
		console.error(`Failed to load paper trades for source ${sourceId}:`, err);
		const error = err instanceof Error ? err : new Error(String(err));
		renderPaperTradesForSource(null, containerId, error);
	}
}

/** TCT: New loader function for the test table.
 * @param {string|number} sourceId - The ID of the source.
 */
async function tct_loadTrades(sourceId) {
	const containerId = "test-closed-trades-table-placeholder";
	try {
		const trades = await tct_getTradesForSource(sourceId);
		// Render using the new, isolated TCT render function
		tct_renderTradesTable(trades, containerId);
	} catch (err) {
		console.error(
			`Failed to load test closed trades for source ${sourceId}:`,
			err,
		);
		const error = err instanceof Error ? err : new Error(String(err));
		tct_renderTradesTable(null, containerId, error);
	}
}
// --- END: NEW LOADER FUNCTIONS ---

import { openEditTradeModal } from "../../transactions/edit-trade.handlers.js";
import { openPaperTradeDetailsModal } from "../../transactions/paper-trade-details.handlers.js";

/**
 * Handles all clicks within the modal's bottom panel.
 * @param {Event} event
 */
async function handleModalBottomPanelClicks(event) {
	if (!(event.target instanceof HTMLElement)) return;
	const target = event.target;

	const button = target.closest("button");
	if (!button) return;

	const id = button.dataset.id;
	if (!id) return;

	let shouldRefreshIdeas = false;
	let shouldRefreshPaperTrades = false;
	let movedToPaper = false;

	// Set the trade type for the idea form
	const tradeTypeInput = /** @type {HTMLInputElement | null} */ (
		document.getElementById("idea-trade-type")
	);

	// Check for "Open Ideas" buttons
	if (button.classList.contains("idea-delete-btn")) {
		shouldRefreshIdeas = await watchedListHandlers.handleDeleteIdeaClick(id);
	} else if (button.classList.contains("idea-paper-btn")) {
		if (tradeTypeInput) tradeTypeInput.value = "paper";
		await watchedListHandlers.handleMoveIdeaToPaperClick(id);
		movedToPaper = true; // Manually set to true after the action is initiated
	} else if (button.classList.contains("idea-buy-btn")) {
		if (tradeTypeInput) tradeTypeInput.value = "real";
		await watchedListHandlers.handleBuyIdeaClick(id);
	} else if (button.classList.contains("idea-edit-btn")) {
		if (tradeTypeInput) tradeTypeInput.value = "edit";
		await watchedListHandlers.handleEditIdeaClick(id); // This function returns void, so we don't assign its result
	}

	// Check for "Paper Trades" buttons
	if (button.classList.contains("paper-delete-btn")) {
		// This variable is currently unused, but we'll keep the call

		shouldRefreshPaperTrades = await handleDeletePaperTradeClick(id);
	} else if (button.classList.contains("paper-details-btn")) {
		openPaperTradeDetailsModal(id);
	}

	// Check for "Open Trades" buttons
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
			loadOpenIdeasForSource(sourceId); // Re-load ideas
		}
		if (movedToPaper || shouldRefreshPaperTrades) {
			// If we moved an idea to paper, OR deleted a paper trade,
			// refresh the paper trades table
			loadPaperTradesForSource(sourceId);
		}
	}
}

/**
 * Handles all clicks within the modal's strategy table.
 * @param {Event} event
 */
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
		// This is the "Add Idea" button
		handleShowIdeaForm(event, sourceId, strategyId, false, false, ticker);
	}
}

/**
 * Handles the click of the delete button on a strategy row.
 * @param {string} strategyId - The ID of the strategy to delete.
 * @param {string} sourceId - The ID of the source to refresh.
 */
async function handleDeleteStrategyClick(strategyId, sourceId) {
	if (!confirm("Are you sure you want to delete this strategy?")) {
		return;
	}

	try {
		await deleteStrategy(strategyId);
		alert("Strategy deleted successfully.");
		await loadStrategiesForSource(sourceId); // Refresh the table
	} catch (error) {
		console.error("Failed to delete strategy:", error);
		alert("Failed to delete strategy. Please check the console.");
	}
}
