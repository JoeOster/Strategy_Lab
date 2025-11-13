// public/js/modules/strategy-lab/index.js

import * as handlers from './handlers.js';
import { initializeStrategyLabSubTabs } from './handlers.js';
// Placeholder imports for sub-module handlers
// import * as sourcesHandlers from './sources/handlers.js';
// import * as watchedListHandlers from './watched-list/handlers.js';
// import * as paperTradesHandlers from './paper-trades/handlers.js';

export function initializeModule() {
  console.log('Strategy Lab Module Initialized');

  // Attach event listener for main sub-tab clicks
  document.querySelectorAll('[data-sub-tab]').forEach((tabElement) => {
    tabElement.addEventListener('click', handlers.handleSubTabClick);
  });

  // Initialize the Strategy Lab sub-tabs
  initializeStrategyLabSubTabs();

  // Initialize sub-modules if they have their own initialization functions
  // if (sourcesHandlers && sourcesHandlers.initialize) sourcesHandlers.initialize();
  // if (watchedListHandlers && watchedListHandlers.initialize) watchedListHandlers.initialize();
  // if (paperTradesHandlers && paperTradesHandlers.initialize) paperTradesHandlers.initialize();
}