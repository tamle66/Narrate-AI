export function setupContextMenu() {
    chrome.contextMenus.create({
        id: 'read_selection',
        title: 'Đọc đoạn đã chọn',
        contexts: ['selection']
    });

    chrome.contextMenus.create({
        id: 'read_from_here',
        title: 'Đọc từ đây đến hết trang',
        contexts: ['selection']
    });
}

// Initial setup
chrome.runtime.onInstalled.addListener(() => {
    setupContextMenu();
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Failed to set panel behavior:", error));
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;

    // CRITICAL: sidePanel.open MUST be called synchronously at the start of the event 
    // to be considered part of the user gesture.
    chrome.sidePanel.open({ tabId: tab.id }).catch(err => {
        console.error("Failed to open side panel:", err);
    });

    if (info.menuItemId === 'read_selection' && info.selectionText) {
        const text = info.selectionText;
        const titleSnippet = text.substring(0, 40).trim() + (text.length > 40 ? "..." : "");
        chrome.storage.local.set({ lastSelection: text, lastTitle: titleSnippet });
        chrome.runtime.sendMessage({ action: 'READ_SELECTION', text: text, title: titleSnippet }).catch(() => { });
    }
    else if (info.menuItemId === 'read_from_here') {
        const hasPanel = !!chrome.sidePanel;
        if (hasPanel) {
            chrome.sidePanel.open({ tabId: tab.id }).catch(() => { });
        }

        setTimeout(() => {
            chrome.tabs.sendMessage(tab.id as number, { action: 'GET_CONTENT_FROM_SELECTION' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Content script error:", chrome.runtime.lastError.message);
                    return;
                }

                if (response && response.text) {
                    const title = response.title || "Đọc từ vị trí chọn...";
                    chrome.storage.local.set({
                        lastSelection: response.text,
                        lastTitle: title
                    });

                    chrome.runtime.sendMessage({
                        action: 'READ_SELECTION',
                        text: response.text,
                        title: title
                    }).catch(() => { });
                }
            });
        }, 500);
    }
});
