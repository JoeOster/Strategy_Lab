import { getDb } from "./database.js";
import * as finnhub from "./priceServiceV2.js";

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
	const cached = await db.get("SELECT * FROM ticker_data WHERE ticker = ?", cleanTicker);

	let needsPriceUpdate = true;
	let needsProfileUpdate = true;

	if (cached) {
		if (cached.price_updated_at) {
			const priceDate = new Date(cached.price_updated_at);
			const diffMins = (now - priceDate) / 1000 / 60;
			if (diffMins < PRICE_STALE_MINUTES) needsPriceUpdate = false;
		}
		if (cached.profile_updated_at) {
			const profileDate = new Date(cached.profile_updated_at);
			const diffDays = (now - profileDate) / 1000 / 60 / 60 / 24;
			if (diffDays < PROFILE_STALE_DAYS) needsProfileUpdate = false;
		}
	} else {
		await db.run("INSERT OR IGNORE INTO ticker_data (ticker) VALUES (?)", cleanTicker);
	}

	// 2. Update Price
	if (needsPriceUpdate) {
		const quote = await finnhub.getQuote(cleanTicker);
		if (quote) {
			await db.run(`
                UPDATE ticker_data SET 
                current_price = ?, change_amount = ?, change_percent = ?, 
                day_high = ?, day_low = ?, open_price = ?, prev_close = ?, 
                price_updated_at = ?
                WHERE ticker = ?
            `, [quote.c, quote.d, quote.dp, quote.h, quote.l, quote.o, quote.pc, now.toISOString(), cleanTicker]);
		}
	}

	// 3. Update Profile
	if (needsProfileUpdate) {
		const profile = await finnhub.getProfile(cleanTicker);
		if (profile) {
			await db.run(`
                UPDATE ticker_data SET 
                company_name = ?, industry = ?, sector = ?, website = ?, 
                logo_url = ?, market_cap = ?, profile_updated_at = ?
                WHERE ticker = ?
            `, [profile.name, profile.finnhubIndustry, "N/A", profile.weburl, profile.logo, profile.marketCapitalization, now.toISOString(), cleanTicker]);
		}
	}
}

/**
 * Retrieves enriched watched items.
 */
export async function getEnrichedWatchedItems() {
	const db = await getDb();
	const tickers = await db.all("SELECT DISTINCT ticker FROM watched_items WHERE ticker IS NOT NULL");

	// Sync data
	await Promise.all(tickers.map(row => syncTickerData(row.ticker)));

	const sql = `
        SELECT w.*, t.company_name, t.industry, t.logo_url, t.current_price, t.change_amount, t.change_percent, t.day_high, t.day_low, t.prev_close, t.market_cap, t.website, t.sector, t.description
        FROM watched_items w
        LEFT JOIN ticker_data t ON w.ticker = t.ticker
        ORDER BY w.updated_date DESC
    `;
	return db.all(sql);
}