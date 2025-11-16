// public/js/modules/alerts/index.js

import { loadHtmlPartial } from '../../utils/loadHtmlPartial.js';

function initializeSubTabs() {
  const subTabButtons = document.querySelectorAll('.sub-nav-btn');
  const subContentContainer = document.getElementById('alerts-content');

  if (!subContentContainer) {
    console.error('Sub-content container #alerts-content not found.');
    return;
  }

  subTabButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const subtab = event.target.dataset.subtab;
      
      // Deactivate other buttons
      subTabButtons.forEach(btn => btn.classList.remove('active'));
      // Activate clicked button
      event.target.classList.add('active');

      if (subtab) {
        await loadHtmlPartial(`/_alerts-${subtab}.html`, 'alerts-content');
      }
    });
  });

  // Load default sub-tab
  const defaultSubTab = document.querySelector('.sub-nav-btn');
  if (defaultSubTab) {
    defaultSubTab.click();
  }
}

export function initializeModule() {
  console.log('Alerts module initialized.');
  initializeSubTabs();
}
