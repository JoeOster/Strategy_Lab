// public/js/modules/strategy-lab/index.js

import { openEditTradeModal } from '../transactions/edit-trade.handlers.js';
import * as handlers from './handlers.js';
// Import the card click handler from the new sources sub-module
import { handleSourceCardClick } from './sources/handlers.js';
import { loadWatchedListContent } from './watched-list/handlers.js';

export function initializeModule() {
  console.log('Strategy Lab Module Initialized');

  const strategyLabContainer = document.getElementById(
    'strategy-lab-page-container'
  );
  if (!strategyLabContainer) {
    console.error(
      'Strategy Lab container not found. Cannot initialize module.'
    );
    return;
  }

  // Attach event listener for main sub-tab clicks
  for (const tabElement of strategyLabContainer.querySelectorAll(
    '.sub-nav-btn'
  )) {
    tabElement.addEventListener('click', handlers.handleSubTabClick);
  }

  // Add delegated listener for source card clicks and sell button clicks
  strategyLabContainer.addEventListener('click', (event) => {
    // --- START: FIX ---
    // Add type guard to ensure event.target is an Element
    if (!(event.target instanceof Element)) {
      return;
    }
    // --- END: FIX ---

    if (event.target.closest('.source-card')) {
      handleSourceCardClick(event);
    } else if (event.target.closest('.real-sell-btn')) {
      const sellButton = event.target.closest('.real-sell-btn');
      const tradeId = sellButton.dataset.id;
      if (tradeId) {
        openEditTradeModal({ tradeId: tradeId, isSell: true });
      }
    }
  });

  // Add listener for idea creation events
  document.addEventListener('ideaAdded', () => {
    // Check if the watched list is the active sub-tab and refresh it
    const watchedListTab = document.querySelector(
      '[data-sub-tab="watched-list"]'
    );
    if (watchedListTab?.classList.contains('active')) {
      loadWatchedListContent();
    }
  });

  // Initialize the Strategy Lab sub-tabs
  handlers.initializeStrategyLabSubTabs();
}
