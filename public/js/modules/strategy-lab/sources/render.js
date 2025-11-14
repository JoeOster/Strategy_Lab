// public/js/modules/strategy-lab/sources/render.js

/**
 * Renders the list of advice sources as cards in the grid.
 * @param {import('../../../types.js').Source[] | null} sources - An array of source objects from the API.
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
 * @param {import('../../../types.js').Strategy[]} strategies - An array of strategy objects.
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
