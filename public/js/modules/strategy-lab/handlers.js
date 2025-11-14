// public/js/modules/strategy-lab/handlers.js

import { getPaperTrades } from './paper-trades/api.js';
import { renderPaperTrades } from './paper-trades/render.js';
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
import { getWatchedList } from './watched-list/api.js';
import { renderWatchedList } from './watched-list/render.js';

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
  // --- FIX: Cast event.target to Element ---
  if (!(event.target instanceof Element)) {
    return;
  }
  const clickedTabButton = event.target.closest('.sub-nav-btn');
  // --- END FIX ---

  if (!clickedTabButton) {
    return;
  }
  event.stopPropagation();

  // @ts-ignore
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

/**
 * Handles a click on a source card.
 * @param {Event} event - The click event.
 */
export function handleSourceCardClick(event) {
  // --- FIX: Cast event.target to Element ---
  if (!(event.target instanceof Element)) {
    return;
  }
  const card = event.target.closest('.source-card');
  // --- END FIX ---
  if (!card) return;

  // @ts-ignore
  const sourceId = card.dataset.sourceId;
  if (!sourceId) {
    console.error('Source card is missing a data-source-id attribute.');
    return;
  }

  // Use optional chaining for null safety
  gridView()?.style.setProperty('display', 'none');
  detailView()?.style.setProperty('display', 'block');

  loadSourceDetail(sourceId);
}

/**
 * Handles a click on the "Back to List" button in the detail view.
 */
export function handleCloseSourceDetail() {
  // Use optional chaining for null safety
  detailView()?.style.setProperty('display', 'none');
  gridView()?.style.setProperty('display', 'block');

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
    detailView()?.style.setProperty('display', 'none');
    gridView()?.style.setProperty('display', 'block');
  } catch (err) {
    console.error('Failed to load sources:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderSourceCards(null, error);
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
    // @ts-ignore (This will be fixed when the function is defined)
    await loadStrategiesForSource(sourceId);
  } catch (error) {
    console.error(`Failed to load source detail for ${sourceId}:`, error);
    // Fix: Remove optional chaining from left-hand side
    const dv = detailView();
    if (dv) {
      dv.innerHTML =
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
    // Cast form to HTMLFormElement to access reset()
    const form = /** @type {HTMLFormElement | null} */ (
      document.getElementById('log-strategy-form')
    );
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

  // Add type guard for form
  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  const form = event.target;

  const formData = new FormData(form);
  const strategyData = Object.fromEntries(formData.entries());

  try {
    // @ts-ignore
    await addStrategy(strategyData);
    alert('Strategy saved successfully!'); // Success message
    handleCancelStrategyForm(); // Hide and clear the form

    // Refresh the strategies table
    // @ts-ignore
    await loadStrategiesForSource(String(strategyData.source_id));

    // --- FIX: Added the missing closing brace for the 'try' block ---
  } catch (error) {
    // --- END FIX ---
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

/**
 * Fetches and renders the content for the "Watched List" sub-tab.
 */
async function loadWatchedListContent() {
  console.log('Loading Watched List content...');
  try {
    const watchedList = await getWatchedList();
    renderWatchedList(watchedList);
  } catch (err) {
    console.error('Failed to load watched list:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderWatchedList(null, error);
  }
}

/**
 * Fetches and renders the content for the "Paper Trades" sub-tab.
 */
async function loadPaperTradesContent() {
  console.log('Loading Paper Trades content...');
  try {
    const paperTrades = await getPaperTrades();
    renderPaperTrades(paperTrades);
  } catch (err) {
    console.error('Failed to load paper trades:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderPaperTrades(null, error);
  }
}
