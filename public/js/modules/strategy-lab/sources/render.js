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
 * Renders the detailed view for a single advice source.
 * @param {import('../../../types.js').Source} source - The source object to render.
 */
export function renderSourceDetail(source) {
  const container = document.getElementById('source-detail-container');
  if (!container) {
    console.error('Source detail container not found.');
    return;
  }

  let actionButtons = '';
  let strategySection = '';

  // Conditionally render placeholder buttons and strategy section based on type
  if (source.type === 'book' || source.type === 'website') {
    actionButtons = `
      <button class="source-detail-btn" id="source-strategy-btn" data-source-id="${source.id}">
        Add Strategy
      </button>
    `;
    // Add the "housing" for the form and table
    strategySection = `
      <div id="log-strategy-form-container" class="strategy-form-container" style="display:none;">
        <h4>Log New Strategy</h4>
        <form id="log-strategy-form">
          <input type="hidden" id="strategy-source-id" name="source_id" value="${source.id}">
          <label for="strategy-title">Strategy Title:</label>
          <input type="text" id="strategy-title" name="title" required>
          <label for="strategy-chapter">Chapter:</label>
          <input type="text" id="strategy-chapter" name="chapter">
          <label for="strategy-page">Page Number:</label>
          <input type="number" id="strategy-page" name="page_number">
          
          <label for="strategy-description">Description:</label>
          <textarea id="strategy-description" name="description"></textarea>
          <label for="strategy-pdf-path">PDF File Path:</label>
          <input type="text" id="strategy-pdf-path" name="pdf_path" placeholder="pdf_repo/my_strategy.pdf">
          
          <div class="form-actions">
            <button type="submit">Save Strategy</button>
            <button type="button" id="cancel-strategy-form-btn" class="clear-btn">Cancel</button>
          </div>
        </form>
      </div>
      <div id="strategy-table-container">
        <h4>Logged Strategies</h4>
        <div id="strategy-table"></div> 
      </div>
    `;
  } else if (source.type === 'person' || source.type === 'group') {
    actionButtons = `
      <button class="source-detail-btn" id="source-add-idea-btn" data-source-id="${source.id}">
        Add Trade Idea
      </button>
    `;
    // Placeholder for future "Trade Ideas" table
    strategySection = `
      <div id="trade-ideas-table-container">
        <h4>Logged Trade Ideas</h4>
        <div id="trade-ideas-table">
          <p>No trade ideas logged for this source yet.</p>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="source-detail-header">
      <h3 class="source-detail-title">${source.name}</h3>
      <button id="close-source-detail-btn" class="table-action-btn">Back to List</button>
    </div>
    <p class="source-detail-type">${source.type}</p>
    ${
      source.description
        ? `<p class="source-detail-description">${source.description}</p>`
        : ''
    }
    <div class="source-detail-actions">
      ${actionButtons}
    </div>
    <div class="source-detail-content">
      ${strategySection}
    </div>
  `;
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
          <button class="table-action-btn" data-strategy-id="${
            strategy.id
          }">Add Idea</button>
        </td>
      `;
      tbody.appendChild(row);
    }
  }
}
