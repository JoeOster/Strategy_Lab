// public/js/modules/strategy-lab/sources/modal.handlers.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
/** @typedef {import('../../../types.js').Transaction} Transaction */

import { getSource } from '../../settings/sources.api.js';
import { openEditSourceModal } from '../../settings/sources.handlers.js';
import {
  renderOpenTradesForSource,
  renderPaperTradesForSource,
} from '../../transactions/render.js';
import { handleDeletePaperTradeClick } from '../paper-trades/handlers.js';
import * as watchedListHandlers from '../watched-list/handlers.js';
import {
  getOpenIdeasForSource,
  getOpenTradesForSource,
  getPaperTradesForSource,
  getStrategiesForSource,
} from './api.js';
import {
  handleShowIdeaForm,
  handleShowStrategyForm,
} from './forms.handlers.js';
import { renderOpenIdeasForSource, renderStrategiesTable } from './render.js';

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

  // Reset bottom panel placeholders
  const ideasPlaceholder = document.getElementById(
    'open-ideas-table-placeholder'
  );
  const openTradesPlaceholder = document.getElementById(
    'open-trades-table-placeholder'
  );
  const paperTradesPlaceholder = document.getElementById(
    'paper-trades-table-placeholder'
  );

  if (ideasPlaceholder) {
    ideasPlaceholder.innerHTML = '<h3>Open Ideas</h3><p>Loading...</p>';
  }
  if (openTradesPlaceholder) {
    openTradesPlaceholder.innerHTML = '<h3>Open Trades</h3><p>Loading...</p>';
  }
  if (paperTradesPlaceholder) {
    paperTradesPlaceholder.innerHTML = '<h3>Paper Trades</h3><p>Loading...</p>';
  }

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

  // Store sourceId on the modal for the click handler to use
  // @ts-ignore
  modal.dataset.sourceId = sourceId;

  try {
    const source = await getSource(sourceId);

    // Populate profile container
    profileContainer.innerHTML = `
      <h3>${source.name}</h3> 
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

    // Render ONLY the Edit button in the left panel's footer
    featureBtnContainer.innerHTML = `
      <button class="btn" id="edit-source-btn" data-source-id="${source.id}">Edit</button>
    `;

    // Load content for the right panel (Strategies or Ideas)
    await loadSourceDetailContent(
      sourceId,
      source.type,
      /** @type {HTMLElement} */ (rightPanel)
    );

    // Load all three bottom panel tables in parallel
    loadOpenIdeasForSource(sourceId);
    loadOpenTradesForSource(sourceId);
    loadPaperTradesForSource(sourceId);

    // Display the modal
    // @ts-ignore
    modal.style.display = 'block';

    // Attach event listeners
    /** @type {HTMLElement} */ (closeButton).onclick = closeSourceDetailModal;
    /** @param {MouseEvent} event */
    window.onclick = (event) => {
      if (event.target === modal) {
        closeSourceDetailModal();
      }
    };

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

    // Add event listener for the bottom panel
    const bottomPanel = modal.querySelector('.source-detail-bottom-panel');
    if (bottomPanel) {
      bottomPanel.addEventListener('click', handleModalBottomPanelClicks);
    }

    // Attach listener for the strategy table
    const strategyTable = rightPanel.querySelector('#strategy-table');
    if (strategyTable) {
      strategyTable.addEventListener('click', handleStrategyTableClicks);
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
 * Handles the edit source action by opening the edit source modal.
 * @param {Event} event - The click event.
 */
function handleEditSource(event) {
  if (!(event.target instanceof HTMLElement)) return;
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
    // Clear content
    const profile = document.getElementById('source-profile-container');
    if (profile) profile.innerHTML = '';
    const feature = document.getElementById('source-feature-btn-container');
    if (feature) feature.innerHTML = '';
    const dynamicContentDiv = document.getElementById(
      'source-detail-dynamic-content'
    );
    if (dynamicContentDiv) {
      dynamicContentDiv.remove();
    }

    // Remove event listener for the bottom panel
    const bottomPanel = modal.querySelector('.source-detail-bottom-panel');
    if (bottomPanel) {
      bottomPanel.removeEventListener('click', handleModalBottomPanelClicks);
    }
    const strategyTable = modal.querySelector('#strategy-table');
    if (strategyTable) {
      strategyTable.removeEventListener('click', handleStrategyTableClicks);
    }
    // @ts-ignore
    modal.dataset.sourceId = ''; // Clear the stored ID
  }
}

/**
 * Fetches and renders the detailed view for a single source (right panel).
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
        <div class="source-detail-right-header">
          <h3>Logged Strategies</h3>
          <button class="btn" id="add-strategy-btn" data-source-id="${sourceId}">Add Strategy</button>
        </div>
        <div id="strategy-table-container">
          <div id="strategy-table"></div> 
        </div>
      `;
      await loadStrategiesForSource(sourceId);
    } else if (sourceType === 'person' || sourceType === 'group') {
      contentDiv.innerHTML = `
        <div class="source-detail-right-header">
          <h3>Logged Trade Ideas</h3>
          <button class="btn" id="add-idea-btn" data-source-id="${sourceId}">Add Idea</button>
        </div>
        <div id="trade-ideas-table-container">
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
 * Fetches and renders the strategies table for a given source.
 * @param {string|number} sourceId - The ID of the source.
 */
// --- START: FIX ---
export async function loadStrategiesForSource(sourceId) {
  // --- END: FIX ---
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

// --- START: NEW LOADER FUNCTIONS FOR BOTTOM PANEL ---

/**
 * Fetches and renders the "Open Ideas" table for the source.
 * @param {string|number} sourceId - The ID of the source.
 */
// --- START: FIX ---
export async function loadOpenIdeasForSource(sourceId) {
  // --- END: FIX ---
  const containerId = 'open-ideas-table-placeholder';
  try {
    const ideas = await getOpenIdeasForSource(sourceId);
    renderOpenIdeasForSource(ideas, containerId);
  } catch (err) {
    console.error(`Failed to load open ideas for source ${sourceId}:`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    renderOpenIdeasForSource(null, containerId, error);
  }
}

/**
 * Fetches and renders the "Open Trades" (real) table for the source.
 * @param {string|number} sourceId - The ID of the source.
 */
// --- START: FIX ---
export async function loadOpenTradesForSource(sourceId) {
  const containerId = 'open-trades-table-placeholder';
  try {
    const trades = await getOpenTradesForSource(sourceId);
    renderOpenTradesForSource(trades, containerId);
  } catch (err) {
    console.error(`Failed to load open trades for source ${sourceId}:`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    renderOpenTradesForSource(null, containerId, error);
  }
}

/**
 * Fetches and renders the "Paper Trades" table for the source.
 * @param {string|number} sourceId - The ID of the source.
 */
export async function loadPaperTradesForSource(sourceId) {
  const containerId = 'paper-trades-table-placeholder';
  try {
    const trades = await getPaperTradesForSource(sourceId);
    renderPaperTradesForSource(trades, containerId);
  } catch (err) {
    console.error(`Failed to load paper trades for source ${sourceId}:`, err);
    const error = err instanceof Error ? err : new Error(String(err));
    renderPaperTradesForSource(null, containerId, error);
  }
}

// --- END: NEW LOADER FUNCTIONS ---

import { openEditTradeModal } from '../../transactions/edit-trade.handlers.js';
import { openPaperTradeDetailsModal } from '../../transactions/paper-trade-details.handlers.js';
import { openSellTradeModal } from '../../transactions/sell-trade.handlers.js';

/**
 * Handles all clicks within the modal's bottom panel.
 * @param {Event} event
 */
async function handleModalBottomPanelClicks(event) {
  if (!(event.target instanceof HTMLElement)) return;
  const target = event.target;

  const button = target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  let shouldRefreshIdeas = false;
  let shouldRefreshPaperTrades = false;
  let movedToPaper = false;

  // Check for "Open Ideas" buttons
  if (button.classList.contains('idea-delete-btn')) {
    shouldRefreshIdeas = await watchedListHandlers.handleDeleteIdeaClick(id);
  } else if (button.classList.contains('idea-paper-btn')) {
    shouldRefreshIdeas =
      await watchedListHandlers.handleMoveIdeaToPaperClick(id);
    if (shouldRefreshIdeas) {
      movedToPaper = true;
    }
  } else if (button.classList.contains('idea-buy-btn')) {
    await watchedListHandlers.handleBuyIdeaClick(id);
  } else if (button.classList.contains('idea-edit-btn')) {
    await watchedListHandlers.handleEditIdeaClick(id);
  }

  // Check for "Paper Trades" buttons
  if (button.classList.contains('paper-delete-btn')) {
    shouldRefreshPaperTrades = await handleDeletePaperTradeClick(id);
  } else if (button.classList.contains('paper-details-btn')) {
    openPaperTradeDetailsModal(id);
  }

  // Check for "Open Trades" buttons
  if (button.classList.contains('real-sell-btn')) {
    openSellTradeModal(id);
  } else if (button.classList.contains('real-edit-btn')) {
    openEditTradeModal(id);
  }

  // @ts-ignore
  const sourceId = event.target.closest('#source-detail-modal')?.dataset
    .sourceId;

  if (sourceId) {
    if (shouldRefreshIdeas) {
      loadOpenIdeasForSource(sourceId); // Re-load ideas
    }
    if (movedToPaper || shouldRefreshPaperTrades) {
      // If we moved an idea to paper, OR deleted a paper trade,
      // refresh the paper trades table
      loadPaperTradesForSource(sourceId);
    }
  }
}

/**
 * Handles all clicks within the modal's strategy table.
 * @param {Event} event
 */
async function handleStrategyTableClicks(event) {
  if (!(event.target instanceof HTMLElement)) return;
  const target = event.target;

  const button = target.closest('button');
  if (!button) return;

  const strategyId = button.dataset.strategyId;
  if (!strategyId) return;

  if (button.classList.contains('table-action-btn')) {
    const modal = event.target.closest('#source-detail-modal');
    if (modal) {
      // @ts-ignore
      const sourceId = modal.dataset.sourceId;
      handleShowIdeaForm(event, sourceId, strategyId);
    }
  }
}
