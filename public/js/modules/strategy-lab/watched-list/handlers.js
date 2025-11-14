// public/js/modules/strategy-lab/watched-list/handlers.js

/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
import * as api from './api.js';

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
