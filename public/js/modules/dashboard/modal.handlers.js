// public/js/modules/dashboard/modal.handlers.js

import { error, log } from "../../utils/logger.js";
import { getOpenTradesByTicker, getSalesByTicker } from "./api.js";
import { renderOpenOrdersTable, renderSalesTable } from "./modal.render.js";

export function initializeTickerModal() {
	const modal = document.getElementById("open-ticker-modal");
	if (modal) {
		const closeButton = modal.querySelector(".close-button");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				// @ts-ignore
				modal.style.display = "none";
			});
		}
	}
}

export async function openTickerModal(ticker) {
	const modal = document.getElementById("open-ticker-modal");
	if (modal) {
		const modalTitle = modal.querySelector(".modal-title");
		if (modalTitle) {
			modalTitle.textContent = `Ticker Details: ${ticker}`;
		}

		try {
			const [openOrders, sales] = await Promise.all([
				getOpenTradesByTicker(ticker),
				getSalesByTicker(ticker),
			]);

			renderOpenOrdersTable(openOrders);
			renderSalesTable(sales);

			// @ts-ignore
			modal.style.display = "block";
		} catch (err) {
			error(`Failed to load ticker details for ${ticker}:`, err);
		}
	}
}
