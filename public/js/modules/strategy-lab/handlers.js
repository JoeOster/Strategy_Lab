// public/js/modules/strategy-lab/handlers.js

import { getWatchedList } from './watched-list/api.js';
import { renderWatchedList } from './watched-list/render.js';
import { getPaperTrades } from './paper-trades/api.js';
import { renderPaperTrades } from './paper-trades/render.js';
import { getSources } from './sources/api.js';
import { renderSourceCards } from './sources/render.js';

/**
 * Initializes the sub-tabs within the Strategy Lab module.
 * Sets the default sub-tab ('sources-panel') and its panel to active.
 */
export function initializeStrategyLabSubTabs() {
    const strategyLabContainer = document.getElementById('strategy-lab-page-container');
    if (!strategyLabContainer) {
        console.error('Strategy Lab container not found.');
        return;
    }

    // Deactivate all sub-tab buttons and content panels
    strategyLabContainer.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    strategyLabContainer.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activate the default sub-tab ('sources-panel')
    const defaultTabButton = strategyLabContainer.querySelector('[data-sub-tab="sources-panel"]');
    const defaultTabContent = document.getElementById('sources-panel'); // Assuming ID is unique globally

    if (defaultTabButton) {
        defaultTabButton.classList.add('active');
    }
    if (defaultTabContent) {
        defaultTabContent.classList.add('active');
        // Call initial content load for the default tab
        loadSourcesContent();
    }
}

/**
 * Handles clicks on the Strategy Lab L2 sub-tabs (Sources, Watched List, Paper Trades).
 * Deactivates all sub-panels in its section and activates the correct one.
 * @param {Event} event - The click event.
 */
export function handleSubTabClick(event) {
    const clickedTabButton = event.target.closest('.sub-nav-btn');
    if (!clickedTabButton) {
        return;
    }
    event.stopPropagation();

    const targetPanelId = clickedTabButton.dataset.subTab;
    const strategyLabContainer = clickedTabButton.closest('#strategy-lab-page-container');

    if (!strategyLabContainer) {
        console.error('Could not find parent Strategy Lab container.');
        return;
    }

    // Deactivate all sub-tab buttons and content panels within this section
    strategyLabContainer.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    strategyLabContainer.querySelectorAll('.sub-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activate the clicked tab button and its corresponding panel
    clickedTabButton.classList.add('active');
    const targetPanel = document.getElementById(targetPanelId); // Assuming ID is unique globally
    if (targetPanel) {
        targetPanel.classList.add('active');
        // Load data for the activated panel
        switch (targetPanelId) {
            case 'sources-panel':
                loadSourcesContent();
                break;
            case 'watched-list-panel':
                loadWatchedListContent();
                break;
            case 'paper-trades-panel':
                loadPaperTradesContent();
                break;
            default:
                console.warn(`No content loading function for sub-panel: ${targetPanelId}`);
        }
    } else {
        console.error(`Sub-panel with ID '${targetPanelId}' not found.`);
    }
}

async function loadSourcesContent() {
    console.log('Loading Sources content...');
    try {
        const sources = await getSources();
        renderSourceCards(sources);
    } catch (error) {
        console.error('Failed to load sources:', error);
    }
}

async function loadWatchedListContent() {
    console.log('Loading Watched List content...');
    try {
        const watchedList = await getWatchedList();
        renderWatchedList(watchedList);
    } catch (error) {
        console.error('Failed to load watched list:', error);
    }
}

async function loadPaperTradesContent() {
    console.log('Loading Paper Trades content...');
    try {
        const paperTrades = await getPaperTrades();
        renderPaperTrades(paperTrades);
    } catch (error) {
        console.error('Failed to load paper trades:', error);
    }
}