/**
 * @file Client-side API wrappers for interacting with the backend.
 */

/** @typedef {import('./types.js').WatchedItem} WatchedItem */

/**
 * Creates a new watched item (trade idea) by sending a POST request to the server.
 * @param {Partial<WatchedItem>} ideaData The data for the new idea.
 * @returns {Promise<WatchedItem>} The newly created watched item from the server.
 */
export async function createWatchedItem(ideaData) {
	const response = await fetch("/api/watched-items/ideas", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(ideaData),
	});

	if (!response.ok) {
		let errorDetails = "An unknown error occurred";
		try {
			const errorData = await response.json();
			errorDetails =
				errorData.details || errorData.error || response.statusText;
		} catch (e) {
			errorDetails = response.statusText;
		}
		throw new Error(`Failed to create watched item: ${errorDetails}`);
	}

	return response.json();
}

/**
 * Fetches a single watched item by its ID.
 * @param {string | number} id The ID of the item to fetch.
 * @returns {Promise<WatchedItem>} The watched item data.
 */
export async function getWatchedItem(id) {
	const response = await fetch(`/api/watched-items/${id}`, {
		cache: "no-cache",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Failed to fetch watched item: ${errorData.details || "Not Found"}`,
		);
	}

	return response.json();
}

/**
 * Updates an existing watched item on the server.
 * @param {number} id The ID of the item to update.
 * @param {Partial<WatchedItem>} ideaData The data to update.
 * @returns {Promise<WatchedItem>} The updated watched item.
 */
export async function updateWatchedItem(id, ideaData) {
	const response = await fetch(`/api/watched-items/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(ideaData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Failed to update watched item: ${
				errorData.details || response.statusText
			}`,
		);
	}

	return response.json();
}

/**
 * Deletes a watched item from the server.
 * @param {number} id The ID of the item to delete.
 * @returns {Promise<void>}
 */
export async function deleteWatchedItem(id) {
	const response = await fetch(`/api/watched-items/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Failed to delete watched item: ${errorData.details || "Not Found"}`,
		);
	}
}

/**
 * Fetches all current trade ideas (watched items).
 * The backend enriches these items with the latest price.
 * @returns {Promise<WatchedItem[]>} A list of trade ideas.
 */
export async function getTradeIdeas() {
	const response = await fetch("/api/watched-items/ideas", {
		cache: "no-cache",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch trade ideas");
	}

	return response.json();
}

/**
 * Converts a watched item (idea) into a real trade by creating a transaction.
 * @param {string | number} ideaId The ID of the idea to convert.
 * @param {object} tradeData The data for the new transaction (e.g., quantity, price).
 * @returns {Promise<any>}
 */
export async function moveIdeaToRealTrade(ideaId, tradeData) {
	const response = await fetch(`/api/watched-items/${ideaId}/to-real`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(tradeData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Failed to move idea to real trade: ${
				errorData.details || response.statusText
			}`,
		);
	}

	return response.json();
}

/**
 * Converts a watched item (idea) into a paper trade by creating a transaction.
 * @param {string | number} ideaId The ID of the idea to convert.
 * @param {object} tradeData The data for the new transaction (e.g., quantity, price).
 * @returns {Promise<any>}
 */
export async function moveIdeaToPaperTrade(ideaId, tradeData) {
	const response = await fetch(`/api/watched-items/${ideaId}/to-paper`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(tradeData),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(
			`Failed to move idea to paper trade: ${
				errorData.details || response.statusText
			}`,
		);
	}

	return response.json();
}
