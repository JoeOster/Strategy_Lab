// public/js/modules/strategy-lab/handlers.js

import {
  addStrategy,
  getSource,
  getSources,
  getStrategiesForSource,
} from './sources/api.js';
import {
  renderSourceCards,
  renderSourceDetail,
  renderStrategiesTable,
} from './sources/render.js';
// Placeholder imports for future sub-modules
// import { getWatchedList } from './watched-list/api.js';
// import { renderWatchedList } from './watched-list/render.js';
// import { getPaperTrades } from './paper-trades/api.js';
// import { renderPaperTrades } from './paper-trades/render.js';

const gridView = () => document.getElementById('source-cards-grid');
const detailView = () => document.getElementById('source-detail-container');

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
  const clickedTabButton = event.target.closest('.sub-nav-btn');
  if (!clickedTabButton) {
    return;
  }
  event.stopPropagation();

  const targetPanelId = clickedTabButton.dataset.subTab;
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

  // Activate the clicked tab button and its corresponding panel
  const targetPanel = document.getElementById(targetPanelId); // Assuming ID is unique globally
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
        console.warn(`No content loading function for sub-panel: ${targetPanelId}`);
    }
  } else {
    console.error(`Sub-panel with ID '${targetPanelId}' not found.`);
  }
}

/**
 * Handles a click on a source card.
 * @param {Event} event - The click event.
 */
export function handleSourceCardClick(event) {
  const card = event.target.closest('.source-card');
  if (!card) return;

  const sourceId = card.dataset.sourceId;
  if (!sourceId) {
    console.error('Source card is missing a data-source-id attribute.');
    return;
  }

  // Hide the grid and show the detail container
  if (gridView()) gridView().style.display = 'none';
  if (detailView()) detailView().style.display = 'block';

  loadSourceDetail(sourceId);
}

/**
 * Handles a click on the "Back to List" button in the detail view.
 */
export function handleCloseSourceDetail() {
  // Hide the detail view and show the grid
  if (detailView()) detailView().style.display = 'none';
  if (gridView()) gridView().style.display = 'block';
  // Optionally, re-load the sources list
  loadSourcesContent();
}

/**
 * Fetches and renders the content for the "Sources" sub-tab (the grid).
 */
async function loadSourcesContent() {
  console.log('Loading Sources content...');
  try {
    const sources = await getSources();
    renderSourceCards(sources);
    // Ensure the correct view is visible
    if (detailView()) detailView().style.display = 'none';
    if (gridView()) gridView().style.display = 'block';
  } catch (error) {
    console.error('Failed to load sources:', error);
    if (gridView()) {
      gridView().innerHTML =
        '<p class="error">Failed to load advice sources. Please try again.</p>';
    }
  }
}

/**
 * Fetches and renders the detailed view for a single source.
 * @param {string} sourceId - The ID of the source to load.
 */
async function loadSourceDetail(sourceId) {
  console.log(`Loading details for source ${sourceId}...`);
  try {
    const source = await getSource(sourceId);
    renderSourceDetail(source);

    // Attach listeners for the dynamically rendered buttons
    document
      .getElementById('close-source-detail-btn')
      ?.addEventListener('click', handleCloseSourceDetail);

    document
      .getElementById('source-strategy-btn')
      ?.addEventListener('click', handleShowStrategyForm);

    document
      .getElementById('log-strategy-form')
      ?.addEventListener('submit', handleLogStrategySubmit);

    // Load the strategies table for this source
    await loadStrategiesForSource(sourceId);
  } catch (error) {
    console.error(`Failed to load source detail for ${sourceId}:`, error);
    if (detailView()) {
      detailView().innerHTML =
        '<p class="error">Failed to load source details. Please try again.</p>';
    }
  }
}

/**
 * Shows the "Log New Strategy" form.
 */
function handleShowStrategyForm() {
  const formContainer = document.getElementById('log-strategy-form-container');
  if (formContainer) {
    formContainer.style.display = 'block';
    // Attach listener for the new "Cancel" button
    document
      .getElementById('cancel-strategy-form-btn')
      ?.addEventListener('click', handleCancelStrategyForm);
  }
}

/**
 * Hides the "Log New Strategy" form.
 */
function handleCancelStrategyForm() {
  const formContainer = document.getElementById('log-strategy-form-container');
  if (formContainer) {
    formContainer.style.display = 'none';
    // Optionally reset the form
    const form = document.getElementById('log-strategy-form');
    if (form) form.reset();
  }
}

/**
 * Handles the submission of the "Log New Strategy" form.
 * @param {Event} event - The form submission event.
 */
async function handleLogStrategySubmit(event) {
  event.preventDefault(); // This STOPS the page from reloading
  console.log('Strategy form submitted.');

  const form = event.target;
  const formData = new FormData(form);
  const strategyData = Object.fromEntries(formData.entries());

  try {
    await addStrategy(strategyData);
    alert('Strategy saved successfully!'); // Success message
    handleCancelStrategyForm(); // Hide and clear the form

    // Refresh the strategies table
    await loadStrategiesForSource(strategyData.source_id);
  } catch (error) {
    console.error('Failed to save strategy:', error);
    alert('Error: Could not save strategy. Please check the console.');
  }
}

/**
 * Fetches and renders the strategies table for a given source.
 * @param {string|number} sourceId - The ID of the source.
 */
async function loadStrategiesForSource(sourceId) {
  console.log(`Loading strategies for source ${sourceId}...`);
  try {
    const strategies = await getStrategiesForSource(sourceId);
    renderStrategiesTable(strategies);
  } catch (error) {
    console.error(`Failed to load strategies for source ${sourceId}:`, error);
    const container = document.getElementById('strategy-table');
    if (container) {
      container.innerHTML = '<p class="error">Failed to load strategies.</p>';
    }
  }
}

// --- PLACEHOLDER FUNCTIONS ---
function loadWatchedListContent() {
  console.log('Loading Watched List content...');
  const container = document.getElementById('watched-list-table');
  if (container) {
    container.innerHTML = '<p>Watched List content will load here.</p>';
  }
}

function loadPaperTradesContent() {
  console.log('Loading Paper Trades content...');
  const container = document.getElementById('paper-trades-table');
  if (container) {
    container.innerHTML = '<p>Paper Trades content will load here.</p>';
  }
}