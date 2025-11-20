import { api } from "../../services/apiFetch.js";
import { log } from "../../utils/logger.js";

log("Orders module loaded.");

export function initializeOrders() {
	log("Orders module initialized");

	const openTradeModalBtn = document.getElementById("open-trade-modal-btn");
	if (openTradeModalBtn) {
		openTradeModalBtn.addEventListener("click", () => {
			const orderTypeSelect = document.getElementById("order-type-select");
			// @ts-ignore
			const selectedValue = orderTypeSelect.value;

			if (selectedValue === "real") {
				const realTradeModal = document.getElementById("real-trade-modal");
				if (realTradeModal) {
					// @ts-ignore
					realTradeModal.style.display = "block";
				}
			} else if (selectedValue === "paper") {
				const paperTradeModal = document.getElementById("paper-trade-modal");
				if (paperTradeModal) {
					// @ts-ignore
					paperTradeModal.style.display = "block";
				}
			}
		});
	}

	const realTradeModal = document.getElementById("real-trade-modal");
	if (realTradeModal) {
		const closeButton = realTradeModal.querySelector(".close-button");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				// @ts-ignore
				realTradeModal.style.display = "none";
			});
		}

		const cancelBtn = document.getElementById("cancel-real-trade-form-btn");
		if (cancelBtn) {
			cancelBtn.addEventListener("click", () => {
				// @ts-ignore
				realTradeModal.style.display = "none";
			});
		}

		const realTradeForm = document.getElementById("real-trade-form");
		if (realTradeForm) {
			realTradeForm.addEventListener("submit", async (event) => {
				event.preventDefault();
				const formData = new FormData(realTradeForm);
				const tradeData = Object.fromEntries(formData.entries());
				try {
					await api.post("/api/transactions", tradeData);
					// @ts-ignore
					realTradeModal.style.display = "none";
					// Optionally, you can add a success message or refresh the trades list
				} catch (error) {
					console.error("Failed to save real trade:", error);
					// Optionally, you can show an error message to the user
				}
			});
		}
	}

	const paperTradeModal = document.getElementById("paper-trade-modal");
	if (paperTradeModal) {
		const closeButton = paperTradeModal.querySelector(".close-button");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				// @ts-ignore
				paperTradeModal.style.display = "none";
			});
		}

		const cancelBtn = document.getElementById("cancel-paper-trade-form-btn");
		if (cancelBtn) {
			cancelBtn.addEventListener("click", () => {
				// @ts-ignore
				paperTradeModal.style.display = "none";
			});
		}

		const paperTradeForm = document.getElementById("paper-trade-form");
		if (paperTradeForm) {
			paperTradeForm.addEventListener("submit", async (event) => {
				event.preventDefault();
				const formData = new FormData(paperTradeForm);
				const tradeData = Object.fromEntries(formData.entries());
				tradeData.is_paper_trade = true;
				try {
					await api.post("/api/transactions", tradeData);
					// @ts-ignore
					paperTradeModal.style.display = "none";
					// Optionally, you can add a success message or refresh the trades list
				} catch (error) {
					console.error("Failed to save paper trade:", error);
					// Optionally, you can show an error message to the user
				}
			});
		}
	}
}
