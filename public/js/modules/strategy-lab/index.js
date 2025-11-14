// public/js/modules/strategy-lab/index.js

import * as handlers from './handlers.js';
import { initializeStrategyLabSubTabs } from './handlers.js';

export function initializeModule() {
  console.log('Strategy Lab Module Initialized');

  // **FIX:** Scope all queries to the newly loaded page container
  const strategyLabContainer = document.getElementById(
    'strategy-lab-page-container'
  );
  if (!strategyLabContainer) {
    console.error(
      'Strategy Lab container not found. Cannot initialize module.'
    );
    return;
  }

  // Attach event listener for main sub-tab clicks *within this container*
  for (const tabElement of strategyLabContainer.querySelectorAll(
    '.sub-nav-btn'
  )) {
    tabElement.addEventListener('click', handlers.handleSubTabClick);
  }

  // **NEW:** Add delegated listener for source card clicks
  strategyLabContainer.addEventListener('click', (event) => {
    if (event.target.closest('.source-card')) {
      handlers.handleSourceCardClick(event);
    }
    // Note: The 'close-source-detail-btn' click is handled in handlers.js
    // because the button doesn't exist until loadSourceDetail is called.
  });

  // Initialize the Strategy Lab sub-tabs
  initializeStrategyLabSubTabs();
}