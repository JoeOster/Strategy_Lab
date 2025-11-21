import { log } from "../../utils/logger.js";
import { deleteTransaction, getAllTransactions } from "./api.js";
import { renderLedgerTable } from "./render.js";

log("Ledger module loaded.");

export async function initializeModule() {
	log("Ledger module initialized");

	const transactions = await getAllTransactions();
	renderLedgerTable(transactions);

	const ledgerContainer = document.getElementById("ledger-table-container");
	if (ledgerContainer) {
		ledgerContainer.addEventListener("click", async (event) => {
			if (event.target?.classList.contains("delete-transaction-btn")) {
				const transactionId = event.target.dataset.id;
				if (transactionId) {
					if (confirm("Are you sure you want to delete this transaction?")) {
						try {
							await deleteTransaction(transactionId);
							const transactions = await getAllTransactions();
							renderLedgerTable(transactions);
						} catch (error) {
							console.error("Failed to delete transaction:", error);
						}
					}
				}
			}
		});
	}
}
