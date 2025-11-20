import fetch from "node-fetch";

const API_KEY = process.env.FINNHUB_API_KEY;

/**
 * Fetches the current price quote for a given stock ticker.
 * @param {string} ticker 
 * @returns {Promise<object|null>} The quote object {c, d, dp, h, l, o, pc} or null.
 */
export async function getQuote(ticker) {
	if (!API_KEY) {
		console.error("FINNHUB_API_KEY is not set.");
		return null;
	}

	try {
		const url = `https://finnhub.io/api/v1/quote?symbol=${ticker.toUpperCase()}&token=${API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Finnhub status ${response.status} for ${ticker}`);
			return null;
		}

		const data = await response.json();
		return (data && typeof data.c === "number") ? data : null;
	} catch (error) {
		console.error(`Error fetching quote for ${ticker}:`, error);
		return null;
	}
}

/**
 * Fetches static company profile data.
 * @param {string} ticker 
 * @returns {Promise<object|null>} The profile object or null.
 */
export async function getProfile(ticker) {
	if (!API_KEY) return null;

	try {
		const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker.toUpperCase()}&token=${API_KEY}`;
		const response = await fetch(url);

		if (!response.ok) return null;

		const data = await response.json();
		return Object.keys(data).length > 0 ? data : null;
	} catch (error) {
		console.error(`Error fetching profile for ${ticker}:`, error);
		return null;
	}
}

// Backward compatibility wrapper to ensure existing app keeps working
export async function getPriceV2(ticker) {
	const q = await getQuote(ticker);
	return q ? q.c : null;
}