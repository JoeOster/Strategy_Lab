// public/js/modules/strategy-lab/index.js

import { error, log } from "../../utils/logger.js";
import { openEditTradeModal } from "../transactions/edit-trade.handlers.js";
import * as handlers from "./handlers.js";
// Import the card click handler from the new sources sub-module
import { handleSourceCardClick } from "./sources/handlers.js";
import { loadWatchedListContent } from "./watched-list/handlers.js";

export function initializeModule() {
	log("Strategy Lab Module Initialized");

	const strategyLabContainer = document.getElementById(
		"strategy-lab-page-container",
	);
	if (!strategyLabContainer) {
		error("Strategy Lab container not found. Cannot initialize module.");
		return;
	}

	// Attach event listener for main sub-tab clicks
	for (const tabElement of strategyLabContainer.querySelectorAll(
		".sub-nav-btn",
	)) {
		tabElement.addEventListener("click", handlers.handleSubTabClick);
	}

	// Add delegated listener for source card clicks and sell button clicks
	strategyLabContainer.addEventListener("click", (event) => {
		// --- START: FIX ---
		// Add type guard to ensure event.target is an Element
		if (!(event.target instanceof Element)) {
			return;
		}
		// --- END: FIX ---

		// --- START: Description Toggle Logic ---
		// Handle "See more" clicks first, preventing bubble-up to source card
		if (event.target.classList.contains("read-more-btn")) {
			event.stopPropagation();
			const btn = event.target;
			const descriptionP = btn.closest(".source-card-description");
			const dots = /** @type {HTMLElement} */ (
				descriptionP.querySelector(".dots")
			);
			const moreText = /** @type {HTMLElement} */ (
				descriptionP.querySelector(".more-text")
			);

			if (moreText && dots) {
				if (moreText.style.display === "none") {
					moreText.style.display = "inline";
					dots.style.display = "none";
					btn.textContent = "See less";
				} else {
					moreText.style.display = "none";
					dots.style.display = "inline";
					btn.textContent = "See more";
				}
			}
			return; // Exit early
		}
		// --- END: Description Toggle Logic ---

		if (event.target.closest(".source-card")) {
			handleSourceCardClick(event);
		} else if (event.target.closest(".real-sell-btn")) {
			const sellButton = event.target.closest(".real-sell-btn");
			// @ts-ignore
			const tradeId = sellButton.dataset.id;
			if (tradeId) {
				openEditTradeModal({ tradeId: tradeId, isSell: true });
			}
		}
	});

	// Add listener for idea creation events
	document.addEventListener("ideaAdded", () => {
		// Check if the watched list is the active sub-tab and refresh it
		const watchedListTab = document.querySelector(
			'[data-sub-tab="watched-list"]',
		);
		if (watchedListTab?.classList.contains("active")) {
			loadWatchedListContent();
		}
	});

	// Initialize the Strategy Lab sub-tabs
	handlers.initializeStrategyLabSubTabs();
}
