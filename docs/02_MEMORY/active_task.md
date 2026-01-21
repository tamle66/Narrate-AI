# Active Task: Backend Automation & Integration

## Status
- **Current Task:** Backend Automation and UI Integration
- **Start Date:** 2026-01-21
- **Completion Date:** 2026-01-21

## Progress
- [x] Implement backend auto-installation (git clone, pip install uv) from UI.
- [x] Enhance Native Host to stream live logs of installation and startup.
- [x] Improve robustness of Native Messaging IO (unbuffered, better decoding).
- [x] Fix UI dependencies (Lucide icons instead of Material Symbols).
- [x] Implement Page Scanning logic in Content Script using Readability.
- [x] Implement Context Menu "Read with Kokoro" integration.
- [x] Update Extension Favicon and Player UI with new Logo.
- [x] Implement Audio Engine (useAudio hook) with Smart Pre-fetching (1-segment lookahead).
- [x] Implement Auto-injection for Content Scripts (fixing "Receiving end does not exist").
- [x] Fix Debug Log scaling/scrolling and add live playback logs.
- [x] Add real-time Voice/Speed switching with debounced regeneration.
- [x] Implement "Đọc từ đây..." (Read from selection until end) feature.
- [x] Implement "Smart Formatting" for list markers and block-level pauses (headings/paragraphs).
- [x] Fix Race Condition and Redundant Backend Fetches using AbortController.
- [x] Ensure Player UI persistence after playback completion.
- [x] Implement Real-time Text Highlighting with auto-scroll logic in Content Script.
- [x] Update ReadyView UI with detailed Context Mode instructions.

## Encountered Issues & Solutions
- **Buffering Issue:** Native host logs weren't showing in UI. Fixed by setting `PYTHONUNBUFFERED=1`.
- **Content Script Isolation:** When extension reloads, tab connection is lost. Fixed by adding `scripting` permission and implementing programmatic auto-injection on demand.
- **Autoplay Policy:** Browser blocks audio start without a click. Added a "Permission Overlay" to capture a click if blocked.
- **Backend Hammering:** Rapid setting changes (sliders) crashed backend throughput. Fixed with 500ms debounce.

## Learnings
- **Permissions:** `scripting` and `<all_urls>` are essential for making scan buttons work across random web pages without manual refresh.
- **Segmented Streaming:** Breaking text into sentences and pre-fetching the next one provides a "zero latency" experience for long articles.
- **Tab Selection:** `lastFocusedWindow: true` is more reliable than `currentWindow: true` when querying tabs from a Side Panel context.

✅ Done [2026-01-21]
