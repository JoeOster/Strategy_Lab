// public/js/modules/strategy-lab/watched-list/handlers.js

import { openEditTradeModal } from '../../transactions/edit-trade.handlers.js';
import { handleShowIdeaForm } from '../sources/forms.handlers.js';
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
    await handleMoveIdeaToPaperClick(id);
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
 * @param {string} ideaId - The ID of the watched item.
 */
export async function handleMoveIdeaToPaperClick(ideaId) {
  openEditTradeModal({ ideaId: ideaId, isPaper: true });
}

/**
 * Handles the "Buy" button click for an idea.
 * @param {string} ideaId - The ID of the idea to buy.
 */
export async function handleBuyIdeaClick(ideaId) {
  openEditTradeModal({ ideaId: ideaId, isPaper: false });
}

export async function handleEditIdeaClick(ideaId) {
  console.log('Handle Edit Idea Click:', ideaId);
  try {
    const idea = await api.getIdeaForPrefill(ideaId);
    if (idea) {
      handleShowIdeaForm(null, idea.source_id, idea.strategy_id);
      const ideaForm = document.getElementById('log-idea-form');
      if (ideaForm) {
        ideaForm.elements['idea-ticker'].value = idea.ticker;
        ideaForm.elements['idea-buy-low'].value = idea.buy_price_low;
        ideaForm.elements['idea-buy-high'].value = idea.buy_price_high;
        ideaForm.elements['idea-tp-low'].value = idea.take_profit_low;
        ideaForm.elements['idea-tp-high'].value = idea.take_profit_high;
        ideaForm.elements['idea-escape'].value = idea.escape_price;
        ideaForm.elements['idea-notes'].value = idea.notes;
        const ideaIdInput = document.createElement('input');
        ideaIdInput.type = 'hidden';
        ideaIdInput.name = 'id';
        ideaIdInput.value = idea.id;
        ideaForm.appendChild(ideaIdInput);
      }
    }
  } catch (error) {
    console.error('Failed to get idea for prefill:', error);
    alert('Error: Could not get idea details. Please check the console.');
  }
}

