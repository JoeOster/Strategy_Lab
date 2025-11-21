// public/js/modules/dashboard/api.js

import { api } from "../../services/apiFetch.js";

export async function getOpenRetailTrades() {
	return await api.get("/api/transactions/open-trades/real");
}

export async function getClosedRetailTrades() {
	return await api.get("/api/transactions/closed-trades/real");
}

export async function getOpenRetailTradesCardData() {
	const trades = await getOpenRetailTrades();
	const tradesByTicker = trades.reduce((acc, trade) => {
		if (!acc[trade.ticker]) {
			acc[trade.ticker] = {
				ticker: trade.ticker,
				totalShares: 0,
				totalCost: 0,
				trades: [],
			};
		}
		acc[trade.ticker].totalShares += trade.quantity;
		acc[trade.ticker].totalCost += trade.quantity * trade.price;
		acc[trade.ticker].trades.push(trade);
		return acc;
	}, {});

	return Object.values(tradesByTicker).map((trade) => {
		trade.averageBasis = trade.totalCost / trade.totalShares;
		return trade;
	});
}

export async function getOpenTradesByTicker(ticker) {
	return await api.get(`/api/transactions/open-trades/real/${ticker}`);
}

export async function getSalesByTicker(ticker) {
	return await api.get(`/api/transactions/sales/real/${ticker}`);
}
