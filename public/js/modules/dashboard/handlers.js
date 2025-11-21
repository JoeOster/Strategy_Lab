// public/js/modules/dashboard/handlers.js

import { loadHtmlPartial } from "../../utils/loadHtmlPartial.js";
import { error, log } from "../../utils/logger.js";

/**
 * Handles clicks on the Dashboard L2 sub-tabs (List View, Card View).
 * Deactivates all sub-panels in its section and activates the correct one.
 * @param {Event} event - The click event.
 */
export function handleSubTabClick(event) {
	if (!(event.target instanceof Element)) {
		return;
	}
	const clickedTabButton = event.target.closest(".sub-nav-btn");

	if (!clickedTabButton) {
		return;
	}
	event.stopPropagation();

	const targetPanelId = clickedTabButton.dataset.subTab;
	const dashboardContainer = clickedTabButton.closest(
		"#dashboard-page-container",
	);

	if (!dashboardContainer) {
		error("Could not find parent Dashboard container.");
		return;
	}

	// Deactivate all sub-tab buttons and content panels within this section
	for (const btn of dashboardContainer.querySelectorAll(".sub-nav-btn")) {
		btn.classList.remove("active");
	}

	clickedTabButton.classList.add("active");

	// Activate the corresponding panel
	const dashboardContent = document.getElementById("dashboard-content");
	if (dashboardContent) {
		loadHtmlPartial(`/_${targetPanelId}.html`, "dashboard-content").then(() => {
			if (targetPanelId === "dashboard-list-view") {
				const api = import("./api.js");
				const render = import("./render.js");
				Promise.all([api, render]).then(
					([
						{ getOpenRetailTrades, getClosedRetailTrades },
						{ renderOpenRetailTrades, renderClosedRetailTrades },
					]) => {
						getOpenRetailTrades().then(renderOpenRetailTrades);
						getClosedRetailTrades().then(renderClosedRetailTrades);
					},
				);
			} else if (targetPanelId === "dashboard-card-view") {
				const api = import("./api.js");
				const render = import("./render.js");
				Promise.all([api, render]).then(
					([
						{ getOpenRetailTradesCardData },
						{ renderOpenRetailTradesCards },
					]) => {
						getOpenRetailTradesCardData().then(renderOpenRetailTradesCards);
					},
				);
			}
		});
	} else {
		error(`Sub-panel with ID '${targetPanelId}' not found.`);
	}
}

export function initializeDashboardTickerClickHandler() {
	const dashboardContent = document.getElementById("dashboard-content");
	if (dashboardContent) {
		dashboardContent.addEventListener("click", (event) => {
			if (!(event.target instanceof Element)) {
				return;
			}
			const card = event.target.closest(".source-card");
			if (card) {
				const ticker = card.dataset.ticker;
				if (ticker) {
					openTickerModal(ticker);
				}
			}

			const row = event.target.closest("tr");
			if (row) {
				const ticker = row.querySelector("td:first-child")?.textContent;
				if (ticker) {
					openTickerModal(ticker);
				}
			}
		});
	}
}

import { openTickerModal as openTickerModalFromModalHandlers } from "./modal.handlers.js";

function openTickerModal(ticker) {
	openTickerModalFromModalHandlers(ticker);
}
