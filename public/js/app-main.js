import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadAppearanceSettings,
} from './modules/settings/index.js';
import { initializeUserSelector } from './modules/user-selector.js';
import * as strategyLab from './modules/strategy-lab/index.js'; // Import the strategy-lab module

document.addEventListener('DOMContentLoaded', () => {
  console.log('Strategy Lab App Main script loaded.');
  loadAppearanceSettings();
  initializeNavigation();
  initializeSettingsModule();
  initializeUserSelector();
  strategyLab.initializeModule(); // Initialize the strategy-lab module
});
