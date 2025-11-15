// public/js/modules/strategy-lab/sources/render.js

/** @typedef {import('../../../types.js').Source} Source */
/** @typedef {import('../../../types.js').Strategy} Strategy */
/** @typedef {import('../../../types.js').WatchedItem} WatchedItem */
/** @typedef {import('../../../types.js').Transaction} Transaction */

/**
 * Renders the list of advice sources as cards in the grid.
 * @param {Source[] | null} sources - An array of source objects from the API.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderSourceCards(sources, error = null) {
  const grid = document.getElementById('source-cards-grid');
  if (!grid) {
    console.error('Source cards grid container not found.');
    return;
  }

  grid.innerHTML = ''; // Clear any existing content

  if (error) {
    grid.innerHTML =
      '<p class="error">Failed to load advice sources. Please try again.</p>';
    return;
  }

  if (!sources || sources.length === 0) {
    grid.innerHTML =
      '<p>No advice sources found. You can add new ones in the Settings menu.</p>';
    return;
  }

  for (const source of sources) {
    const card = document.createElement('div');
    card.className = 'source-card';
    card.dataset.sourceId = String(source.id); // Cast to string for dataset

    // Build the card's inner HTML
    card.innerHTML = `
      <h4 class="source-card-title">${source.name}</h4>
      <p class="source-card-type">${source.type}</p>
      ${
        source.description
          ? `<p class="source-card-description">${source.description}</p>`
          : ''
      }
    `;
    grid.appendChild(card);
  }
}

/**
 * Renders the table of logged strategies for a source.
 * @param {Strategy[]} strategies - An array of strategy objects.
 */
export function renderStrategiesTable(strategies) {
  const container = document.getElementById('strategy-table');
  if (!container) {
    console.error('Strategy table container not found.');
    return;
  }

  if (!strategies || strategies.length === 0) {
    container.innerHTML = '<p>No strategies logged for this source yet.</p>';
    return;
  }

  // Create the table structure
  container.innerHTML = `
    <table class="strategy-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Chapter</th>
          <th>Page</th>
          <th>Description</th>
          <th>PDF</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        </tbody>
    </table>
  `;

  const tbody = container.querySelector('tbody');

  if (tbody) {
    for (const strategy of strategies) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${strategy.title || ''}</td>
        <td>${strategy.chapter || ''}</td>
        <td>${strategy.page_number || ''}</td>
        <td>${strategy.description || ''}</td>
        <td>${strategy.pdf_path || ''}</td>
        <td>
          <button class="table-action-btn btn" data-strategy-id="${
            strategy.id
          }">Add Idea</button>
        </td>
      `;
      tbody.appendChild(row);
    }
  }
}

// --- START: NEW RENDER FUNCTIONS FOR MODAL BOTTOM PANEL ---

/**
 * Renders the table of "Open Ideas" for a source.
 * @param {WatchedItem[] | null} ideas - An array of WatchedItem objects.
 * @param {string} containerId - The ID of the element to render into.
 * @param {Error | null} [error] - An optional error object.
 */
export function renderOpenIdeasForSource(ideas, containerId, error = null) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container not found: ${containerId}`);
    return;
  }

  // Clear placeholder and add title
  container.innerHTML = '<h3>Open Ideas</h3>';

  if (error) {
    container.innerHTML += '<p class="error">Failed to load open ideas.</p>';
    return;
  }

  if (!ideas || ideas.length === 0) {
    container.innerHTML += '<p>No open ideas from this source.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'strategy-table'; // Re-use the existing table style
  table.innerHTML = `
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Entry Zone</th>
        <th>Targets</th>
        <th>Stop Loss</th>
        <th>Status</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${ideas
        .map(
          (item) => `
        <tr data-id="${item.id}">
          <td>${item.ticker || ''}</td>
          <td>${item.buy_price_low || ''} - ${item.buy_price_high || ''}</td>
          <td>${item.take_profit_low || ''} / ${
            item.take_profit_high || ''
          }</td>
          <td>${item.escape_price || ''}</td>
          <td>${item.status || 'WATCHING'}</td>
          <td>${item.notes || ''}</td>
          <td>
            <button class="btn table-action-btn idea-buy-btn" data-id="${
              item.id
            }">Buy</button>
            <button class="btn table-action-btn idea-paper-btn" data-id="${
              item.id
            }">Paper</button>
            <button class="btn table-action-btn idea-edit-btn" data-id="${
              item.id
            }">Edit</button>
            <button class="btn table-action-btn idea-delete-btn" data-id="${
              item.id
            }">Delete</button>
          </td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  `;
  container.appendChild(table);
}

// --- END: NEW RENDER FUNCTIONS ---
