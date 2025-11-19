// public/js/modules/settings/index.js

import {
	handleFontChange,
	handleThemeChange,
	initializeAppearanceTab,
} from "./appearance.handlers.js";
import * as exchangesHandlers from "./exchanges.handlers.js";
import { initializeIdeasHandlers } from "./handlers.js";
// --- START: FIX ---
// Import the new save function
import { handleSaveGeneralSettings } from "./handlers.js";
// --- END: FIX ---
import * as handlers from "./handlers.js";
import {
	handleDeleteSourceClick,
	handleSourceTypeChange,
	initializeSourceSettings,
	openSourceFormModal,
} from "./sources.handlers.js";
import * as usersHandlers from "./users.handlers.js";
import * as webappsHandlers from "./webapps.handlers.js"; // Import new handlers

export function initializeModule() {
	console.log("Settings module initialized.");

	initializeAppearanceTab();

	// Initialize handlers for the source settings and modal
	initializeSourceSettings();

	// Initialize the handlers for the "ideas" or "watched items" functionality
	initializeIdeasHandlers();

	// Stop the General Settings form from reloading the page
	const generalForm = document.getElementById("general-settings-form");
	if (generalForm) {
		generalForm.addEventListener("submit", (event) => {
			event.preventDefault();
			// --- START: FIX ---
			// Call the real save function instead of an alert
			handleSaveGeneralSettings();
			// --- END: FIX ---
		});
	}

	// Stop the Appearance Settings form from reloading the page
	const appearanceForm = document.getElementById("appearance-settings-form");
	if (appearanceForm) {
		appearanceForm.addEventListener("submit", (event) => {
			event.preventDefault();
			console.log("Appearance settings save clicked");
			alert("Appearance settings saved!");
		});
	}

	// Main tab navigation
	for (const button of document.querySelectorAll(".settings-tab")) {
		button.addEventListener("click", handlers.handleMainTabClick);
	}

	// Explicitly activate the default tab (Dashboard) and load its content
	const defaultTab = document.querySelector(
		'.settings-tab[data-tab="dashboard-panel"]',
	);
	if (defaultTab) {
		/** @type {HTMLElement} */ (defaultTab).click();
	}

	// Sub-tab navigation (using event delegation)
	const subtabsContainers = document.querySelectorAll(".settings-sub-tabs");
	for (const container of subtabsContainers) {
		container.addEventListener("click", handlers.handleSubTabClick);
	}

	// Delegated event listener for all change events within the settings page
	const appContainer = document.getElementById("app-container");
	if (appContainer) {
		appContainer.addEventListener("change", (event) => {
			const target = event.target;
			if (!(target instanceof HTMLElement)) return;

			switch (target.id) {
				case "theme-selector":
					handleThemeChange(event);
					break;
				case "font-selector":
					handleFontChange(event);
					break;
				case "source-form-type":
					handleSourceTypeChange(
						/** @type {HTMLSelectElement} */ (target).value,
					);
					break;
			}
		});
	}

	// Add new exchange form submission
	const addExchangeForm = document.getElementById("add-exchange-form");
	if (addExchangeForm) {
		addExchangeForm.addEventListener(
			"submit",
			exchangesHandlers.handleAddExchangeSubmit,
		);
	}

	// Clear exchange form button
	const clearExchangeBtn = document.getElementById("clear-exchange-btn");
	if (clearExchangeBtn) {
		clearExchangeBtn.addEventListener("click", () =>
			handlers.handleClearExchangeForm(),
		);
	}

	// Clear holder form button
	const clearHolderBtn = document.getElementById("clear-holder-btn");
	if (clearHolderBtn) {
		// @ts-ignore
		clearHolderBtn.addEventListener("click", () =>
			usersHandlers.handleClearHolderForm(),
		);
	}

	// Clear web app form button
	const clearWebAppBtn = document.getElementById("clear-webapp-btn");
	if (clearWebAppBtn) {
		clearWebAppBtn.addEventListener("click", () =>
			handlers.handleClearWebAppForm(),
		);
	}

	// Add new holder form submission
	const addHolderForm = document.getElementById("add-holder-form");
	if (addHolderForm) {
		addHolderForm.addEventListener(
			"submit",
			usersHandlers.handleAddHolderSubmit,
		);
	}

	// Add new webapp form submission
	const addWebAppForm = document.getElementById("add-webapp-form");
	if (addWebAppForm) {
		addWebAppForm.addEventListener(
			"submit",
			webappsHandlers.handleAddWebAppSubmit,
		);
	}

	// Close button for source-detail-modal
	const sourceDetailModal = document.getElementById("source-detail-modal");
	if (sourceDetailModal) {
		const closeButton = sourceDetailModal.querySelector(".close-button");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				// @ts-ignore
				sourceDetailModal.style.display = "none";
			});
		} else {
			console.error("Close button not found within source detail modal.");
		}
	}

	// Event delegation for deleting/editing sources
	const sourcesContainer = document.getElementById("advice-source-list");
	if (sourcesContainer) {
		sourcesContainer.addEventListener("click", (event) => {
			if (!(event.target instanceof HTMLElement)) return;
			const target = event.target;
			// @ts-ignore
			const sourceId = target.dataset.id;

			if (target.classList.contains("delete-source-btn") && sourceId) {
				handleDeleteSourceClick(sourceId);
			}
			if (target.classList.contains("edit-source-btn") && sourceId) {
				openSourceFormModal(sourceId);
			}
		});
	}

	// Event delegation for user-list actions
	const accountHolderList = document.getElementById("account-holder-list");
	if (accountHolderList) {
		accountHolderList.addEventListener("click", (event) => {
			if (!(event.target instanceof HTMLElement)) return;
			const target = event.target;
			// @ts-ignore
			const holderId = target.dataset.id;

			if (!holderId) return;

			if (target.classList.contains("delete-holder-btn")) {
				// @ts-ignore
				usersHandlers.handleDeleteHolderClick(holderId);
			} else if (target.classList.contains("set-default-holder-btn")) {
				// @ts-ignore
				usersHandlers.handleSetDefaultHolderClick(event, holderId);
			} else if (target.classList.contains("manage-subscriptions-btn")) {
				// @ts-ignore
				usersHandlers.handleManageSubscriptionsClick(event, holderId);
			}
		});
	}

	// Event delegation for deleting exchanges
	const exchangesContainer = document.getElementById("exchange-list");
	if (exchangesContainer) {
		exchangesContainer.addEventListener("click", (event) => {
			if (!(event.target instanceof HTMLElement)) return;
			const target = event.target;
			if (target.classList.contains("delete-exchange-btn")) {
				// @ts-ignore
				const exchangeId = target.dataset.id;
				if (exchangeId) {
					exchangesHandlers.handleDeleteExchangeClick(exchangeId);
				}
			}
		});
	}

	// Event delegation for deleting webapps
	const webappsContainer = document.getElementById("webapp-list");
	if (webappsContainer) {
		webappsContainer.addEventListener("click", (event) => {
			if (!(event.target instanceof HTMLElement)) return;
			const target = event.target;
			if (target.classList.contains("delete-webapp-btn")) {
				// @ts-ignore
				const webAppId = target.dataset.id;
				if (webAppId) {
					webappsHandlers.handleDeleteWebAppClick(webAppId);
				}
			}
		});
	}
}
