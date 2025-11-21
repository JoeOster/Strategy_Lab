// public/js/modules/ideas/handlers.js

import { getExchanges } from "../settings/exchanges.api.js";
import { convertToPaperTrade, convertToRealTrade } from "./api.js";
import { initializeAppearanceTab } from "./appearance.handlers.js";
import { loadExchangesList } from "./exchanges.handlers.js";
import { updateSettings } from "./general.api.js";
import { loadSourcesList } from "./sources.handlers.js";
import { loadAccountHoldersList } from "./users.handlers.js";
import { loadWebAppsList } from "./webapps.handlers.js";

/**
 * Fetches exchanges and populates a <select> dropdown element.
 * @param {string} selectElementId The ID of the <select> element in your modal.
 */
async function populateExchangesDropdown(selectElementId) {
	const selectElement = document.getElementById(selectElementId);
	if (!selectElement) {
		console.error(`Dropdown element with ID "${selectElementId}" not found.`);
		return;
	}

	selectElement.innerHTML = '<option value="">Loading exchanges...</option>';
	selectElement.disabled = true;

	try {
		const exchanges = await getExchanges();
		selectElement.innerHTML = '<option value="">Select an Exchange...</option>';

		if (exchanges && exchanges.length > 0) {
			for (const exchange of exchanges) {
				const option = document.createElement("option");
				option.value = exchange.id; // Use ID for the value
				option.textContent = exchange.name;
				selectElement.appendChild(option);
			}
		} else {
			selectElement.innerHTML =
				'<option value="">No exchanges configured.</option>';
		}
	} catch (error) {
		console.error("Failed to populate exchanges dropdown:", error);
		selectElement.innerHTML =
			'<option value="">Error loading exchanges</option>';
	} finally {
		selectElement.disabled = false;
	}
}

/**
 * Opens the buy modal and prepares it for a specific trade idea.
 * @param {string} ideaId - The ID of the watched item.
 */
export function openBuyModal(ideaId) {
	const modal = document.getElementById("buy-modal"); // Assumes your modal has this ID
	const form = document.getElementById("buy-modal-form"); // Assumes your form has this ID

	if (!modal || !form) {
		console.error("Buy modal or form not found in the DOM.");
		return;
	}

	// Store the ideaId on the form for the submit handler
	form.dataset.ideaId = ideaId;

	// Populate the dropdown every time the modal is opened
	populateExchangesDropdown("buy-modal-exchange-select"); // Assumes your select has this ID

	modal.style.display = "block";
}

/**
 * Handles the submission of the buy modal form.
 * @param {Event} event
 */
export async function handleBuyModalSubmit(event) {
	event.preventDefault();
	const form = /** @type {HTMLFormElement} */ (event.target);
	const ideaId = form.dataset.ideaId;
	const formData = new FormData(form);
	const tradeData = Object.fromEntries(formData.entries());

	// Determine if it's a paper or real trade
	const isPaperTrade = tradeData.tradeType === "paper";

	if (!ideaId) {
		alert("Error: No trade idea ID found.");
		return;
	}

	try {
		if (isPaperTrade) {
			await convertToPaperTrade(ideaId, tradeData);
			alert("Paper trade created successfully!");
		} else {
			await convertToRealTrade(ideaId, tradeData);
			alert("Real trade created successfully!");
		}

		// Close the modal and refresh the list of ideas (you'll need a function for this)
		form.reset();
		const modal = document.getElementById("buy-modal");
		if (modal) modal.style.display = "none";
		// Example: loadIdeas();
	} catch (error) {
		console.error("Failed to create trade:", error);
		const modalErrorElement = document.getElementById("buy-modal-error");
		// @ts-ignore
		const errorMessage = error.data?.error || "An unknown error occurred.";
		if (modalErrorElement) modalErrorElement.textContent = errorMessage;
		else alert(`Failed to create trade: ${errorMessage}`);
	}
}

/**
 * Initializes all event handlers for the ideas/watched items page.
 * This function should be called once the DOM is fully loaded.
 */
export function initializeIdeasHandlers() {
	const ideasContainer = document.getElementById("ideas-container"); // Assumes a container for your ideas
	const buyModalForm = document.getElementById("buy-modal-form");

	if (ideasContainer) {
		ideasContainer.addEventListener("click", (event) => {
			const target = /** @type {HTMLElement} */ (event.target);
			const buyButton = target.closest(".buy-idea-btn"); // Assumes your buy buttons have this class

			if (buyButton) {
				const ideaId = buyButton.dataset.ideaId;
				if (ideaId) openBuyModal(ideaId);
			}
		});
	}

	if (buyModalForm)
		buyModalForm.addEventListener("submit", handleBuyModalSubmit);
}

/**
 * Handles saving the general settings form.
 */
export async function handleSaveGeneralSettings() {
	const form = /** @type {HTMLFormElement | null} */ (
		document.getElementById("general-settings-form")
	);
	if (!form) {
		console.error("General settings form not found!");
		return;
	}

	const formData = new FormData(form);
	const settings = Object.fromEntries(formData.entries());

	try {
		await updateSettings(settings);
		alert("General settings saved successfully!");
	} catch (error) {
		console.error("Failed to save general settings:", error);
		alert("Failed to save settings. Please check the console for details.");
	}
}

/**
 * Handles clicks on the main settings tabs.
 * @param {Event} event - The click event.
 */
export function handleMainTabClick(event) {
	const target = /** @type {HTMLElement} */ (event.target);
	const tabId = target.dataset.tab;
	if (!tabId) return;

	// Deactivate all tabs and panels
	const allTabs = document.querySelectorAll(".settings-tab");
	for (const tab of allTabs) {
		tab.classList.remove("active");
	}
	const allPanels = document.querySelectorAll(".settings-panel");
	for (const panel of allPanels) {
		panel.classList.remove("active");
	}

	// Activate the clicked tab and corresponding panel
	target.classList.add("active");
	const panel = document.getElementById(tabId);
	if (panel) {
		panel.classList.add("active");

		// FIX: IDs must match the HTML data-tab attributes (e.g., 'exchanges-panel', not 'exchanges-settings-panel')
		switch (tabId) {
			case "sources-panel":
				loadSourcesList();
				break;
			case "exchanges-panel":
				loadExchangesList();
				break;
			case "users-panel":
				loadAccountHoldersList();
				break;
			case "webapps-panel":
				loadWebAppsList();
				break;
			case "appearance-settings-panel":
				initializeAppearanceTab();
				break;
		}
	}
}

/**
 * Handles clicks on the sub-tabs within a settings panel.
 * @param {Event} event - The click event.
 */
export function handleSubTabClick(event) {
	const target = /** @type {HTMLElement} */ (event.target);
	const subTabId = target.dataset.subTab;
	if (!subTabId) return;

	const parentPanel = target.closest(".settings-panel");
	if (!parentPanel) return;

	// Deactivate all sub-tabs and sub-panels within this section
	for (const tab of parentPanel.querySelectorAll(".settings-sub-tab")) {
		tab.classList.remove("active");
	}
	for (const panel of parentPanel.querySelectorAll(".sub-panel")) {
		panel.classList.remove("active");
	}

	// Activate the clicked sub-tab and corresponding sub-panel
	target.classList.add("active");
	const subPanel = parentPanel.querySelector(`#${subTabId}`);
	if (subPanel) {
		subPanel.classList.add("active");
	}
}

/**
 * Clears the "Add Exchange" form.
 */
export function handleClearExchangeForm() {
	const form = /** @type {HTMLFormElement | null} */ (
		document.getElementById("add-exchange-form")
	);
	if (form) form.reset();
}

/**
 * Loads the content for the initially active settings tab.
 */
export function loadInitialTabContent() {
	const activeTab = document.querySelector(".settings-tab.active");
	if (!activeTab) {
		console.warn("No active settings tab found on initial load.");
		return;
	}

	const tabId = activeTab.dataset.tab;
	if (!tabId) return;

	// Load content based on the active tab's ID
	// FIX: IDs must match the HTML data-tab attributes
	switch (tabId) {
		case "sources-panel":
			loadSourcesList();
			break;
		case "exchanges-panel":
			loadExchangesList();
			break;
		case "users-panel":
			loadAccountHoldersList();
			break;
		case "webapps-panel":
			loadWebAppsList();
			break;
	}
}

/**
 * Clears the "Add Web App" form.
 */
export function handleClearWebAppForm() {
	const form = /** @type {HTMLFormElement | null} */ (
		document.getElementById("add-webapp-form")
	);
	if (form) form.reset();
}
