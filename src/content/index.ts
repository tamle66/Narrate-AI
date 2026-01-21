import { Readability } from '@mozilla/readability';

const log = (msg: string) => {
    console.log(`[Kokoro-Content] ${msg}`);
    chrome.runtime.sendMessage({ action: 'CONTENT_LOG', message: msg }).catch(() => { });
};

log("Content script initialized");

function cleanAndFormatText(root: HTMLElement): string {
    // 1. Convert lists to have explicit markers if they don't
    const lists = root.querySelectorAll('ul, ol');
    lists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach((li, index) => {
            const prefix = list.tagName === 'OL' ? `${index + 1}. ` : '• ';
            // Only add if not already present
            const text = li.innerText.trim();
            if (text && !text.match(/^(\d+\.|•)/)) {
                li.prepend(document.createTextNode(prefix));
            }
        });
    });

    // 2. Ensure pauses between blocks (headings, paragraphs, etc.)
    const blocks = root.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, article, section');
    blocks.forEach(block => {
        const b = block as HTMLElement;
        const text = b.innerText.trim();
        if (text && !text.match(/[.!?]$/)) {
            // Append a period to force segment split in useAudio
            b.append(document.createTextNode('. '));
        }
    });

    return root.innerText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
}

function getPageContent() {
    log("Starting page content extraction");

    // 1. Use Readability for high-quality extraction
    try {
        const documentClone = document.cloneNode(true) as Document;
        const reader = new Readability(documentClone);
        const article = reader.parse();

        if (article && article.content) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content;

            const cleanText = cleanAndFormatText(tempDiv);

            if (cleanText.length > 50) {
                return {
                    type: 'page',
                    text: cleanText.substring(0, 15000),
                    title: article.title
                };
            }
        }
    } catch (err) {
        log(`Readability error: ${err}`);
    }

    // 2. Fallback to basic extraction
    const mainContent = document.querySelector('article') || document.querySelector('main') || document.body;
    const clone = mainContent.cloneNode(true) as HTMLElement;
    const cleanText = cleanAndFormatText(clone);

    return {
        type: 'fallback',
        text: cleanText.substring(0, 5000),
        title: document.title
    };
}

function getContentFromSelection() {
    log("Extracting content from selection onwards");
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        log("No selection found for 'Read from here'");
        return { text: "" };
    }

    const range = selection.getRangeAt(0).cloneRange();
    const container = document.querySelector('article') || document.querySelector('main') || document.body;
    range.setEndAfter(container.lastChild || container);

    const fragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment);

    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(s => s.remove());

    const cleanText = cleanAndFormatText(tempDiv);
    const titleSnippet = cleanText.substring(0, 40).trim() + (cleanText.length > 40 ? "..." : "");

    return {
        text: cleanText.substring(0, 30000),
        type: 'from_here',
        title: titleSnippet
    };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    log(`Message received: ${request.action}`);
    if (request.action === 'GET_PAGE_CONTENT') {
        const content = getPageContent();
        log(`Sending page content back (length: ${content.text.length})`);
        sendResponse(content);
    }
    else if (request.action === 'GET_CONTENT_FROM_SELECTION') {
        const content = getContentFromSelection();
        log(`Sending selection-onwards content back (length: ${content.text.length})`);
        sendResponse(content);
    }
    else if (request.action === 'PING') {
        sendResponse({ status: 'pong' });
    }
    return true; // Keep channel open
});
