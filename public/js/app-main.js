import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadAppearanceSettings,
} from './modules/settings/index.js';
import { initializeUserSelector } from './modules/user-selector.js'; // Import the new module

document.addEventListener('DOMContentLoaded', () => {
  console.log('Strategy Lab App Main script loaded.');
  loadAppearanceSettings();
  initializeNavigation();
  initializeSettingsModule();
  initializeUserSelector(); // Initialize the user selector
});
