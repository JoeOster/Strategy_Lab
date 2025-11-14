import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadAppearanceSettings,
} from './modules/settings/index.js';
import { initializeUserSelector } from './modules/user-selector/index.js';
// --- FIX: Removed the premature import of strategyLab ---

document.addEventListener('DOMContentLoaded', () => {
  console.log('Strategy Lab App Main script loaded.');
  loadAppearanceSettings();
  initializeNavigation();
  initializeSettingsModule();
  initializeUserSelector();
});
