export function setupContextMenu() {
    chrome.contextMenus.create({
        id: 'read_selection',
        title: 'Read with Kokoro',
        contexts: ['selection']
    });
}

// Initial setup
chrome.runtime.onInstalled.addListener(() => {
    setupContextMenu();
    // Allow clicking the extension icon to open the side panel
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Failed to set panel behavior:", error));
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'read_selection' && info.selectionText) {
        const text = info.selectionText;

        // 1. Persist for sidepanel initialization
        chrome.storage.local.set({ lastSelection: text });

        // 2. Open side panel
        if (tab?.id && chrome.sidePanel && chrome.sidePanel.open) {
            chrome.sidePanel.open({ tabId: tab.id });
        }

        // 3. Broadcast to sidepanel if already open
        chrome.runtime.sendMessage({
            action: 'READ_SELECTION',
            text: text
        }).catch(() => {
            // Ignore error if sidepanel is not listening yet
        });
    }
});
