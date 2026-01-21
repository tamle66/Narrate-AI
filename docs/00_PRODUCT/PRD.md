# Product Requirement Document (PRD): Local Kokoro TTS Extension

## 1. Product Overview
A Chromium-based browser extension that integrates with a locally running Kokoro-FastAPI server (via Native Messaging) to provide high-quality Neural Text-to-Speech (TTS) capabilities. The extension uses a Side Panel interface for persistent playback and control across tabs.

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
**I want** to highlight text, right-click, and select "Read with Kokoro",
**So that** the Side Panel opens and immediately reads the selected text.

### US-03: Read Article (Reader Mode)
**As a** user,
**I want** to click a button in the Side Panel to parse the current page's main content,
**So that** I can listen to a clutter-free version of the article.

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
- **Karaoke Mode:** **Deferred**. MVP will not support word-level highlighting.
- **Audio Stream:** Extension fetches audio blob/stream from `localhost:8880` and plays via HTML5 Audio in the Side Panel context.

## 5. Design Guidelines (Premium UI)
- **Framework:** React + TailwindCSS (Shadcn/UI compatible styling).
- **Aesthetics:**
  - Glassmorphism details for the Side Panel background.
  - Smooth transitions/animations for Play/Pause states.
  - Waveform visualization during playback (if possible via Web Audio API).
- **Dark Mode:** Default supported.
