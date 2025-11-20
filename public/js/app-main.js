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

// Initialize modules
// import { initializeDashboard } from "./modules/dashboard/index.js"; // Removed as it's not used yet
// import { initializeDailyReport } from "./modules/daily-report/index.js"; // Removed as it's not used yet
// import { initializeImports } from "./modules/imports/index.js"; // Removed as it's not used yet
// import { initializeSettings } from "./modules/settings/index.js"; // Removed as it's not used yet
// import { initializeStrategyLab } from "./modules/strategy-lab/index.js"; // Removed as it's not used yet

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
});
