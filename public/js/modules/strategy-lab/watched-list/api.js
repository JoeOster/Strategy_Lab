// public/js/modules/strategy-lab/watched-list/api.js

import { apiFetch } from '../../../utils/apiFetch.js';

/**
 * Fetches the list of watched items.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of watched items.
 */
export async function getWatchedList() {
  // For now, this returns mock data.
  // Replace with a real API call when the endpoint is ready.
  console.log('Fetching watched list from mock API...');
  return Promise.resolve([
    { id: 1, symbol: 'BTC', entryPrice: 50000, targetPrice: 55000, notes: 'Watching for a breakout' },
    { id: 2, symbol: 'ETH', entryPrice: 4000, targetPrice: 4500, notes: 'Possible dip buy' },
    { id: 3, symbol: 'ADA', entryPrice: 2.5, targetPrice: 3.0, notes: 'Staking rewards are high' },
  ]);
}
