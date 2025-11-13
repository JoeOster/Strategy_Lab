// public/js/modules/strategy-lab/handlers.js

export function handleSubTabClick(event) {
    const subTabId = event.target.dataset.subTab;
    console.log(`Sub-tab clicked: ${subTabId}`);

    // Logic to show/hide sub-tab content
    document.querySelectorAll('.sub-tab-content').forEach(contentElement => {
        if (contentElement.id === subTabId) {
            contentElement.classList.add('active');
        } else {
            contentElement.classList.remove('active');
        }
    });

    // Placeholder for activating specific sub-module logic
    // if (subTabId === 'sources-panel' && sourcesHandlers && sourcesHandlers.activate) {
    //     sourcesHandlers.activate();
    // } else if (subTabId === 'watched-list-panel' && watchedListHandlers && watchedListHandlers.activate) {
    //     watchedListHandlers.activate();
    // } else if (subTabId === 'paper-trades-panel' && paperTradesHandlers && paperTradesHandlers.activate) {
    //     paperTradesHandlers.activate();
    // }
}
