/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */

import { api } from "../../../services/apiFetch.js";

/**
 * Fetches the list of watched items (Ideas, Paper, Real) enriched with market data.
 * @returns {Promise<WatchedItem[]>}
 */
export async function getWatchedList() {
	return api.get("/api/watched-items");
}

export async function deleteIdea(id) {
	return api.delete(`/api/watched-items/${id}`);
}

export async function moveIdeaToPaper(id, ideaData) {
	return api.post(`/api/watched-items/${id}/to-paper`, ideaData);
}

export async function getIdeaForPrefill(id) {
	return api.get(`/api/watched-items/${id}`);
}

export async function addIdea(ideaData) {
	return api.post("/api/watched-items/ideas", ideaData);
}

export async function updateIdea(ideaId, ideaData) {
	return api.put(`/api/watched-items/${ideaId}`, ideaData);
}

export async function moveIdeaToRealTrade(id, ideaData) {
	return api.post(`/api/watched-items/${id}/to-real`, ideaData);
}