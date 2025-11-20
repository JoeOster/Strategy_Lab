import { getDb } from "./database.js";
import * as finnhub from "./priceServiceV2.js";

/**
 * @typedef {Object} FinnhubQuote
 * @property {number} c - Current price
 * @property {number} d - Change
 * @property {number} dp - Percent change
 * @property {number} h - High price of the day
 * @property {number} l - Low price of the day
 * @property {number} o - Open price of the day
 * @property {number} pc - Previous close price
 */

/**
 * @typedef {Object} FinnhubProfile
 * @property {string} name
 * @property {string} finnhubIndustry
 * @property {string} weburl
 * @property {string} logo
 * @property {number} marketCapitalization
 */

const PRICE_STALE_MINUTES = 5;
const PROFILE_STALE_DAYS = 30;

/**
 * Ensures that the DB has up-to-date data for a ticker.
 * @param {string} ticker
 */
export async function syncTickerData(ticker) {
	if (!ticker) return;
	const cleanTicker = ticker.toUpperCase();
	const db = await getDb();
	const now = new Date();

	// 1. Get current cache state
	const cached = await db.get(
		"SELECT * FROM ticker_data WHERE ticker = ?",
		cleanTicker,
	);

	let needsPriceUpdate = true;
	let needsProfileUpdate = true;
	let currentHistory = [];

	if (cached) {
		if (cached.price_history) {
			try {
				currentHistory = JSON.parse(cached.price_history);
				if (!Array.isArray(currentHistory)) currentHistory = [];
			} catch (e) {
				currentHistory = [];
			}
		}

		if (cached.price_updated_at) {
			const priceDate = new Date(cached.price_updated_at);
			// Use .getTime() for arithmetic
			const diffMins = (now.getTime() - priceDate.getTime()) / 1000 / 60;
			if (diffMins < PRICE_STALE_MINUTES) needsPriceUpdate = false;
		}
		if (cached.profile_updated_at) {
			const profileDate = new Date(cached.profile_updated_at);
			const diffDays =
				(now.getTime() - profileDate.getTime()) / 1000 / 60 / 60 / 24;
			if (diffDays < PROFILE_STALE_DAYS) needsProfileUpdate = false;
		}
	} else {
		await db.run(
			"INSERT OR IGNORE INTO ticker_data (ticker) VALUES (?)",
			cleanTicker,
		);
	}

	// 2. Update Price
	if (needsPriceUpdate) {
		/** @type {FinnhubQuote | null} */
		const quote = await finnhub.getQuote(cleanTicker);
		if (quote) {
			// Logic to record last 6 values
			currentHistory.push(quote.c);
			if (currentHistory.length > 6) {
				currentHistory = currentHistory.slice(-6); // Keep only last 6
			}
			const historyStr = JSON.stringify(currentHistory);

			await db.run(
				`
                UPDATE ticker_data SET 
                current_price = ?, price_history = ?, change_amount = ?, change_percent = ?, 
                day_high = ?, day_low = ?, open_price = ?, prev_close = ?, 
                price_updated_at = ?
                WHERE ticker = ?
            `,
				[
					quote.c,
					historyStr,
					quote.d,
					quote.dp,
					quote.h,
					quote.l,
					quote.o,
					quote.pc,
					now.toISOString(),
					cleanTicker,
				],
			);
		}
	}

	// 3. Update Profile
	if (needsProfileUpdate) {
		/** @type {FinnhubProfile | null} */
		const profile = await finnhub.getProfile(cleanTicker);
		if (profile) {
			await db.run(
				`
                UPDATE ticker_data SET 
                company_name = ?, industry = ?, sector = ?, website = ?, 
                logo_url = ?, market_cap = ?, profile_updated_at = ?
                WHERE ticker = ?
            `,
				[
					profile.name,
					profile.finnhubIndustry,
					"N/A",
					profile.weburl,
					profile.logo,
					profile.marketCapitalization,
					now.toISOString(),
					cleanTicker,
				],
			);
		}
	}
}

/**
 * Retrieves enriched watched items.
 */
export async function getEnrichedWatchedItems() {
	const db = await getDb();
	/** @type {{ticker: string}[]} */
	const tickers = await db.all(
		"SELECT DISTINCT ticker FROM watched_items WHERE ticker IS NOT NULL",
	);

	await Promise.all(tickers.map((row) => syncTickerData(row.ticker)));

	// JOIN ON UPPER(w.ticker) = t.ticker to handle case sensitivity
	// Added 'price_history' to selection
	const sql = `
        SELECT w.*, t.company_name, t.industry, t.logo_url, 
               t.current_price, t.price_history, t.change_amount, t.change_percent, 
               t.day_high, t.day_low, t.open_price, t.prev_close, t.price_updated_at,
               t.market_cap, t.website, t.sector, t.description
        FROM watched_items w
        LEFT JOIN ticker_data t ON UPPER(w.ticker) = t.ticker
        ORDER BY w.updated_date DESC
    `;
	return db.all(sql);
}
