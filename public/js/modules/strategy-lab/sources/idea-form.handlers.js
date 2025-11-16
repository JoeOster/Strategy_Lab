// public/js/modules/strategy-lab/sources/idea-form.handlers.js

import { createWatchedItem, getWatchedItem, updateWatchedItem } from './api.js';
import { loadOpenIdeasForSource } from './modal.handlers.js'; // To refresh the table

const addIdeaModal = document.getElementById('add-idea-modal');
const logIdeaForm = document.getElementById('log-idea-form');
const quantityContainer = document.getElementById('quantity-container');

/**
 * Opens the add/edit idea modal and populates it if editing.
 * @param {Event} event
 * @param {string | null} sourceId
 * @param {string | null} strategyId
 * @param {boolean} isEdit
 * @param {boolean} isPaperTrade
 * @param {string | null} ticker
 * @param {string | null} ideaId
 */
export async function handleShowIdeaForm(
  event,
  sourceId = null,
  strategyId = null,
  isEdit = false,
  isPaperTrade = false,
  ticker = null,
  ideaId = null
) {
  // Reset form fields
  // @ts-ignore
  logIdeaForm.reset();

  // Set source and strategy IDs
  // @ts-ignore
  document.getElementById('idea-source-id').value = sourceId || '';
  // @ts-ignore
  document.getElementById('idea-strategy-id').value = strategyId || '';

  // Set ticker if provided
  // @ts-ignore
  document.getElementById('idea-ticker').value = ticker || '';

  // Show/hide quantity for paper trades
  if (isPaperTrade) {
    // @ts-ignore
    quantityContainer.style.display = 'block';
  } else {
    // @ts-ignore
    quantityContainer.style.display = 'none';
  }

  if (isEdit && ideaId) {
    try {
      const idea = await getWatchedItem(ideaId);
      if (idea) {
        // Populate form fields for editing
        // @ts-ignore
        document.getElementById('idea-ticker').value = idea.ticker || '';
        // @ts-ignore
        document.getElementById('idea-buy-low').value =
          idea.buy_price_low || '';
        // @ts-ignore
        document.getElementById('idea-buy-high').value =
          idea.buy_price_high || '';
        // @ts-ignore
        document.getElementById('idea-tp-low').value =
          idea.take_profit_low || '';
        // @ts-ignore
        document.getElementById('idea-tp-high').value =
          idea.take_profit_high || '';
        // @ts-ignore
        document.getElementById('idea-escape').value = idea.escape_price || '';
        // @ts-ignore
        document.getElementById('idea-notes').value = idea.notes || '';
        // @ts-ignore
        document.getElementById('idea-source-id').value = idea.source_id || '';
        // @ts-ignore
        document.getElementById('idea-strategy-id').value =
          idea.strategy_id || '';
      }
    } catch (error) {
      console.error(`Failed to load idea ${ideaId} for editing:`, error);
      alert('Failed to load idea for editing.');
    }
  }

  // @ts-ignore
  addIdeaModal.style.display = 'block';
}

// Event listener for adding/editing an idea
if (logIdeaForm) {
  logIdeaForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // @ts-ignore
    const formData = new FormData(logIdeaForm);
    const ideaData = Object.fromEntries(formData.entries());

    // Determine if it's an edit or add operation
    // @ts-ignore
    const ideaId = document.getElementById('idea-id')?.value; // Assuming an idea-id field for edits

    try {
      if (ideaId) {
        await updateWatchedItem(ideaId, ideaData);
        alert('Idea updated successfully!');
      } else {
        await createWatchedItem(ideaData);
        alert('Idea added successfully!');
      }
      // @ts-ignore
      addIdeaModal.style.display = 'none';
      // Refresh open ideas table in the source detail modal
      // @ts-ignore
      const sourceId = document.getElementById('idea-source-id').value;
      if (sourceId) {
        loadOpenIdeasForSource(sourceId);
      }
    } catch (error) {
      console.error('Failed to save idea:', error);
      alert('Failed to save idea.');
    }
  });
}

// Close buttons for modal
if (addIdeaModal) {
  addIdeaModal.querySelector('.close-button')?.addEventListener('click', () => {
    // @ts-ignore
    addIdeaModal.style.display = 'none';
  });
  addIdeaModal
    .querySelector('#cancel-idea-form-btn')
    ?.addEventListener('click', () => {
      // @ts-ignore
      addIdeaModal.style.display = 'none';
    });
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === addIdeaModal) {
    // @ts-ignore
    addIdeaModal.style.display = 'none';
  }
});
