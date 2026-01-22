# Active Task: v1.0.1 Release Preparation & Documentation

## Status
- **Current Task:** Rebranding to "Narrate AI" & Release Preparation
- **Start Date:** 2026-01-22
- **Completion Date:** 2026-01-22

## Progress
- [x] **Rebranding**: Renamed project from "Kokoro TTS Extension" to "Narrate AI"
  - Updated `package.json`, `vite.config.ts`, `README.md`, `PRD.md`
  - Updated native host name to `com.narrate.ai.host`
  - Renamed backend directory references to `narrate-ai-core`
  - Updated all UI text and branding elements
- [x] **Backend Discovery Enhancement**:
  - Added fallback paths for multiple backend folder names
  - Improved error messages with detailed path information
  - Added UI warning when backend is missing
- [x] **Documentation Overhaul**:
  - Added comprehensive Prerequisites section
  - Restructured installation guide for end-users vs developers
  - Added detailed step-by-step instructions with context
  - Created Troubleshooting section with common issues
  - Improved usage guide with feature-specific instructions
- [x] **Release Package**:
  - Created distribution structure (extension/, native-host/, external/)
  - Generated `Narrate-AI-v1.0.1.zip` with complete setup
  - Prepared GitHub Release title and description
- [x] **Testing**: All 7 tests passing (5 test files)

## Encountered Issues & Solutions
- **Backend Path Confusion**: Users with different clone names couldn't connect. Fixed by adding multiple fallback paths (`narrate-ai-core`, `kokoro-engine`, `Kokoro-FastAPI`).
- **Low-tech User Barrier**: Original README assumed technical knowledge. Fixed by adding Prerequisites section with download links and verification commands.
- **Missing Context**: Users didn't know where to run commands. Fixed by explicitly stating working directory for each step.

## Learnings
- **User-Centric Documentation**: Even simple commands need context (where to run, what they do, how long they take).
- **Prerequisites Matter**: Listing required tools upfront prevents frustration mid-installation.
- **Flexible Path Discovery**: Hardcoding folder names creates fragility. Multiple fallbacks improve robustness.
- **Release Packaging**: Including empty `external/` folder in ZIP helps users understand project structure.

✅ Done [2026-01-22]
