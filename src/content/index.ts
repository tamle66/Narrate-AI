import { Readability } from '@mozilla/readability';

const log = (msg: string) => {
    console.log(`[Kokoro-Content] ${msg}`);
    chrome.runtime.sendMessage({ action: 'CONTENT_LOG', message: msg }).catch(() => { });
};

log("Content script initialized");

function getPageContent() {
    log("Starting page content extraction");
    const selection = window.getSelection()?.toString();
    if (selection && selection.length > 20) {
        return { type: 'selection', text: selection };
    }

    // 2. Use Readability for high-quality extraction
    try {
        const documentClone = document.cloneNode(true) as Document;
        const reader = new Readability(documentClone);
        const article = reader.parse();

        if (article && article.textContent) {
            // Clean up text: remove double spaces/newlines
            const cleanText = article.textContent.replace(/\s+/g, ' ').trim();
            if (cleanText.length > 50) {
                return {
                    type: 'page',
                    text: cleanText.substring(0, 10000), // Safety limit
                    title: article.title
                };
            }
        }
    } catch (err) {
        console.warn("Readability failed:", err);
    }

    // 3. Fallback to basic extraction
    const mainContent = document.querySelector('article') || document.querySelector('main') || document.body;
    const text = mainContent.innerText || "";
    const cleanText = text.replace(/\s+/g, ' ').trim();

    return { type: 'fallback', text: cleanText.substring(0, 5000) };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    log(`Message received: ${request.action}`);
    if (request.action === 'GET_PAGE_CONTENT') {
        const content = getPageContent();
        log(`Sending content back (length: ${content.text.length})`);
        sendResponse(content);
    }
    return true; // Keep channel open
});
