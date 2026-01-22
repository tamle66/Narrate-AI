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

function preCleanDOM(doc: Document) {
    // List of selectors that usually contain noise or navigation
    const noiseSelectors = [
        '.rc-ModuleNav', '.rc-SyllabusNav', '.rc-NavigationLink', // Coursera
        '.sidebar', '.navigation', '.menu', 'nav', 'header', 'footer',
        '.ad', '.ads', '.social-share', '.related-posts', '.comments',
        '#header', '#footer'
    ];

    noiseSelectors.forEach(selector => {
        doc.querySelectorAll(selector).forEach(el => {
            try { el.remove(); } catch (e) { }
        });
    });

    // Remove interactive elements
    doc.querySelectorAll('button, input, select, textarea, noscript, style, iframe').forEach(el => {
        try { el.remove(); } catch (e) { }
    });
}

function getPageContent() {
    log("Starting page content extraction");

    // 1. Try Readability on the FULL document first (it's better at its job with context)
    try {
        const documentClone = document.cloneNode(true) as Document;
        const reader = new Readability(documentClone);
        const article = reader.parse();

        if (article && article.textContent && article.textContent.trim().length > 100) {
            log(`Readability success: ${article.title || "Untitled"}`);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.content || "";

            // Clean up the extracted content (but not too much)
            tempDiv.querySelectorAll('button, input, script, style').forEach(el => el.remove());

            const cleanText = cleanAndFormatText(tempDiv);
            if (cleanText.length > 50) {
                return {
                    type: 'page',
                    text: cleanText,
                    title: article.title || document.title || "Untitled"
                };
            }
        } else {
            log("Readability found insufficient content, trying fallback...");
        }
    } catch (err) {
        log(`Readability error: ${err}`);
    }

    // 2. Fallback: Targeted Search
    const contentSelectors = [
        'article',
        '[role="main"]',
        'main',
        '.content-detail', // common for news
        '.post-content',
        '.entry-content',
        '.article-content',
        '#main-content',
        '.main-content',
        '.fck_detail', // common in Vietnamese sites
        '.detail-content'
    ];

    let mainContent: HTMLElement | null = null;
    for (const selector of contentSelectors) {
        const el = document.querySelector(selector) as HTMLElement;
        if (el && el.innerText.trim().length > 200) {
            log(`Found content using selector: ${selector}`);
            mainContent = el;
            break;
        }
    }

    if (!mainContent) {
        log("No targeted content container found, using body");
        mainContent = document.body;
    }

    const clone = mainContent.cloneNode(true) as HTMLElement;

    // Use preCleanDOM to remove generic noise from the clone's owner context if possible, 
    // or just clean the clone itself.
    // To apply preCleanDOM's logic to an HTMLElement clone, we need to create a temporary Document
    // or adapt preCleanDOM to work on an HTMLElement. For simplicity and to use the existing function,
    // we'll create a temporary document for the clone.
    const tempDoc = document.implementation.createHTMLDocument('temp');
    tempDoc.body.appendChild(clone); // Append the clone to the temporary document's body
    preCleanDOM(tempDoc); // Apply preCleanDOM to the temporary document

    // After preCleanDOM, the content is now in tempDoc.body. We need to get it back.
    const cleanedClone = tempDoc.body;

    // Final specific cleanup on the clone
    cleanedClone.querySelectorAll('nav, header, footer, aside, .sidebar, button, script, style, .rc-NavigationLink, .rc-ModuleNav').forEach(el => {
        try { el.remove(); } catch (e) { }
    });

    const cleanText = cleanAndFormatText(cleanedClone);
    log(`Final extracted length: ${cleanText.length}`);

    return {
        type: 'fallback',
        text: cleanText,
        title: document.title || "Untitled"
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
