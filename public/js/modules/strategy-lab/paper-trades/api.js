// public/js/modules/strategy-lab/paper-trades/api.js

//import { apiFetch } from '../../utils/apiFetch.js';

/**
 * Fetches the list of paper trades.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of paper trades.
 */
export async function getPaperTrades() {
  // For now, this returns mock data.
  // Replace with a real API call when the endpoint is ready.
  console.log('Fetching paper trades from mock API...');
  return Promise.resolve([
    { id: 1, symbol: 'SOL', entryPrice: 150, exitPrice: 175, quantity: 10, profit: 250, date: '2025-11-10' },
    { id: 2, symbol: 'DOT', entryPrice: 30, exitPrice: 25, quantity: 100, profit: -500, date: '2025-11-11' },
    { id: 3, symbol: 'LINK', entryPrice: 35, exitPrice: 40, quantity: 50, profit: 250, date: '2025-11-12' },
  ]);
}
