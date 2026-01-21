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

        if (article && article.content) {
            // Use a temporary div to get innerText, which respects block boundaries
            // and includes list markers better than textContent.
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content;

            const cleanText = tempDiv.innerText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');

            if (cleanText.length > 50) {
                return {
                    type: 'page',
                    text: cleanText.substring(0, 15000), // Safety limit
                    title: article.title
                };
            }
        }
    } catch (err) {
        log(`Readability error: ${err}`);
    }

    // 3. Fallback to basic extraction
    const mainContent = document.querySelector('article') || document.querySelector('main') || document.body;
    const text = mainContent.innerText || "";
    const cleanText = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

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
