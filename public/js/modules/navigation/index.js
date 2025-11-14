// public/js/modules/navigation/index.js

/**
 * Loads the HTML content for a specific tab into the main app area.
 * @param {string} tab - The name of the tab (e.g., 'dashboard', 'orders').
 */
export const loadPageContent = async (tab) => {
  const mainContent = document.getElementById('app-content');
  if (!mainContent) {
    console.error('Main app content area "#app-content" not found.');
    return;
  }

  try {
    const response = await fetch(`_${tab}.html`);
    if (!response.ok) {
      throw new Error(`Could not load tab: ${tab}`);
    }
    mainContent.innerHTML = await response.text();

    // Use dynamic import to load the module and call its initializeModule function
    try {
      // Handle the non-refactored 'strategy-lab' module path
      const modulePath =
        tab === 'strategy-lab'
          ? `../${tab}.js`
          : `../${tab}/index.js`;

      const module = await import(modulePath);
      // --- THIS IS THE BIOME-SAFE VERSION ---
      if (module && module.initializeModule) {
        module.initializeModule();
      }
    } catch (scriptError) {
      console.error(
        `Error loading or initializing module for tab ${tab}:`,
        scriptError
      );
    }
  } catch (error) {
    console.error('Error loading tab:', error);
    mainContent.innerHTML = `<p>Error loading content for ${tab}.</p>`;
  }
};

/**
 * Initializes the main navigation buttons.
 * Attaches click handlers to load page content or show the settings modal.
 */
export const initializeNavigation = () => {
  const navButtons = document.querySelectorAll('.main-nav .nav-btn');
  const mainContent = document.getElementById('app-content');
  const settingsModal = document.getElementById('settings-modal');

  if (!mainContent || !settingsModal) {
    console.error(
      'Navigation initialization failed: Missing #app-content or #settings-modal'
    );
    return;
  }

  for (const button of navButtons) {
    button.addEventListener('click', (event) => {
      const tab = event.target.dataset.tab;

      // Deactivate all other buttons
      for (const btn of navButtons) {
        btn.classList.remove('active');
      }
      // Activate the clicked button
      event.target.classList.add('active');

      if (tab === 'settings') {
        // --- THIS IS THE FIX ---
        // Clear main content and show the modal
        mainContent.innerHTML = '';
        settingsModal.style.display = 'block';
      } else {
        // Hide the modal and load the tab content
        settingsModal.style.display = 'none';
        loadPageContent(tab);
      }
    });
  }

  // Load the default tab and set its button to active
  loadPageContent('dashboard');
  const defaultTabButton = document.querySelector(
    '.main-nav .nav-btn[data-tab="dashboard"]'
  );
  if (defaultTabButton) {
    defaultTabButton.classList.add('active');
  }
};