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
- [x] Implement Audio Engine (useAudio hook) for fetching and playing TTS.

## Encountered Issues & Solutions
- **Buffering Issue:** Native host logs weren't showing in UI. Fixed by setting `PYTHONUNBUFFERED=1` and using raw byte reading in Python.
- **Build Errors:** Pyopenjtalk failed build on Windows due to lack of C++ compiler. Fixed by modifying `pyproject.toml` to exclude `ja` (Japanese) misaki dependency.
- **Relative Portability:** Used `os.path.dirname(__file__)` to ensure setup scripts find correct paths regardless of where they are called.

## Learnings
- Chrome Native Messaging length header is 4 bytes Little Endian; manually typing messages in terminal fails because terminal input is interpreted as length bytes.
- `crxjs` handles `vite.config.ts` manifest updates automatically on build.
