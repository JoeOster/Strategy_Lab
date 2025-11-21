// public/js/modules/ledger/api.js

import { api } from "../../services/apiFetch.js";

export async function getAllTransactions() {
	return await api.get("/api/transactions");
}

export async function deleteTransaction(transactionId) {
	return await api.delete(`/api/transactions/${transactionId}`);
}
