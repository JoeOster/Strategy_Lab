// public/js/modules/strategy-lab/sources/handlers.js

/** @typedef {import('../../../types.js').Source} Source */

import { getSources } from '../../settings/sources.api.js';
import { openSourceDetailModal } from './modal.handlers.js';
import { renderSourceCards } from './render.js';

const gridView = () => document.getElementById('source-cards-grid');
const detailView = () => document.getElementById('source-detail-container');

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

  const sourceId = /** @type {HTMLElement} */ (card).dataset.sourceId;
  if (!sourceId) {
    console.error('Source card is missing a data-source-id attribute.');
    return;
  }

  openSourceDetailModal(sourceId);
}

/**
 * Fetches and renders the content for the "Sources" sub-tab (the grid).
 */
export async function loadSourcesContent() {
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
