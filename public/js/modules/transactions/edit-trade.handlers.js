// public/js/modules/transactions/edit-trade.handlers.js

/** @typedef {import('../../types.js').Exchange} Exchange */
import {
	getIdeaForPrefill,
	moveIdeaToPaper,
	moveIdeaToRealTrade,
} from "../strategy-lab/watched-list/api.js";
import {
	getExchanges,
	getSoldQuantity,
	getTransaction,
	sellTransaction,
	updateTransaction,
} from "./api.js";

/**
 * Opens the "Edit Trade" modal for editing an existing trade or creating a new one from an idea.
 * @param {object} options - The options for opening the modal.
 * @param {string} [options.tradeId] - The ID of the trade to edit or sell.
 * @param {string} [options.ideaId] - The ID of the idea to create a trade from.
 * @param {boolean} [options.isPaper] - Whether the new trade is a paper trade.
 * @param {boolean} [options.isSell] - Whether this is a sell action.
 */
export async function openEditTradeModal({ tradeId, ideaId, isPaper, isSell }) {
	const modal = document.getElementById("edit-trade-modal");
	if (!modal) return;

	const form = /** @type {HTMLFormElement | null} */ (
		document.getElementById("edit-trade-form")
	);
	const modalTitle = document.getElementById("edit-trade-modal-title");
	const submitButton = /** @type {HTMLButtonElement | null} */ (
		form?.querySelector('button[type="submit"]')
	);

	if (!form || !modalTitle || !submitButton) {
		console.error("Edit trade modal form elements not found.");
		return;
	}

	const tickerInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("ticker"));
	const exchangeSelect = /** @type {HTMLSelectElement} */ (form.elements.namedItem("exchange"));
	const limitLowInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("limit_low"));
	const limitHighInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("limit_high"));
	const quantityInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("quantity"));

	// Get references to labels
	const exchangeLabel = /** @type {HTMLLabelElement | null} */ (document.querySelector(
		'label[for="edit-trade-exchange"]',
	));
	const limitLowLabel = /** @type {HTMLLabelElement | null} */ (document.querySelector(
		'label[for="edit-trade-limit-low"]',
	));
	const limitHighLabel = /** @type {HTMLLabelElement | null} */ (document.querySelector(
		'label[for="edit-trade-limit-high"]',
	));

	// Reset form and ticker state
	form.reset();
	tickerInput.readOnly = false;

	// Default to showing all fields
	for (const el of [
		exchangeSelect,
		limitLowInput,
		limitHighInput,
		exchangeLabel,
		limitLowLabel,
		limitHighLabel,
	]) {
		if (el) (/** @type {HTMLElement} */ (el)).style.display = "";
	}
	quantityInput.removeAttribute("max"); // Clear any previous max attribute

	try {
		// Populate exchanges dropdown
		/** @type {Exchange[]} */
		const exchanges = await getExchanges();
		exchangeSelect.innerHTML =
			'<option value="" disabled selected>Select an Exchange</option>';
		for (const exchange of exchanges) {
			const option = document.createElement("option");
			option.value = String(exchange.id);
			option.textContent = exchange.name;
			exchangeSelect.appendChild(option);
		}

		if (tradeId) {
			const trade = await getTransaction(tradeId);
			if (isSell) {
				// --- SELL MODE ---
				modalTitle.textContent = "Sell Trade";
				submitButton.textContent = "Confirm Sell";
				submitButton.dataset.action = "sell"; // Set action for the handler
				(/** @type {HTMLInputElement} */ (form.elements.namedItem("id"))).value = String(trade.id);
				(/** @type {HTMLInputElement} */ (form.elements.namedItem("source_id"))).value = String(trade.source_id); // Pass source_id for refresh
				tickerInput.value = trade.ticker; // Pre-fill with current price if available
				tickerInput.readOnly = true;
				(/** @type {HTMLInputElement} */ (form.elements.namedItem("price"))).value = String(trade.current_price || "");
				exchangeSelect.value = trade.exchange_id || ""; // Pre-select exchange

				// Fetch sold quantity and calculate available quantity
				const { sold_quantity: currentSoldQuantity } =
					await getSoldQuantity(tradeId);
				const availableQuantity = trade.quantity - currentSoldQuantity;
				quantityInput.value = String(availableQuantity); // Pre-fill with available quantity
				quantityInput.setAttribute("max", String(availableQuantity)); // Set max attribute

				for (const el of [
					exchangeSelect,
					limitLowInput,
					limitHighInput,
					exchangeLabel,
					limitLowLabel,
					limitHighLabel,
				]) {
					if (el) (/** @type {HTMLElement} */ (el)).style.display = "none";
				}
				exchangeSelect.removeAttribute("required");
			} else {
				// --- EDIT MODE ---
				modalTitle.textContent = "Edit Trade";
				submitButton.textContent = "Save Changes";
				submitButton.dataset.action = "save"; // Set action for the handler
				(/** @type {HTMLInputElement} */ (form.elements.namedItem("id"))).value = String(trade.id);
				tickerInput.value = trade.ticker;
				tickerInput.readOnly = true; // Lock ticker when editing
				quantityInput.value = String(trade.quantity);
				(/** @type {HTMLInputElement} */ (form.elements.namedItem("price"))).value = String(trade.price);
				exchangeSelect.value = trade.exchange_id || ""; // Pre-select exchange
				exchangeSelect.setAttribute("required", "required");
			}
		} else if (ideaId) {
			// --- NEW TRADE MODE ---
			modalTitle.textContent = isPaper ? "New Paper Trade" : "New Real Trade";
			submitButton.textContent = "Execute Trade";
			submitButton.dataset.action = "create"; // Set action for the handler

			const idea = await getIdeaForPrefill(ideaId); // Store idea ID
			if (!idea) {
				throw new Error(`Could not find idea with ID: ${ideaId}`);
			}
			(/** @type {HTMLInputElement} */ (form.elements.namedItem("id"))).value = ""; // No trade ID yet
			(/** @type {HTMLInputElement} */ (form.elements.namedItem("idea_id"))).value = String(idea.id); // Store idea ID
			(/** @type {HTMLInputElement} */ (form.elements.namedItem("source_id"))).value = String(idea.source_id); // Store source ID
			(/** @type {HTMLInputElement} */ (form.elements.namedItem("is_paper"))).value = String(isPaper);
			tickerInput.value = idea.ticker;
			tickerInput.readOnly = true; // Lock ticker when creating from idea
			exchangeSelect.setAttribute("required", "required");
		}

		modal.style.display = "block";
	} catch (error) {
		console.error("Failed to open trade modal:", error);
		alert("Error: Could not open trade modal. Please check the console.");
	}

	// Attach listeners
	const closeButton = modal.querySelector(".close-button");
	closeButton?.addEventListener("click", closeEditTradeModal);

	const cancelBtn = document.getElementById("cancel-edit-trade-btn");
	cancelBtn?.addEventListener("click", closeEditTradeModal);

	form.addEventListener("submit", handleEditTradeSubmit);
}

/**
 * Closes the "Edit Trade" modal.
 */
export function closeEditTradeModal() {
	const modal = document.getElementById("edit-trade-modal");
	if (modal) {
		modal.style.display = "none";
		const form = /** @type {HTMLFormElement | null} */ (document.getElementById("edit-trade-form"));

		if (!form) return;
		const tickerInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("ticker"));
		const exchangeSelect = /** @type {HTMLSelectElement} */ (form.elements.namedItem("exchange"));
		const limitLowInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("limit_low"));
		const limitHighInput = /** @type {HTMLInputElement} */ (form.elements.namedItem("limit_high"));
		const exchangeLabel = /** @type {HTMLLabelElement | null} */ (document.querySelector(
			'label[for="edit-trade-exchange"]',
		));
		const limitLowLabel = /** @type {HTMLLabelElement | null} */ (document.querySelector(
			'label[for="edit-trade-limit-low"]',
		));
		const limitHighLabel = document.querySelector('label[for="edit-trade-limit-high"]');
		form.removeEventListener("submit", handleEditTradeSubmit);
		tickerInput.readOnly = false; // Always reset readonly state
		form.reset();

		// Ensure all fields are visible when closing the modal
		for (const el of [
			exchangeSelect,
			limitLowInput,
			limitHighInput,
			exchangeLabel,
			limitLowLabel,
			limitHighLabel,
		]) {
			if (el) (/** @type {HTMLElement} */ (el)).style.display = "";
		}
		exchangeSelect.setAttribute("required", "required");

		// Reset button to default state
		const submitButton = /** @type {HTMLButtonElement | null} */ (
			form.querySelector('button[type="submit"]')
		);
		if (submitButton) { // Set action for the handler
			submitButton.textContent = "Save Changes";
			submitButton.dataset.action = "save";
		}
	}
}

/**
 * Handles the submission of the "Edit Trade" form.
 * @param {Event} event - The form submission event.
 */
async function handleEditTradeSubmit(event) {
	event.preventDefault();
	const form = /** @type {HTMLFormElement} */ (event.target);
	const formData = new FormData(form);
	const data = Object.fromEntries(formData.entries());

	// Set the time of submission
	data.time = new Date().toISOString();

	try {
		let sourceId;
		const submitButton = form.querySelector('button[type="submit"]');
		const action = submitButton instanceof HTMLElement ? submitButton.dataset.action : undefined;

		if (action === "sell") {
			// --- SELL EXISTING TRADE ---
			const soldTrade = await sellTransaction(data);
			sourceId = soldTrade.source_id;
			alert("Trade sold successfully!");
		} else if (data.id) {
			// --- UPDATE EXISTING TRADE ---
			const updatedTrade = await updateTransaction(String(data.id), data);
			sourceId = updatedTrade.source_id;
			alert("Trade updated successfully!"); // This case might not be used if editing is disabled
		} else if (data.idea_id) {
			// --- CREATE NEW TRADE FROM IDEA ---
			sourceId = data.source_id;
			if (data.is_paper === "true") {
				await moveIdeaToPaper(String(data.idea_id), data);
				alert("Paper trade created successfully!");
			} else {
				await moveIdeaToRealTrade(String(data.idea_id), data);
				alert("Real trade created successfully!");
			}
		}
		closeEditTradeModal();

		// Dispatch an event to notify that a trade was created/updated
		if (sourceId) {
			document.dispatchEvent(
				new CustomEvent("tradeCreated", { detail: { sourceId } }),
			);
		}
	} catch (error) {
		console.error("Failed to save trade:", error);
		alert("Error: Could not save trade. Please check the console.");
	}
}

/**
 * Initializes event listeners for opening the edit trade modal from trade tables.
 */
export function initializeEditTradeHandlers() {
	document.addEventListener("click", (event) => {
		const target = /** @type {HTMLElement} */ (event.target);

		// Check for Edit Trade buttons using event delegation
		if (
			target?.classList.contains("open-trade-edit-btn") ||
			target?.classList.contains("paper-edit-btn")
		) {
			const tradeId = target?.dataset.id;
			if (tradeId) {
				// isSell: false indicates it's an edit action
				openEditTradeModal({ tradeId, isSell: false });
			} else {
				console.error("Edit button clicked but no trade ID found.");
			}
		}
	});
}
