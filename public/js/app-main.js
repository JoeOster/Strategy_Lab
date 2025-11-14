import { loadHtmlPartial } from '/js/utils/loadHtmlPartial.js';
import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadAppearanceSettings,
} from './modules/settings/index.js';
import { initializeUserSelector } from './modules/user-selector/index.js';
// --- FIX: Removed the premature import of strategyLab ---

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Strategy Lab App Main script loaded.');

  // Dynamically load modal HTML partials first
  await loadHtmlPartial('/_settings-modal.html', 'app-container');
  await loadHtmlPartial('/_edit-source-modal.html', 'app-container');
  await loadHtmlPartial('/_source-detail-modal.html', 'app-container');
  await loadHtmlPartial('/_add-strategy-modal.html', 'app-container');

  // Then initialize modules that depend on these elements being present
  loadAppearanceSettings();
  initializeNavigation();
  initializeSettingsModule();
  initializeUserSelector();
});
