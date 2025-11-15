// public/js/modules/strategy-lab/watched-list/handlers.js

/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
import * as api from './api.js';
import { getWatchedList } from './api.js';
import { renderWatchedList } from './render.js';

// --- START: MOVED FROM strategy-lab/handlers.js ---

/**
 * Fetches and renders the content for the "Watched List" sub-tab.
 */
export async function loadWatchedListContent() {
  console.log('Loading Watched List content...');
  try {
    const watchedList = await getWatchedList();
    renderWatchedList(watchedList);

    // After rendering, attach a single listener to the table for all button clicks
    const table = document.getElementById('watched-list-table');
    if (table) {
      // Remove old listener to prevent duplicates, if any
      table.removeEventListener('click', handleWatchedListClicks);
      // Add the new listener
      table.addEventListener('click', handleWatchedListClicks);
    }
  } catch (err) {
    console.error('Failed to load watched list:', err);
    // Cast unknown 'err' to 'Error'
    const error = err instanceof Error ? err : new Error(String(err));
    renderWatchedList(null, error);
  }
}

/**
 * Handles all clicks within the #watched-list-table.
 * @param {Event} event
 */
export async function handleWatchedListClicks(event) {
  if (!(event.target instanceof HTMLElement)) return;
  const target = event.target;

  const button = target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  let shouldRefresh = false;

  if (button.classList.contains('idea-delete-btn')) {
    shouldRefresh = await handleDeleteIdeaClick(id);
  } else if (button.classList.contains('idea-paper-btn')) {
    shouldRefresh = await handleMoveIdeaToPaperClick(id);
  } else if (button.classList.contains('idea-buy-btn')) {
    await handleBuyIdeaClick(id);
  } else if (button.classList.contains('idea-edit-btn')) {
    await handleEditIdeaClick(id);
  }

  if (shouldRefresh) {
    loadWatchedListContent(); // Re-load the table data
  }
}
// --- END: MOVED FROM strategy-lab/handlers.js ---

/**
 * Handles the click to delete a "Trade Idea".
 * @param {string} id - The ID of the watched item.
 * @returns {Promise<boolean>} True if the list should be refreshed.
 */
export async function handleDeleteIdeaClick(id) {
  if (confirm('Are you sure you want to delete this idea?')) {
    try {
      await api.deleteIdea(id);
      return true; // Request refresh
    } catch (error) {
      console.error('Failed to delete idea:', error);
      alert('Failed to delete idea. See console for details.');
      return false;
    }
  }
  return false;
}

/**
 * Handles the click to move an "Idea" to "Paper Trades".
 * @param {string} id - The ID of the watched item.
 * @returns {Promise<boolean>} True if the list should be refreshed.
 */
export async function handleMoveIdeaToPaperClick(id) {
  if (
    confirm(
      'Move this idea to Paper Trades? This will create a new paper trade at the current market price.'
    )
  ) {
    try {
      await api.moveIdeaToPaper(id);
      alert('Idea moved to Paper Trades.');
      return true; // Request refresh
    } catch (error) {
      console.error('Failed to move idea to paper:', error);
      alert('Failed to move idea. See console for details.');
      return false;
    }
  }
  return false;
}

/**
 * Handles the click to pre-fill the "Orders" tab. (Placeholder)
 * @param {string} id - The ID of the watched item.
 */
export async function handleBuyIdeaClick(id) {
  // TODO: This will be a more complex implementation.
  // 1. const idea = await api.getIdeaForPrefill(id);
  // 2. Store this `idea` object in sessionStorage.
  // 3. Programmatically click the main "Orders" tab.
  // 4. The "Orders" module's index.js will need to be modified
  //    to check sessionStorage for this pre-fill data on load.
  console.log('Handle Buy Idea Click:', id);
  alert('Functionality to pre-fill "Orders" tab is not yet implemented.');
}

/**
 * Handles the click to edit a "Trade Idea". (Placeholder)
 * @param {string} id - The ID of the watched item.
 */
export async function handleEditIdeaClick(id) {
  // TODO: This will open a new modal, similar to the "Edit Source" modal.
  // 1. const idea = await api.getIdeaForPrefill(id);
  // 2. Populate an "Edit Idea" modal (which needs to be created in index.html).
  // 3. Show the modal.
  console.log('Handle Edit Idea Click:', id);
  alert('Functionality to "Edit Idea" is not yet implemented.');
}
