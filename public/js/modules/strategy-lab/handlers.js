// public/js/modules/strategy-lab/handlers.js

import { loadPaperTradesContent } from './paper-trades/handlers.js';
// Import the content loaders for each sub-tab
import { loadSourcesContent } from './sources/handlers.js';
import { loadWatchedListContent } from './watched-list/handlers.js';

/**
 * Initializes the sub-tabs within the Strategy Lab module.
 * Sets the default sub-tab ('sources-panel') and its panel to active.
 */
export function initializeStrategyLabSubTabs() {
  const strategyLabContainer = document.getElementById(
    'strategy-lab-page-container'
  );
  if (!strategyLabContainer) {
    console.error('Strategy Lab container not found.');
    return;
  }

  // Deactivate all sub-tab buttons and content panels
  for (const btn of strategyLabContainer.querySelectorAll('.sub-nav-btn')) {
    btn.classList.remove('active');
  }
  for (const content of strategyLabContainer.querySelectorAll(
    '.sub-tab-content'
  )) {
    content.classList.remove('active');
  }

  // Activate the default sub-tab ('sources-panel')
  const defaultTabButton = strategyLabContainer.querySelector(
    '[data-sub-tab="sources-panel"]'
  );
  const defaultTabContent = document.getElementById('sources-panel'); // Assuming ID is unique globally

  if (defaultTabButton) {
    defaultTabButton.classList.add('active');
  }
  if (defaultTabContent) {
    defaultTabContent.classList.add('active');
    // Call initial content load for the default tab
    loadSourcesContent();
  }
}

/**
 * Handles clicks on the Strategy Lab L2 sub-tabs (Sources, Watched List, Paper Trades).
 * Deactivates all sub-panels in its section and activates the correct one.
 * @param {Event} event - The click event.
 */
export function handleSubTabClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }
  const clickedTabButton = event.target.closest('.sub-nav-btn');

  if (!clickedTabButton) {
    return;
  }
  event.stopPropagation();

  const targetPanelId = /** @type {HTMLElement} */ (clickedTabButton).dataset
    .subTab;
  const strategyLabContainer = clickedTabButton.closest(
    '#strategy-lab-page-container'
  );

  if (!strategyLabContainer) {
    console.error('Could not find parent Strategy Lab container.');
    return;
  }

  // Deactivate all sub-tab buttons and content panels within this section
  for (const btn of strategyLabContainer.querySelectorAll('.sub-nav-btn')) {
    btn.classList.remove('active');
  }
  for (const content of strategyLabContainer.querySelectorAll(
    '.sub-tab-content'
  )) {
    content.classList.remove('active');
  }

  clickedTabButton.classList.add('active');

  // Activate the corresponding panel
  const targetPanel = document.getElementById(String(targetPanelId)); // Assuming ID is unique globally
  if (targetPanel) {
    targetPanel.classList.add('active');
    // Load data for the activated panel
    switch (targetPanelId) {
      case 'sources-panel':
        loadSourcesContent();
        break;
      case 'watched-list-panel':
        loadWatchedListContent();
        break;
      case 'paper-trades-panel':
        loadPaperTradesContent();
        break;
      default:
        console.warn(
          `No content loading function for sub-panel: ${targetPanelId}`
        );
    }
  } else {
    console.error(`Sub-panel with ID '${targetPanelId}' not found.`);
  }
}
