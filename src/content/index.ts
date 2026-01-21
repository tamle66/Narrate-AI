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

// Inject Highlight CSS
const style = document.createElement('style');
style.textContent = `
    .kokoro-highlight {
        background-color: rgba(255, 87, 34, 0.2); /* Cam nhạt nền */
        border-bottom: 2.5px solid #ff5722;      /* Đường gạch chân cam đậm */
        border-radius: 3px;
        color: inherit;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        scroll-margin: 150px;
        padding: 2px 0;
        box-shadow: 0 2px 10px rgba(255, 87, 34, 0.1);
    }
    
    /* Hiệu ứng khi vừa xuất hiện */
    @keyframes kokoro-pulse {
        0% { background-color: rgba(255, 87, 34, 0.4); }
        100% { background-color: rgba(255, 87, 34, 0.2); }
    }
    .kokoro-highlight {
        animation: kokoro-pulse 0.8s ease-out;
    }
`;
document.head.appendChild(style);

let currentHighlight: HTMLElement[] = [];

function clearHighlight() {
    currentHighlight.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.innerText), el);
            parent.normalize(); // Merge adjacent text nodes
        }
    });
    currentHighlight = [];
}

function highlightSegment(text: string) {
    clearHighlight();
    if (!text || text.length < 5) return;

    // We use a robust way to find text across nodes
    // For now, let's use a simpler approach: finding the text within the page
    // Using a simple window.getSelection() + find approach or a more complex DOM walker

    // Improved search: Try to find the exact text in the document body
    // Note: This is segment-level highlighting
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    const cleanSearchText = text.replace(/\s+/g, ' ').trim();

    while (node = walker.nextNode()) {
        const nodeText = node.textContent || "";
        const cleanNodeText = nodeText.replace(/\s+/g, ' ').trim();

        if (cleanNodeText.includes(cleanSearchText) && cleanSearchText.length > 10) {
            const range = document.createRange();
            const startIdx = nodeText.indexOf(cleanSearchText);
            if (startIdx === -1) continue;

            range.setStart(node, startIdx);
            range.setEnd(node, startIdx + cleanSearchText.length);

            const mark = document.createElement('mark');
            mark.className = 'kokoro-highlight';
            mark.appendChild(range.extractContents());
            range.insertNode(mark);

            currentHighlight.push(mark);
            mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
    }
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
    else if (request.action === 'HIGHLIGHT_SEGMENT') {
        highlightSegment(request.text);
        sendResponse({ status: 'highlighted' });
    }
    else if (request.action === 'CLEAR_HIGHLIGHT') {
        clearHighlight();
        sendResponse({ status: 'cleared' });
    }
    else if (request.action === 'PING') {
        sendResponse({ status: 'pong' });
    }
    return true; // Keep channel open
});
