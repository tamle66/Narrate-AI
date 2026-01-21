
console.log("Content script initialized");

function getPageContent() {
    // Try using Readability if available (user might need to npm install it)
    // For now, simpler fallback
    const selection = window.getSelection()?.toString();
    if (selection && selection.length > 0) {
        return { type: 'selection', text: selection };
    }

    // Basic extraction
    // TODO: Improve with @mozilla/readability later

    // Simple heuristic: Get main content or fallback to body
    // This is VERY basic.
    const article = document.querySelector('article') || document.querySelector('main') || document.body;
    const text = article.innerText || "";

    // Clean up text
    const cleanText = text.replace(/\s+/g, ' ').trim();

    return { type: 'page', text: cleanText.substring(0, 5000) }; // Limit for now
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action === 'GET_PAGE_CONTENT') {
        const content = getPageContent();
        sendResponse(content);
    }
    return true; // Keep channel open
});
