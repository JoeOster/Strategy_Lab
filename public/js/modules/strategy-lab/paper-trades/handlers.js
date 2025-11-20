// public/js/modules/strategy-lab/paper-trades/handlers.js

import { error, log } from "../../../utils/logger.js";
import {
	pct_renderTradesTable,
	renderPaperTradesForSource,
} from "../../transactions/render.js";
import { deletePaperTrade, getAllPaperTrades } from "./api.js";

/**
 * Loads and renders all paper trades for the "Paper Trades" sub-tab.
 */
export async function loadPaperTradesContent() {
	log("Loading Paper Trades content...");
	const container = document.getElementById("paper-trades-table");
	if (!container) {
		error("Paper Trades container not found.");
		return;
	}

	container.innerHTML = "<p>Loading all paper trades...</p>";

	try {
		const allPaperTransactions = await getAllPaperTrades();

		// Separate open and closed paper trades

		const closedTradeIds = new Set(
			allPaperTransactions

				.filter((t) => t.transaction_type === "sell")

				.map((t) => t.original_transaction_id),
		);

		const openPaperTrades = allPaperTransactions.filter(
			(t) => t.transaction_type === "BUY" && !closedTradeIds.has(t.id),
		);

		const closedPaperTrades = allPaperTransactions

			.filter((t) => t.transaction_type === "sell")

			.map((sellTrade) => {
				const buyTrade = allPaperTransactions.find(
					(t) => t.id === sellTrade.original_transaction_id,
				);

				if (!buyTrade) return null;

				const pnl = (sellTrade.price - buyTrade.price) * buyTrade.quantity;

				const return_pct = (pnl / (buyTrade.price * buyTrade.quantity)) * 100;

				return {
					id: buyTrade.id,

					ticker: buyTrade.ticker,

					entry_date: buyTrade.transaction_date,

					exit_date: sellTrade.transaction_date,

					entry_price: buyTrade.price,

					exit_price: sellTrade.price,

					pnl,

					return_pct,
				};
			})

			.filter(Boolean);

		// Clear the loading message

		container.innerHTML = "";

		// Create separate containers for open and closed trades within the main paper-trades-table div

		const openTradesContainer = document.createElement("div");

		openTradesContainer.id = "all-open-paper-trades-container";

		container.appendChild(openTradesContainer);

		const closedTradesContainer = document.createElement("div");

		closedTradesContainer.id = "all-closed-paper-trades-container";

		container.appendChild(closedTradesContainer);

		renderPaperTradesForSource(
			openPaperTrades,
			"all-open-paper-trades-container",
		);

		pct_renderTradesTable(
			closedPaperTrades,
			"all-closed-paper-trades-container",
		);
	} catch (error) {
		error("Failed to load all paper trades:", error);

		container.innerHTML =
			'<p class="error">Failed to load all paper trades.</p>';
	}
}

/**

 * Handles the click event for deleting a paper trade.

 * @param {string} tradeId - The ID of the paper trade to delete.

 * @returns {Promise<boolean>} - True if the paper trades list should be refreshed, false otherwise.

 */

export async function handleDeletePaperTradeClick(tradeId) {
	if (
		!confirm(
			"Are you sure you want to delete this paper trade? This will remove all associated buy and sell transactions.",
		)
	) {
		return false;
	}

	try {
		await deletePaperTrade(tradeId);

		alert("Paper trade deleted successfully.");

		loadPaperTradesContent(); // Refresh the list

		return true;
	} catch (error) {
		error("Failed to delete paper trade:", error);

		alert("Error deleting paper trade. See console for details.");

		return false;
	}
}
