import { log } from "../../utils/logger.js";
import {
	handleSubTabClick,
	initializeDashboardTickerClickHandler,
} from "./handlers.js";
import { initializeTickerModal } from "./modal.handlers.js";

log("Dashboard module loaded.");

export function initializeModule() {
	log("Dashboard module initialized");

	const dashboardContainer = document.getElementById(
		"dashboard-page-container",
	);
	if (dashboardContainer) {
		for (const tabElement of dashboardContainer.querySelectorAll(
			".sub-nav-btn",
		)) {
			tabElement.addEventListener("click", handleSubTabClick);
		}

		// Load default sub-tab
		const defaultSubTab = dashboardContainer.querySelector(".sub-nav-btn");
		if (defaultSubTab) {
			defaultSubTab.click();
		}
	}
	initializeDashboardTickerClickHandler();
	initializeTickerModal();
}
