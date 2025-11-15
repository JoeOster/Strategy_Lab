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
      // All modules now follow the same '/index.js' pattern.
      const modulePath = `../${tab}/index.js`;

      const module = await import(modulePath);
      // --- THIS IS THE BIOME-SAFE VERSION ---
      if (module?.initializeModule) {
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
  if (!mainContent) {
    console.error(
      'Navigation initialization failed: Missing #app-content'
    );
    return;
  }

  for (const button of navButtons) {
    button.addEventListener('click', (event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const tab = target.dataset.tab;

      // --- FIX: Add a type guard to ensure 'tab' is not undefined ---
      if (!tab) {
        console.error('Button is missing a data-tab attribute', target);
        return;
      }
      // --- END FIX ---

      // Deactivate all other buttons
      for (const btn of navButtons) {
        btn.classList.remove('active');
      }
      // Activate the clicked button
      target.classList.add('active');

      if (tab === 'settings') {
        loadPageContent('settings-page');
      } else {
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
