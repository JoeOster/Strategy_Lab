// public/js/app-main.js

import { initializeNavigation } from "./modules/navigation/index.js";
import { applyInitialAppearance } from "./modules/settings/appearance.handlers.js";
import {
	renderClosedTrades,
	renderPaperTrades,
} from "./modules/strategy-lab/paper-trades/new-render.js";
import { initializeEditTradeHandlers } from "./modules/transactions/edit-trade.handlers.js";
import { initializeUserSelector } from "./modules/user-selector/index.js";
import { loadHtmlPartial } from "./utils/loadHtmlPartial.js";
import { log } from "./utils/logger.js";

import { initializeModule as initializeDailyReport } from "./modules/daily-report/index.js";
// Initialize modules
import { initializeModule as initializeDashboard } from "./modules/dashboard/index.js";
import { initializeImports } from "./modules/imports/index.js";
import { initializeModule as initializeLedger } from "./modules/ledger/index.js";
import { initializeModule as initializeSettings } from "./modules/settings/index.js";
import { initializeModule as initializeStrategyLab } from "./modules/strategy-lab/index.js";

log("Strategy Lab App Main script loaded.");

document.addEventListener("DOMContentLoaded", async () => {
	// Dynamically load modal HTML partials first
	await loadHtmlPartial("/_source-form-modal.html", "app-container");
	await loadHtmlPartial("/_source-detail-modal.html", "app-container");
	await loadHtmlPartial("/_add-strategy-modal.html", "app-container");
	await loadHtmlPartial("/_sell-trade-modal.html", "app-container");
	await loadHtmlPartial("/_edit-trade-modal.html", "app-container");
	await loadHtmlPartial("/_paper-trade-details-modal.html", "app-container");
	await loadHtmlPartial("/_edit-strategy-modal.html", "app-container");
	await loadHtmlPartial("/_trade-entry-modal.html", "app-container");
	await loadHtmlPartial("/_open-ticker-modal.html", "app-container");

	// Then initialize modules that depend on these elements being present
	// --- START: FIX ---
	// This will now run correctly, applying themes
	applyInitialAppearance();
	// This will now run correctly, fixing the broken tabs
	initializeNavigation();
	// --- END: FIX ---
	initializeUserSelector();
	// initializeStrategyLab(); // This is called by the navigation module when the tab is loaded.

	// ADDED: Re-adding handler initialization from last step
	initializeEditTradeHandlers();

	document.body.addEventListener("click", async (event) => {
		if (event.target?.classList.contains("clickable-ticker")) {
			const ticker = event.target.textContent;
			if (ticker) {
				const { openTickerModal } = await import(
					"./modules/dashboard/modal.handlers.js"
				);
				openTickerModal(ticker);
			}
		}
	});
});
