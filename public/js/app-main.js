import { initializeNavigation } from './modules/navigation/index.js';
import {
  initializeSettingsModule,
  loadUserPreferences,
} from './modules/settings/index.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Strategy Lab App Main script loaded.');
  loadUserPreferences();
  initializeNavigation();
  initializeSettingsModule();
});
