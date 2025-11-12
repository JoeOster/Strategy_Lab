import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadAppearanceSettings,
} from './modules/settings/index.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Strategy Lab App Main script loaded.');
  loadAppearanceSettings();
  initializeNavigation();
  initializeSettingsModule();
});
