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

### 6. Backend Performance & Request Cancellation
- **Problem:** Frequent navigation or settings changes left "zombie" fetch requests running in the background, hammering the CPU.
- **Solution:** Use **`AbortController`**. Associate each `fetch` with a signal and trigger `.abort()` on all pending requests whenever the playback session resets (`playText`, `stop`, `jump`).
- **Learning:** Efficient resource management on the client side is just as important as backend optimization for a smooth UX.

### 7. Natural Prosody through Smart Formatting
- **Problem:** Lists (1., 2.) often lost their numbers in `innerText`, and headings blended into the first sentence of paragraphs.
- **Solution:** Manual DOM manipulation before extraction:
    - Inject explicit markers (`1.`, `•`) into `<li>` elements using the `tagName` context.
    - Append periods (`.`) to block elements (`h1-h6`, `p`, `li`) if they don't end in punctuation.
- **Learning:** Small punctuation cues significantly improve the "natural" feel of TTS by forcing the engine to pause correctly.

### 8. Robust Text Highlighting with TreeWalker
- **Problem:** Highlights often fail when text is split across multiple nested DOM nodes or when page content doesn't perfectly match the extracted text snippet.
- **Solution:** Use **`document.createTreeWalker`** to traverse text nodes and implement a normalized text comparison (ignoring white spaces). This allows finding the segment and auto-scrolling to it even in complex article layouts.
- **Learning:** `mark.scrollIntoView({ behavior: 'smooth', block: 'center' })` provides the best reading experience by keeping the active sentence in the middle of the screen.

### 9. C++ Build Complexity & Dependencies
- **Problem:** Automated setup often fails on libraries like `pyopenjtalk` which require a C++ compiler for Japanese dictionary builds, even if the user only needs English/Vietnamese.
- **Solution:** **Conditional Patching**. Patching `pyproject.toml` to use `misaki[en]` instead of the full package bypasses the need for a C++ compiler and works 100% of the time on basic Windows/Python installs.
- **Learning:** Don't let a secondary feature (like Japanese support) block the primary experience. Fail gracefully or provide a slimmed-down path.

### 10. Multi-strategy Content Extraction
- **Problem:** `Readability` can fail on some news sites (like VietnamNet) or grab too much noise (Coursera sidebars).
- **Solution:** **Dual-strategy approach**. Try `Readability` first for high-quality articles, but have a prioritized list of CSS Selectors (`article`, `.content-detail`, etc.) as a fallback. Combined with a `preCleanDOM` step to remove known noisy elements (nav, sidebars), this yields reliable results across 99% of the web.

### 11. Maintaining Test Correctness during Refactoring
- **Problem:** Adding required properties to global states (Zustand) or Component Props can break multiple tests with cryptic type errors.
- **Solution:** Always perform a full test run (`npm test`) after modifying Core Types (`PlaybackState`, `Settings`). Update mock state objects in `beforeEach` and default props in test files to match the new interfaces immediately.
- **Learning:** Tests are a "Living Spec". If they aren't updated alongside the code, they lose their value as a safety net.

## Best Practices
- **Transparency Mode:** Providing clear manual setup steps with explanations is often better than a black-box automated script that might fail silently. It builds trust and allows technical users to troubleshoot their own environment.
- **Logging:** Maintaining a scrollable debug log in the UI is invaluable for debugging "invisible" background/native-host background processes.
- **CORS:** Remember that Chrome Extensions have their own origin. Even for `localhost`, ensure the backend CORS policy allows the extension's `chrome-extension://<id>` origin or use `*` for local dev.

## Release & Documentation

### 12. User-Centric Documentation
- **Problem:** Technical documentation often assumes users have prerequisite knowledge (Git, Python, Terminal usage).
- **Solution:** Create a **Prerequisites section** listing all required tools with:
  - Direct download links
  - Installation verification commands
  - Platform-specific instructions (Windows vs macOS)
- **Learning:** Even experienced developers appreciate clear prerequisites when trying new tools. For low-tech users, it's the difference between success and abandonment.

### 13. Contextual Command Instructions
- **Problem:** Users don't know where to run terminal commands or what directory they should be in.
- **Solution:** For every command block:
  - State the working directory explicitly ("Run from project root", "Run from external/narrate-ai-core")
  - Explain what the command does in plain language
  - Provide time estimates for long-running operations
- **Learning:** "Where" is as important as "what" when giving command-line instructions.

### 14. Flexible Path Discovery
- **Problem:** Hardcoding backend folder names (`narrate-ai-core`) breaks when users clone with default repo names or rename folders.
- **Solution:** Implement **multiple fallback paths** in discovery logic:
  ```python
  POSSIBLE_PATHS = [
      "external/narrate-ai-core",
      "external/kokoro-engine", 
      "external/Kokoro-FastAPI",
      "backend"  # legacy
  ]
  ```
- **Learning:** Real-world usage is messier than ideal design. Build resilience through fallbacks.

### 15. Release Package Structure
- **Problem:** Distributing only the built extension leaves users confused about where to put the backend.
- **Solution:** Create a **complete distribution package**:
  - `extension/` - Built Chrome extension
  - `native-host/` - Installation scripts
  - `external/` - Empty folder showing where to clone backend
  - `README.md` - Complete setup guide
- **Learning:** Physical folder structure serves as documentation. An empty `external/` folder communicates intent better than text alone.

### 16. Progressive Disclosure in Troubleshooting
- **Problem:** Users encounter errors but don't know how to debug.
- **Solution:** Add a **Troubleshooting section** to README with:
  - Common error messages as headers
  - Root cause explanation
  - Step-by-step resolution
  - Links to log files for advanced debugging
- **Learning:** Good documentation anticipates failure modes and provides escape hatches.
