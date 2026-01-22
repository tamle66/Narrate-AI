# Product Requirement Document (PRD): Narrate AI

## 1. Product Overview
A Chromium-based browser extension that integrates with a locally running AI engine (Narrate AI Core) to provide high-quality Neural Text-to-Speech (TTS) capabilities. The extension uses a Side Panel interface for persistent playback and control across tabs.

## 2. Core Architecture
- **Control Strategy:** Strategy 1B (Native Messaging with Auto-Start).
- **Frontend (Extension):**
  - **Framework:** Vite + React + TailwindCSS.
  - **Type:** Manifest V3.
  - **UI Components:**
    - **Side Panel:** Main controller (Play/Pause, History, Settings). Persistent interface.
    - **Context Menu:** Quick triggers ("Read Selection").
- **Middleware (Native Host):**
  - **Runtime:** Native Python (via `uv` or direct python execution).
  - **Function:** Launches the Kokoro API server on demand if not running.
- **Backend (Kokoro-FastAPI):**
  - Standard Kokoro-FastAPI instance running on `localhost:8880`.

## 3. User Stories

### US-01: Auto-Start Server
**As a** user,
**I want** the local TTS server to start automatically when I open the side panel or request reading,
**So that** I get an instant experience without managing terminal windows.

### US-02: Read Selection
**As a** user,
**I want** to highlight text and select "Đọc đoạn đã chọn",
**So that** only the highlighted text is read.

### US-07: Read from Here
**As a** user,
**I want** to highlight a sentence and select "Đọc từ đây với Kokoro",
**So that** the system starts reading from that point onward until the end of the article.

### US-03: Read Article (Reader Mode)
**As a** user,
**I want** to click a button in the Side Panel to parse the current page's main content,
**So that** I can listen to a clutter-free version of the article.

### US-06: Segment Navigation
**As a** user,
**I want** to jump forward to the next sentence or back to the previous one,
**So that** I can easily skip boring parts or re-listen to specific sentences without using a tiny seeker bar.

### US-04: Side Panel Control
**As a** user,
**I want** a persistent Side Panel player,
**So that** I can keep listening to the audio while navigating to other tabs or scrolling down.

### US-05: Configure Voice & Speed
**As a** user,
**I want** to select voices (e.g., af_bella) and adjust speed in the Side Panel settings,
**So that** I can customize the listening experience.

## 4. Technical Constraints & Decisions
- **Server:** Native Python process. User must have Python environment ready. Extension installer/script will handle Native Host registration.
- **Audio Management:**
  - **Segmentation:** Input text is split into segments (sentences) based on punctuation (`.`, `!`, `?`, `\n`).
  - **Pre-fetching:** The system automatically pre-fetches the *next* segment while the current one is playing.
  - **Caching:** Maintain a memory cache of up to 50 segments.
    - **Back Navigation:** Must be instant (Zero-latency) if the segment is in cache.
    - **Cleanup:** Cache is cleared only on Voice/Speed changes or manual "Stop".
  - **Session Isolation:** Each navigation action increments a `playbackId` to prevent race conditions from overlapping async fetches.

## 5. Design Guidelines (Premium UI)
- **Framework:** React + TailwindCSS.
- **Aesthetics:**
  - Glassmorphism details for the Side Panel background.
  - Smooth transitions/animations for Play/Pause states.
  - Waveform visualization during playback (if possible via Web Audio API).
  - **Player Controls:** Use `SkipBack` and `SkipForward` icons to represent sentence jumping.
- **Dark Mode:** Default supported.

## 6. Questions & Clarifications (Refinement Phase)

### Edge Cases
- **Q: What happens if user clicks "Next" while the next segment is still loading?**
  - **A:** The UI shows a loading state, the previous fetch is awaited, and playback starts immediately upon completion.
- **Q: What happens if user clicks "Back" at the very first sentence?**
  - **A:** The current (first) sentence restarts from 0.0s.
- **Q: Rapid Clicking:** How to handle 5 clicks in 1 second?
  - **A:** The `playbackId` increments on every click, effectively cancelling the "play-on-finish" logic of all previous intermediate segments. Only the final target segment will actually start playing.

### UX Improvements
- **Proposed:** Add keyboard shortcuts (Left/Right arrow) for segment jumping when the side panel is focused.
- **Proposed:** Visual indicator (e.g., a small list or "Segment 5/12") to show progress through the text blocks.
- **Proposed:** Progress bar should represent the *entire* text duration, not just the current segment. (Current implementation is per-segment, consider consolidating).

## 7. Refined User Stories (Acceptance Criteria)

### US-06: Precise Navigation
- **AC 1:** Clicking "Next" skips the current sentence and starts the next one immediately.
- **AC 2:** Clicking "Back" during a sentence (after first 2s) restarts the current sentence.
- **AC 3:** Clicking "Back" twice quickly (or at start of sentence) goes to the previous sentence.
- **AC 4:** Navigation must not "hang" or stop playback if the target segment is already cached.

### US-07: Content Extraction & Continuity
- **AC 1:** Selecting "Đọc từ đây..." must extract text starting from the selection range until the end of the container (article/main/body).
- **AC 2:** List indices and bullet points must be preserved or injected (e.g., "1.", "2.") during extraction.
- **AC 3:** Proper punctuation (periods) must be injected between block-level elements (headings, list items) to ensure natural pauses.
- **AC 4:** The player must not return to the Home view after playback finishes if `currentText` is present.
