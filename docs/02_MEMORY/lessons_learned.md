# Lessons Learned: Kokoro TTS Extension Development

## Technical Challenges & Solutions

### 1. Chrome Extension Content Script Lifecycle
- **Problem:** When an extension is reloaded during development, existing tabs lose their connection to the content script, leading to "Receiving end does not exist" errors.
- **Solution:** Implement **programmatic auto-injection**. Use `chrome.scripting.executeScript` to inject the compiled script file on-demand if the initial message fails. This requires `scripting` and host permissions.
- **Learning:** Always check if host permissions (`<all_urls>` or specific domains) are set, otherwise injection will fail silently or with a "Permission denied" error.

### 2. Side Panel Tab Targeting
- **Problem:** `chrome.tabs.query({ active: true, currentWindow: true })` often fails or returns zero tabs when called from a Side Panel, as the Side Panel might be considered the "current window" in some contexts.
- **Solution:** Use `lastFocusedWindow: true` to reliably target the web page the user is currently looking at.

### 3. Seamless Audio Playback (TTS)
- **Problem:** Calling a TTS API for a full article at once is slow. Calling it sentence by sentence creates gaps between sentences.
- **Solution:** **Smart Pre-fetching**.
    - Split text into segments (sentences/paragraphs).
    - Play Segment N.
    - While N is playing, fetch Segment N+1 in the background.
    - Use a `Map` to cache upcoming `HTMLAudioElement` objects.
- **Lookahead Limit:** Limiting pre-fetch to exactly 1 segment ahead (N+1) balances responsiveness and server load.

### 4. Setting Sensitivity & Debouncing
- **Problem:** Real-time settings (like a Speed slider) update too frequently, triggering dozens of fetch requests and overwhelming the backend.
- **Solution:** Implement a **500ms debounce** on settings changes. Only restart playback and clear cache when the user has stopped interacing with the UI for half a second.

### 5. Content Extraction Quality
- **Problem:** `article.textContent` collapses all formatting, making headers and list items run together.
- **Solution:** Use `@mozilla/readability` to get `article.content` (HTML), then parse it back via a temporary DOM element's `innerText`. `innerText` respects CSS layout and block boundaries (adds newlines), providing a much more natural TTS experience.

## Best Practices
- **Logging:** Maintaining a scrollable debug log in the UI is invaluable for debugging "invisible" background/native-host background processes.
- **CORS:** Remember that Chrome Extensions have their own origin. Even for `localhost`, ensure the backend CORS policy allows the extension's `chrome-extension://<id>` origin or use `*` for local dev.
