// public/js/app-main.js

import { initializeNavigation } from './modules/navigation/index.js';
// --- START: FIX ---
// Import directly from the handler file to avoid breaking the app
import { applyInitialAppearance } from './modules/settings/appearance.handlers.js';
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

  // Then initialize modules that depend on these elements being present
  // --- START: FIX ---
  // This will now run correctly, applying themes
  applyInitialAppearance();
  // This will now run correctly, fixing the broken tabs
  initializeNavigation();
  // --- END: FIX ---
  initializeUserSelector();
});