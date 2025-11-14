// public/js/modules/strategy-lab/sources/render.js

const gridView = () => document.getElementById('source-cards-grid');
const detailView = () => document.getElementById('source-detail-container');

/**
 * Renders a grid of "Source" cards.
 * @param {Array<object>} sources - An array of source objects from the API.
 */
export function renderSourceCards(sources) {
  const container = gridView();
  if (!container) {
    console.error('Source cards grid container not found.');
    return;
  }

  if (!sources || sources.length === 0) {
    container.innerHTML = '<p>No advice sources found. Add some in the Settings tab!</p>';
    return;
  }

  // Clear previous content
  container.innerHTML = '';

  for (const source of sources) {
    const card = document.createElement('div');
    card.className = 'source-card';
    card.dataset.sourceId = source.id;
    card.innerHTML = `
      <div class="source-card-icon">${getIconForType(source.type)}</div>
      <div class="source-card-body">
        <h4 class="source-card-title">${source.name}</h4>
        <p class="source-card-type">${source.type}</p>
      </div>
    `;
    container.appendChild(card);
  }
}

/**
 * Renders the detailed view for a single source.
 * @param {object} source - The source object to render.
 */
export function renderSourceDetail(source) {
  const container = detailView();
  if (!container) {
    console.error('Source detail container not found.');
    return;
  }

  // Determine if the source type allows adding strategies (book or website)
  const canAddStrategy = source.type === 'book' || source.type === 'website';

  container.innerHTML = `
    <div class="source-detail-header">
      <h3>${source.name}</h3>
      <button id="close-source-detail-btn" class="small-btn">Back to List</button>
    </div>
    <div class="source-detail-body">
      <p><strong>Type:</strong> ${source.type}</p>
      ${source.author ? `<p><strong>Author:</strong> ${source.author}</p>` : ''}
      ${source.url ? `<p><strong>URL:</strong> <a href="${source.url}" target="_blank">${source.url}</a></p>` : ''}
      ${source.expertise ? `<p><strong>Expertise:</strong> ${source.expertise}</p>` : ''}
      ${source.platform ? `<p><strong>Platform:</strong> ${source.platform}</p>` : ''}
    </div>

    <hr>

    <div class="source-detail-strategies">
      <h4>Logged Strategies</h4>
      ${canAddStrategy ? '<button id="source-strategy-btn" class="small-btn">Log New Strategy</button>' : '<p class="note">You can only log strategies for Books and Websites.</p>'}

      <!-- Form for logging a new strategy (initially hidden) -->
      <div id="log-strategy-form-container" style="display: none; margin-top: 1rem;">
        <form id="log-strategy-form">
          <input type="hidden" name="source_id" value="${source.id}">
          <div class="form-group">
            <label for="strategy-title">Strategy Title:</label>
            <input type="text" id="strategy-title" name="title" required>
          </div>
          ${source.type === 'book' ? `
          <div class="form-group">
            <label for="strategy-chapter">Chapter:</label>
            <input type="text" id="strategy-chapter" name="chapter">
          </div>
          <div class="form-group">
            <label for="strategy-page">Page:</label>
            <input type="number" id="strategy-page" name="page">
          </div>
          ` : ''}
          <div class="form-group">
            <label for="strategy-description">Description:</label>
            <textarea id="strategy-description" name="description" rows="3" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="small-btn">Save Strategy</button>
            <button type="button" id="cancel-strategy-form-btn" class="small-btn secondary-btn">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Container for the strategies table -->
      <div id="strategy-table-container" style="margin-top: 1rem;">
        <div id="strategy-table"></div>
      </div>
    </div>
  `;
}

/**
 * Renders a table of strategies for a source.
 * @param {Array<object>} strategies - An array of strategy objects.
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

  const table = document.createElement('table');
  table.className = 'strategy-table';

  // Check if the strategies are for a book (has 'chapter' or 'page')
  const isBook = strategies.some(s => s.chapter || s.page);

  table.innerHTML = `
    <thead>
      <tr>
        <th>Title</th>
        ${isBook ? '<th>Location</th>' : ''}
        <th>Description</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${strategies.map(strat => `
        <tr>
          <td>${strat.title}</td>
          ${isBook ? `<td>Ch. ${strat.chapter || 'N/A'}, Pg. ${strat.page || 'N/A'}</td>` : ''}
          <td>${strat.description}</td>
          <td>
            <button class="small-btn" data-id="${strat.id}">Add Idea</button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  `;

  container.innerHTML = '';
  container.appendChild(table);
}


/**
 * Helper function to get an icon based on the source type.
 * @param {string} type - The source type (e.g., 'book', 'person').
 * @returns {string} An emoji icon.
 */
function getIconForType(type) {
  switch (type) {
    case 'book':
      return '📚';
    case 'person':
      return '👤';
    case 'group':
      return '👥';
    case 'website':
      return '🌐';
    default:
      return '🔗';
  }
}
