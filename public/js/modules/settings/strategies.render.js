// public/js/modules/settings/strategies.render.js

export function renderStrategiesTable(strategies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID "${containerId}" not found.`);
    return;
  }

  if (strategies.length === 0) {
    container.innerHTML = '<p>No strategies found for this source.</p>';
    return;
  }

  let tableHtml = `
    <table class="strategies-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Chapter</th>
          <th>Page</th>
          <th>Description</th>
          <th>PDF Path</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  strategies.forEach(strategy => {
    tableHtml += `
      <tr>
        <td>${strategy.title}</td>
        <td>${strategy.chapter || ''}</td>
        <td>${strategy.page_number || ''}</td>
        <td>${strategy.description || ''}</td>
        <td>${strategy.pdf_path || ''}</td>
        <td>
          <button class="edit-strategy-btn table-action-btn" data-id="${strategy.id}">Edit</button>
          <button class="delete-strategy-btn table-action-btn" data-id="${strategy.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  tableHtml += `
      </tbody>
    </table>
  `;

  container.innerHTML = tableHtml;
}
