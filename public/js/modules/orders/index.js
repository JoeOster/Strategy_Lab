import { api } from "../../services/apiFetch.js";
import { log } from "../../utils/logger.js";

log("Orders module loaded.");

export function initializeModule() {
	log("Orders module initialized");

	const openTradeModalBtn = document.getElementById("open-trade-modal-btn");
	if (openTradeModalBtn) {
		openTradeModalBtn.addEventListener("click", () => {
			const orderTypeSelect = document.getElementById("order-type-select");
			// @ts-ignore
			const selectedValue = orderTypeSelect.value;
			const tradeEntryModal = document.getElementById("trade-entry-modal");
			if (tradeEntryModal) {
				const isPaperTradeInput = document.getElementById("is-paper-trade");
				if (isPaperTradeInput) {
					// @ts-ignore
					isPaperTradeInput.value = selectedValue === "paper" ? "1" : "0";
				}
				// @ts-ignore
				tradeEntryModal.style.display = "block";
			}
		});
	}

	const tradeEntryModal = document.getElementById("trade-entry-modal");
	if (tradeEntryModal) {
		const closeButton = tradeEntryModal.querySelector(".close-button");
		if (closeButton) {
			closeButton.addEventListener("click", () => {
				// @ts-ignore
				tradeEntryModal.style.display = "none";
			});
		}

		const cancelBtn = document.getElementById("cancel-trade-form-btn");
		if (cancelBtn) {
			cancelBtn.addEventListener("click", () => {
				// @ts-ignore
				tradeEntryModal.style.display = "none";
			});
		}

		const tradeEntryForm = document.getElementById("trade-entry-form");
		if (tradeEntryForm) {
			tradeEntryForm.addEventListener("submit", async (event) => {
				event.preventDefault();
				const formData = new FormData(tradeEntryForm);
				const tradeData = Object.fromEntries(formData.entries());
				try {
					await api.post("/api/transactions", tradeData);
					// @ts-ignore
					tradeEntryModal.style.display = "none";
					// Optionally, you can add a success message or refresh the trades list
				} catch (error) {
					console.error("Failed to save trade:", error);
					// Optionally, you can show an error message to the user
				}
			});
		}
	}
}
