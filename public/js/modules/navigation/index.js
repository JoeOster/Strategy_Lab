// public/js/modules/navigation/index.js

export const loadPageContent = async (tab) => {
  const mainContent = document.getElementById('app-content');
  try {
    const response = await fetch(`_${tab}.html`);
    if (!response.ok) {
      throw new Error(`Could not load tab: ${tab}`);
    }
    mainContent.innerHTML = await response.text();

    // Defer script loading until after HTML is parsed
    setTimeout(() => {
      const oldScript = document.getElementById('module-script');
      if (oldScript) {
        oldScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'module-script';
      script.src = `js/modules/${tab}.js`;
      script.defer = true;
      document.body.appendChild(script);
    }, 0);
  } catch (error) {
    console.error('Error loading tab:', error);
    mainContent.innerHTML = `<p>Error loading content for ${tab}.</p>`;
  }
};

export const initializeNavigation = () => {
  const navButtons = document.querySelectorAll('.main-nav .nav-btn');
  navButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const tab = event.target.dataset.tab;
      if (tab === 'settings') {
        document.getElementById('settings-modal').style.display = 'block';
      } else {
        loadPageContent(tab);
      }
    });
  });

  // Load the default tab
  loadPageContent('dashboard');
};
