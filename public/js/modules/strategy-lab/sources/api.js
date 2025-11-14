// public/js/modules/strategy-lab/sources/api.js

// Re-use the existing, working API call from the 'settings' module.
import { getSources as getAllSources } from '../../../settings/sources.api.js';
import { api } from '../../../../utils/apiFetch.js';

// --- MOCK DATA ---
// In a real application, this data would come from a database.
const mockSources = [
  { id: 1, name: 'Market Wizards', type: 'book', author: 'Jack D. Schwager', url: 'https://www.amazon.com/Market-Wizards-Interviews-Top-Traders/dp/1118273052' },
  { id: 2, name: 'The Rational Speculator', type: 'person', contact: 'John Doe', expertise: 'Equities' },
  { id: 3, name: 'Crypto Insights', type: 'group', members: 'Jane Smith, Bob Johnson', platform: 'Telegram' },
  { id: 4, name: 'Investopedia', type: 'website', url: 'https://www.investopedia.com/' },
];

const mockStrategies = {
  1: [ // Strategies for "Market Wizards" (id: 1)
    { id: 101, source_id: 1, title: 'Trend Following', chapter: '3', page: '45', description: 'Follow the long-term trend.' },
    { id: 102, source_id: 1, title: 'Global Macro', chapter: '5', page: '82', description: 'Bet on macroeconomic events.' },
  ],
  4: [ // Strategies for "Investopedia" (id: 4)
    { id: 401, source_id: 4, title: 'Value Investing', article: 'https://www.investopedia.com/terms/v/valueinvesting.asp', description: 'Buy undervalued stocks.' },
  ],
};
// --- END MOCK DATA ---


/**
 * Fetches all advice sources.
 * This function now acts as a pass-through to the real API call in the settings module.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of source objects.
 */
export async function getSources() {
  console.log('Strategy Lab API: Fetching all sources via settings API...');
  // For V2, we just use the main sources API.
  // In V3, this might have its own endpoint with more strategy-specific data.
  return getAllSources();
}

/**
 * Fetches a single advice source by its ID.
 * This is a mock function for now.
 * @param {string|number} id The ID of the source.
 * @returns {Promise<object>} A promise that resolves to a single source object.
 */
export async function getSource(id) {
  console.log(`Strategy Lab API: Fetching source with id ${id} (mock)...`);
  const sourceId = parseInt(id, 10);
  const source = mockSources.find(s => s.id === sourceId);

  if (source) {
    return Promise.resolve(source);
  } else {
    return Promise.reject(new Error(`Source with id ${id} not found.`));
  }
}

/**
 * Fetches all strategies associated with a given source ID.
 * This is a mock function for now.
 * @param {string|number} sourceId The ID of the source.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of strategy objects.
 */
export async function getStrategiesForSource(sourceId) {
  console.log(`Strategy Lab API: Fetching strategies for source ${sourceId} (mock)...`);
  const strategies = mockStrategies[sourceId] || [];
  return Promise.resolve(strategies);
}

/**
 * Adds a new strategy to a source.
 * This is a mock function for now.
 * @param {object} strategyData The data for the new strategy.
 * @returns {Promise<object>} A promise that resolves to the newly added strategy.
 */
export async function addStrategy(strategyData) {
  console.log('Strategy Lab API: Adding new strategy (mock)...', strategyData);
  const sourceId = parseInt(strategyData.source_id, 10);

  if (!mockStrategies[sourceId]) {
    mockStrategies[sourceId] = [];
  }

  const newStrategy = {
    id: Date.now(), // Use timestamp for a unique ID in mock environment
    ...strategyData,
  };

  mockStrategies[sourceId].push(newStrategy);
  console.log('Current strategies for source:', mockStrategies[sourceId]);

  return Promise.resolve(newStrategy);
}
