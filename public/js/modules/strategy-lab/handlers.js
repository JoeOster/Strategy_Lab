// public/js/modules/strategy-lab/handlers.js

// --- START: JSDoc Type Imports (Our "Dictionary") ---
/** @typedef {import('../../types.js').Source} Source */
/** @typedef {import('../../types.js').Strategy} Strategy */
/** @typedef {import('../../types.js').WatchedItem} WatchedItem */
// --- END: FIX ---

// --- FIX: Corrected import paths from ../../ to ../ ---
import { getSource, getSources } from '../settings/sources.api.js';
import { openEditSourceModal } from '../settings/sources.handlers.js';
// --- END: FIX ---

import { getPaperTrades } from './paper-trades/api.js';
import { renderPaperTrades } from './paper-trades/render.js';
import { addStrategy, getStrategiesForSource } from './sources/api.js';
import { renderSourceCards, renderStrategiesTable } from './sources/render.js';

// --- START: Import addIdea and getWatchedList ---
import { addIdea, getWatchedList } from './watched-list/api.js';
// --- END: Import addIdea ---

import * as watchedListHandlers from './watched-list/handlers.js';
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
  // --- END: FIX ---

  if (!clickedTabButton) {
    return;
  }
  event.stopPropagation();

  // --- FIX: Cast to HTMLElement to access dataset ---
  const targetPanelId = /** @type {HTMLElement} */ (clickedTabButton).dataset
    .subTab;
  // --- END FIX ---
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

  // --- FIX: Add the .active class back to the clicked button ---
  clickedTabButton.classList.add('active');
  // --- END FIX ---

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

/**
 * Handles a click on a source card.
 * @param {Event} event - The click event.
 */
export function handleSourceCardClick(event) {
  if (!(event.target instanceof Element)) {
    return;
  }
  const card = event.target.closest('.source-card');
  if (!card) return;

  // --- FIX: Cast to HTMLElement to access dataset ---
  const sourceId = /** @type {HTMLElement} */ (card).dataset.sourceId;
  // --- END FIX ---
  if (!sourceId) {
    console.error('Source card is missing a data-source-id attribute.');
    return;
  }

  openSourceDetailModal(sourceId);
}

/**
 * Opens the source detail modal and populates it with data.
 * @param {string} sourceId - The ID of the source to display.
 */
export async function openSourceDetailModal(sourceId) {
  const modal = document.getElementById('source-detail-modal');
  const profileContainer = document.getElementById('source-profile-container');
  const featureBtnContainer = document.getElementById(
    'source-feature-btn-container'
  );
  const rightPanel = document.querySelector('.source-detail-right-panel');
  // --- FIX: Add null check for modal ---
  const closeButton = modal?.querySelector('.close-button');

  if (
    !modal ||
    !profileContainer ||
    !featureBtnContainer ||
    !rightPanel ||
    // --- FIX: Check closeButton itself ---
    !closeButton
  ) {
    console.error(
      'Source detail modal elements not found. One or more elements are null.'
    );
    return;
  }

  try {
    const source = await getSource(sourceId);

    // Populate profile container
    profileContainer.innerHTML = `
      <h4>${source.name}</h4>
      <p>Type: ${source.type}</p>
      ${source.description ? `<p>${source.description}</p>` : ''}
      ${
        source.url
          ? `<p>URL: <a href="${source.url}" target="_blank">${source.url}</a></p>`
          : ''
      }
      ${source.book_author ? `<p>Author: ${source.book_author}</p>` : ''}
      ${source.book_isbn ? `<p>ISBN: ${source.book_isbn}</p>` : ''}
      ${source.person_email ? `<p>Email: ${source.person_email}</p>` : ''}
      ${source.person_phone ? `<p>Phone: ${source.person_phone}</p>` : ''}
      ${
        source.group_primary_contact
          ? `<p>Primary Contact: ${source.group_primary_contact}</p>`
          : ''
      }
    `;

    // --- START: REFACTOR (Layout Change) ---
    // Render ONLY the Edit button in the left panel's footer
    featureBtnContainer.innerHTML = `
      <button class="btn" id="edit-source-btn" data-source-id="${source.id}">Edit</button>
    `;
    // The "Add Strategy" / "Add Idea" button will be rendered in loadSourceDetailContent
    // --- END: REFACTOR ---

    // --- FIX: Cast rightPanel to HTMLElement ---
    await loadSourceDetailContent(
      sourceId,
      source.type,
      /** @type {HTMLElement} */ (rightPanel)
    );
    // --- END FIX ---

    // Display the modal
    // @ts-ignore
    modal.style.display = 'block';

    // Attach event listeners
    // --- FIX: Cast closeButton to HTMLElement ---
    /** @type {HTMLElement} */ (closeButton).onclick = closeSourceDetailModal;
    /** @param {MouseEvent} event */
    // --- END FIX ---
    window.onclick = (event) => {
      if (event.target === modal) {
        closeSourceDetailModal();
      }
    };

    // --- START: REFACTOR (Layout Change) ---
    // Attach listener for the feature button
    const editButton = featureBtnContainer.querySelector('#edit-source-btn');
    const addStrategyButton = rightPanel.querySelector('#add-strategy-btn');
    const addIdeaButton = rightPanel.querySelector('#add-idea-btn');

    if (addStrategyButton) {
      addStrategyButton.addEventListener('click', handleShowStrategyForm);
    } else if (addIdeaButton) {
      addIdeaButton.addEventListener('click', handleShowIdeaForm);
    }

    if (editButton) {
      editButton.addEventListener('click', handleEditSource);
    }
    // --- END: REFACTOR ---
  } catch (error) {
    console.error(
      `Failed to load source details for modal ${sourceId}:`,
      error
    );
    profileContainer.innerHTML =
      '<p class="error">Failed to load source details.</p>';
  }
}

/**
 * Handles the edit source action by opening the edit source modal.
 * @param {Event} event - The click event.
 */
function handleEditSource(event) {
  // --- FIX: Add guard for event.target ---
  if (!(event.target instanceof HTMLElement)) return;
  // --- END FIX ---
  const sourceId = event.target.dataset.sourceId;
  if (sourceId) {
    openEditSourceModal(sourceId);
  } else {
    console.error('Edit button clicked without a source ID.');
  }
}

/**
 * Closes the source detail modal.
 */
export function closeSourceDetailModal() {
  const modal = document.getElementById('source-detail-modal');
  if (modal) {
    // @ts-ignore
    modal.style.display = 'none';
    // Clear content to ensure fresh load next time
    // --- FIX: Add null checks ---
    const profile = document.getElementById('source-profile-container');
    if (profile) profile.innerHTML = '';
    const feature = document.getElementById('source-feature-btn-container');
    if (feature) feature.innerHTML = '';
    // --- END FIX ---
    const dynamicContentDiv = document.getElementById(
      'source-detail-dynamic-content'
    );
    if (dynamicContentDiv) {
      dynamicContentDiv.remove(); // Remove the dynamic content div
    }

    // --- START: REFACTOR ---
    // Remove the logic that cleared the placeholders.
    // They are static and should not be cleared.
    // --- END: REFACTOR ---
  }
}

/**
 * Fetches and renders the detailed view for a single source.
 * This function now renders content into the modal's right panel.
 * @param {string} sourceId - The ID of the source to load.
 * @param {string} sourceType - The type of the source (e.g., 'book', 'person').
 * @param {HTMLElement} targetElement - The element to render the content into.
 */
async function loadSourceDetailContent(sourceId, sourceType, targetElement) {
  console.log(
    `Loading content for source detail right panel for source ${sourceId}...`
  );
  const contentDiv = document.createElement('div');
  contentDiv.id = 'source-detail-dynamic-content';
  targetElement.prepend(contentDiv); // Prepend to keep placeholders at the bottom

  try {
    if (sourceType === 'book' || sourceType === 'website') {
      // --- START: REFACTOR (Layout Change) ---
      contentDiv.innerHTML = `
        <div class="source-detail-right-header">
          <h4>Logged Strategies</h4>
          <button class="btn" id="add-strategy-btn" data-source-id="${sourceId}">Add Strategy</button>
        </div>
        <div id="strategy-table-container">
          <div id="strategy-table"></div> 
        </div>
      `;
      // --- END: REFACTOR ---
      await loadStrategiesForSource(sourceId);
    } else if (sourceType === 'person' || sourceType === 'group') {
      // --- START: REFACTOR (Layout Change) ---
      contentDiv.innerHTML = `
        <div class="source-detail-right-header">
          <h4>Logged Trade Ideas</h4>
          <button class="btn" id="add-idea-btn" data-source-id="${sourceId}">Add Idea</button>
        </div>
        <div id="trade-ideas-table-container">
          <div id="trade-ideas-table">
            <p>No trade ideas logged for this source yet.</p>
          </div>
        </div>
      `;
      // --- END: REFACTOR ---
      // TODO: Implement loadTradeIdeasForSource
    }
  } catch (error) {
    console.error(
      `Failed to load source detail content for ${sourceId}:`,
      error
    );
    contentDiv.innerHTML = '<p class="error">Failed to load content.</p>';
  }
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
    detailView()?.classList.remove('active');
    gridView()?.classList.add('active');
  } catch (err) {
    console.error('Failed to load sources:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderSourceCards(null, error);
  }
}

/**
 * Shows the "Log New Strategy" form modal.
 * @param {Event} event - The click event.
 */
function handleShowStrategyForm(event) {
  // --- FIX: Add guard for event.target ---
  if (!(event.target instanceof HTMLElement)) return;
  // --- END FIX ---

  const addStrategyModal = document.getElementById('add-strategy-modal');
  const strategySourceIdInput = document.getElementById('strategy-source-id');

  if (addStrategyModal && strategySourceIdInput) {
    // Get sourceId from the button that was clicked
    const sourceId = event.target.dataset.sourceId;
    if (sourceId) {
      // @ts-ignore
      strategySourceIdInput.value = sourceId;
    }
    // @ts-ignore
    addStrategyModal.style.display = 'block';

    // Attach listener for the new "Cancel" button
    document
      .getElementById('cancel-strategy-form-btn')
      ?.addEventListener('click', handleCancelStrategyForm);

    // Attach listener for the modal's close button
    addStrategyModal
      .querySelector('.close-button')
      ?.addEventListener('click', handleCancelStrategyForm);

    // Attach listener for the form submission
    document
      .getElementById('log-strategy-form')
      ?.addEventListener('submit', handleLogStrategySubmit);

    // Attach listener for closing the modal by clicking outside
    /** @param {MouseEvent} event */
    window.onclick = (event) => {
      if (event.target === addStrategyModal) {
        handleCancelStrategyForm();
      }
    };
  }
}

/**
 * Hides the "Log New Strategy" form modal.
 */
function handleCancelStrategyForm() {
  const addStrategyModal = document.getElementById('add-strategy-modal');
  if (addStrategyModal) {
    // @ts-ignore
    addStrategyModal.style.display = 'none';
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
  console.log('Strategy data being sent:', strategyData); // Add this line for debugging

  try {
    // @ts-ignore
    await addStrategy(strategyData);
    alert('Strategy saved successfully!'); // Success message
    handleCancelStrategyForm(); // Hide and clear the form

    // Refresh the strategies table
    // @ts-ignore
    await loadStrategiesForSource(String(strategyData.source_id));
  } catch (error) {
    console.error('Failed to save strategy:', error);
    alert('Error: Could not save strategy. Please check the console.');
  }
}

// --- START: Add new "Add Idea" modal functions ---

/**
 * Shows the "Log New Idea" form modal.
 * @param {Event} event - The click event.
 */
function handleShowIdeaForm(event) {
  // --- FIX: Add guard for event.target ---
  if (!(event.target instanceof HTMLElement)) return;
  // --- END FIX ---

  const addIdeaModal = document.getElementById('add-idea-modal');
  const ideaSourceIdInput = document.getElementById('idea-source-id');

  if (addIdeaModal && ideaSourceIdInput) {
    // Get sourceId from the button that was clicked
    const sourceId = event.target.dataset.sourceId;
    if (sourceId) {
      // @ts-ignore
      ideaSourceIdInput.value = sourceId;
    }
    // @ts-ignore
    addIdeaModal.style.display = 'block';

    // Attach listener for the new "Cancel" button
    document
      .getElementById('cancel-idea-form-btn')
      ?.addEventListener('click', handleCancelIdeaForm);

    // Attach listener for the modal's close button
    addIdeaModal
      .querySelector('.close-button')
      ?.addEventListener('click', handleCancelIdeaForm);

    // Attach listener for the form submission
    document
      .getElementById('log-idea-form')
      ?.addEventListener('submit', handleLogIdeaSubmit);

    // Attach listener for closing the modal by clicking outside
    /** @param {MouseEvent} event */
    window.onclick = (event) => {
      if (event.target === addIdeaModal) {
        handleCancelIdeaForm();
      }
    };
  }
}

/**
 * Hides the "Log New Idea" form modal.
 */
function handleCancelIdeaForm() {
  const addIdeaModal = document.getElementById('add-idea-modal');
  if (addIdeaModal) {
    // @ts-ignore
    addIdeaModal.style.display = 'none';
    const form = /** @type {HTMLFormElement | null} */ (
      document.getElementById('log-idea-form')
    );
    if (form) form.reset();
  }
}

/**
 * Handles the submission of the "Log New Idea" form.
 * @param {Event} event - The form submission event.
 */
async function handleLogIdeaSubmit(event) {
  event.preventDefault(); // This STOPS the page from reloading
  console.log('Idea form submitted.');

  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  const form = event.target;
  const formData = new FormData(form);
  const ideaData = Object.fromEntries(formData.entries());

  try {
    // @ts-ignore
    await addIdea(ideaData);
    alert('Idea saved successfully!');
    handleCancelIdeaForm(); // Hide and clear the form

    // Refresh the "Watched List" tab to show the new idea
    // Note: This won't be visible until the user clicks that tab,
    // but the data will be fresh when they do.
    loadWatchedListContent();
  } catch (error) {
    console.error('Failed to save idea:', error);
    alert('Error: Could not save idea. Please check the console.');
  }
}
// --- END: Add new "Add Idea" modal functions ---

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

    // --- START: Add event delegation ---
    // After rendering, attach a single listener to the table for all button clicks
    const table = document.getElementById('watched-list-table');
    if (table) {
      // Remove old listener to prevent duplicates, if any
      table.removeEventListener('click', handleWatchedListClicks);
      // Add the new listener
      table.addEventListener('click', handleWatchedListClicks);
    }
    // --- END: Add event delegation ---
  } catch (err) {
    console.error('Failed to load watched list:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderWatchedList(null, error);
  }
}

// --- START: Add new click handler function ---
/**
 * Handles all clicks within the #watched-list-table.
 * @param {Event} event
 */
async function handleWatchedListClicks(event) {
  // --- FIX: Add guard for event.target ---
  if (!(event.target instanceof HTMLElement)) return;
  // --- END FIX ---
  const target = event.target;

  const button = target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  let shouldRefresh = false;

  if (button.classList.contains('idea-delete-btn')) {
    shouldRefresh = await watchedListHandlers.handleDeleteIdeaClick(id);
  } else if (button.classList.contains('idea-paper-btn')) {
    shouldRefresh = await watchedListHandlers.handleMoveIdeaToPaperClick(id);
  } else if (button.classList.contains('idea-buy-btn')) {
    await watchedListHandlers.handleBuyIdeaClick(id);
  } else if (button.classList.contains('idea-edit-btn')) {
    await watchedListHandlers.handleEditIdeaClick(id);
  }

  if (shouldRefresh) {
    loadWatchedListContent(); // Re-load the table data
  }
}
// --- END: Add new click handler function ---

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
