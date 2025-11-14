// public/js/modules/strategy-lab/handlers.js

import { getPaperTrades } from './paper-trades/api.js';
import { renderPaperTrades } from './paper-trades/render.js';
import {
  addStrategy,
  getSource,
  getSources,
  getStrategiesForSource,
} from './sources/api.js';
import { renderSourceCards, renderStrategiesTable } from './sources/render.js';
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

// ... (rest of the file is unchanged) ...

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

// ... (rest of the file is unchanged) ...

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

  const sourceId = card.dataset.sourceId;
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
  const closeButton = modal?.querySelector('.close-button');

  console.log('Modal:', modal);
  console.log('Profile Container:', profileContainer);
  console.log('Feature Button Container:', featureBtnContainer);
  console.log('Right Panel:', rightPanel);
  console.log('Close Button:', closeButton);

  if (
    !modal ||
    !profileContainer ||
    !featureBtnContainer ||
    !rightPanel ||
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
      ${source.url ? `<p>URL: <a href="${source.url}" target="_blank">${source.url}</a></p>` : ''}
      ${source.book_author ? `<p>Author: ${source.book_author}</p>` : ''}
      ${source.book_isbn ? `<p>ISBN: ${source.book_isbn}</p>` : ''}
      ${source.person_email ? `<p>Email: ${source.person_email}</p>` : ''}
      ${source.person_phone ? `<p>Phone: ${source.person_phone}</p>` : ''}
      ${source.group_primary_contact ? `<p>Primary Contact: ${source.group_primary_contact}</p>` : ''}
    `;

    // Render feature button
    let featureButtonHtml = '';
    if (source.type === 'book' || source.type === 'website') {
      featureButtonHtml = `
        <button class="btn" id="add-strategy-btn" data-source-id="${source.id}">Add Strategy</button>
        <button class="btn" id="edit-source-btn" data-source-id="${source.id}">Edit</button>
      `;
    } else if (source.type === 'person' || source.type === 'group') {
      featureButtonHtml = `
        <button class="btn" id="add-idea-btn" data-source-id="${source.id}">Add Idea</button>
        <button class="btn" id="edit-source-btn" data-source-id="${source.id}">Edit</button>
      `;
    }
    featureBtnContainer.innerHTML = featureButtonHtml;

    // Load content for the right panel (strategies/trade ideas)
    await loadSourceDetailContent(sourceId, source.type, rightPanel);

    // Display the modal
    modal.style.display = 'block';

    // Attach event listeners
    closeButton.onclick = closeSourceDetailModal;
    window.onclick = (event) => {
      if (event.target === modal) {
        closeSourceDetailModal();
      }
    };

    // Attach listener for the feature button
    const addStrategyButton = featureBtnContainer.querySelector('#add-strategy-btn');
    const addIdeaButton = featureBtnContainer.querySelector('#add-idea-btn');
    const editButton = featureBtnContainer.querySelector('#edit-source-btn');

    if (addStrategyButton) {
      addStrategyButton.addEventListener('click', handleShowStrategyForm);
    } else if (addIdeaButton) {
      // TODO: Implement handleShowAddIdeaForm
      addIdeaButton.addEventListener('click', () =>
        alert('Add Idea functionality not yet implemented.')
      );
    }

    if (editButton) {
      editButton.addEventListener('click', handleEditSource);
    }
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
 * Placeholder function for handling the edit source action.
 * @param {Event} event - The click event.
 */
function handleEditSource(event) {
  const sourceId = event.target.dataset.sourceId;
  alert(`Edit functionality for source ID: ${sourceId} not yet implemented.`);
}

/**
 * Closes the source detail modal.
 */
export function closeSourceDetailModal() {
  const modal = document.getElementById('source-detail-modal');
  if (modal) {
    modal.style.display = 'none';
    // Clear content to ensure fresh load next time
    document.getElementById('source-profile-container').innerHTML = '';
    document.getElementById('source-feature-btn-container').innerHTML = '';
    const dynamicContentDiv = document.getElementById(
      'source-detail-dynamic-content'
    );
    if (dynamicContentDiv) {
      dynamicContentDiv.remove(); // Remove the dynamic content div
    }
    // Clear the content of the new bottom panel placeholders
    document.getElementById('open-trades-table-placeholder').innerHTML =
      '<h4>Open Trades</h4><p>Table for open trades will go here.</p>';
    document.getElementById('paper-trades-table-placeholder').innerHTML =
      '<h4>Paper Trades</h4><p>Table for paper trades will go here.</p>';
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
      contentDiv.innerHTML = `
        <div id="strategy-table-container">
          <h4>Logged Strategies</h4>
          <div id="strategy-table"></div> 
        </div>
      `;
      await loadStrategiesForSource(sourceId);
      // Attach form submit listener - no longer needed here as form is in its own modal
      // document.getElementById('log-strategy-form')?.addEventListener('submit', handleLogStrategySubmit);
    } else if (sourceType === 'person' || sourceType === 'group') {
      contentDiv.innerHTML = `
        <div id="trade-ideas-table-container">
          <h4>Logged Trade Ideas</h4>
          <div id="trade-ideas-table">
            <p>No trade ideas logged for this source yet.</p>
          </div>
        </div>
      `;
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
    // No longer needed as modal handles detail view
    detailView()?.classList.remove('active'); // Keep this commented if it refers to the old detail view
    gridView()?.classList.add('active'); // Restore this to make source cards visible
  } catch (err) {
    console.error('Failed to load sources:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderSourceCards(null, error);
  }
}

/**
 * Shows the "Log New Strategy" form modal.
 */
function handleShowStrategyForm(event) {
  const addStrategyModal = document.getElementById('add-strategy-modal');
  const strategySourceIdInput = document.getElementById('strategy-source-id');

  if (addStrategyModal && strategySourceIdInput) {
    // Get sourceId from the button that was clicked
    const sourceId = event.target.dataset.sourceId;
    if (sourceId) {
      strategySourceIdInput.value = sourceId;
    }

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
