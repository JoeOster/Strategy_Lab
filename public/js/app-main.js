// public/js/app-main.js

import { initializeNavigation } from './modules/navigation/index.js';
// --- START: FIX ---
// Import directly from the handler file to avoid breaking the app
import { applyInitialAppearance } from './modules/settings/appearance.handlers.js';
import {
  renderClosedTrades,
  renderPaperTrades,
} from './modules/strategy-lab/paper-trades/new-render.js'; // Import the new render functions
// --- END: FIX ---
import { initializeUserSelector } from './modules/user-selector/index.js';
import { loadHtmlPartial } from './utils/loadHtmlPartial.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Strategy Lab App Main script loaded.');

  // Dynamically load modal HTML partials first
  await loadHtmlPartial('/_source-form-modal.html', 'app-container');
  await loadHtmlPartial('/_source-detail-modal.html', 'app-container');
  await loadHtmlPartial('/_add-strategy-modal.html', 'app-container');
  await loadHtmlPartial('/_sell-trade-modal.html', 'app-container');
  await loadHtmlPartial('/_edit-trade-modal.html', 'app-container');
  await loadHtmlPartial('/_paper-trade-details-modal.html', 'app-container');
  await loadHtmlPartial('/_add-idea-modal.html', 'app-container');
  await loadHtmlPartial('/_edit-strategy-modal.html', 'app-container');

  // Then initialize modules that depend on these elements being present
  // --- START: FIX ---
  // This will now run correctly, applying themes
  applyInitialAppearance();
  // This will now run correctly, fixing the broken tabs
  initializeNavigation();
  // --- END: FIX ---
  initializeUserSelector();
  // initializeStrategyLab(); // This is called by the navigation module when the tab is loaded.

  // Render dummy paper trades to the new placeholder div
  const dummyPaperTrades = [
    {
      id: 1,
      ticker: 'DUMMY1',
      quantity: 10,
      entry_date: '2023-01-01T10:00:00Z',
      entry_price: 100.0,
      current_price: 105.0,
      pnl: 50.0,
      return_pct: 5.0,
    },
    {
      id: 2,
      ticker: 'DUMMY2',
      quantity: 5,
      entry_date: '2023-02-15T11:30:00Z',
      entry_price: 200.0,
      current_price: 190.0,
      pnl: -50.0,
      return_pct: -5.0,
    },
  ];

  const newPaperTradesContainer = document.getElementById(
    'new-paper-trades-table'
  );
  if (newPaperTradesContainer) {
    renderPaperTrades(dummyPaperTrades, newPaperTradesContainer);
  }

  // Render dummy closed trades to the new placeholder div
  const dummyClosedTrades = [
    {
      id: 3,
      ticker: 'DUMMY3',
      quantity: 20,
      entry_date: '2022-05-20T09:00:00Z',
      entry_price: 50.0,
      current_price: 60.0, // This might not be used for closed trades, but keeping for consistency
      pnl: 200.0,
      return_pct: 20.0,
    },
    {
      id: 4,
      ticker: 'DUMMY4',
      quantity: 10,
      entry_date: '2022-10-01T14:00:00Z',
      entry_price: 150.0,
      current_price: 140.0, // This might not be used for closed trades, but keeping for consistency
      pnl: -100.0,
      return_pct: -6.67,
    },
  ];

  const newClosedTradesContainer = document.getElementById(
    'new-closed-trades-table'
  );
  if (newClosedTradesContainer) {
    renderClosedTrades(dummyClosedTrades, newClosedTradesContainer);
  }

  // Render dummy closed paper trades to the new placeholder div
  const dummyClosedPaperTrades = [
    {
      id: 5,
      ticker: 'DUMMY5',
      quantity: 15,
      entry_date: '2023-03-10T10:00:00Z',
      entry_price: 75.0,
      current_price: 80.0,
      pnl: 75.0,
      return_pct: 6.67,
    },
    {
      id: 6,
      ticker: 'DUMMY6',
      quantity: 8,
      entry_date: '2023-04-20T11:30:00Z',
      entry_price: 120.0,
      current_price: 110.0,
      pnl: -80.0,
      return_pct: -8.33,
    },
  ];

  const newClosedPaperTradesContainer = document.getElementById(
    'new-paper-trades-closed-table'
  );
  if (newClosedPaperTradesContainer) {
    renderClosedTrades(
      dummyClosedPaperTrades,
      newClosedPaperTradesContainer,
      null,
      true
    );
  }
});
