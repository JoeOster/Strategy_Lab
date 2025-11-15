// public/js/app-main.js

import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadAppearanceSettings,
} from './modules/settings/index.js';
import { initializeUserSelector } from './modules/user-selector/index.js';
import { loadHtmlPartial } from './utils/loadHtmlPartial.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Strategy Lab App Main script loaded.');

  // Dynamically load modal HTML partials first
  await loadHtmlPartial('/_settings-modal.html', 'app-container');
  // --- START: MODIFICATION ---
  // Renamed _edit-source-modal.html to _source-form-modal.html
  await loadHtmlPartial('/_source-form-modal.html', 'app-container');
  // --- END: MODIFICATION ---
  await loadHtmlPartial('/_source-detail-modal.html', 'app-container');
  await loadHtmlPartial('/_add-strategy-modal.html', 'app-container');
  await loadHtmlPartial('/_sell-trade-modal.html', 'app-container');
  await loadHtmlPartial('/_edit-trade-modal.html', 'app-container');
  await loadHtmlPartial('/_paper-trade-details-modal.html', 'app-container');
  await loadHtmlPartial('/_add-idea-modal.html', 'app-container');

  // Then initialize modules that depend on these elements being present
  loadAppearanceSettings();
  initializeNavigation();
  initializeSettingsModule();
  initializeUserSelector();
});
