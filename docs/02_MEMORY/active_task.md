# Active Task: UI/UX Refinement & Cross-Platform Support

## Status
- **Current Task:** Multi-OS Support & Premium UI Polish
- **Start Date:** 2026-01-22
- **Completion Date:** 2026-01-22

## Progress
- [x] Implement **Cross-platform Setup Guide** (Auto-detecting & Toggle for Windows/macOS).
- [x] Add macOS-specific instructions for **Apple Silicon (M1/M2/M3)** optimization.
- [x] Refine **Karaoke Player UI** (Centered text, responsive layout, fixed overlaps).
- [x] Implement **Premium Custom Scrollbars** (Ultra-thin, primary orange theme, active glow).
- [x] Enhance **Content Extraction logic**: 
    - Fixed VietnamNet extraction (Dual-strategy Readability/Fallback).
    - Multi-selector support for various news/learning platforms.
- [x] Fix **Player View responsive issues** (preventing title coverage in wide windows).
- [x] Polish **Transparency Logs** with better contrast and visibility.

## Encountered Issues & Solutions
- **Responsive Overlap:** Wide windows caused the text box to cover the title. Fixed by applying `max-h-64` and `flex-shrink-0`.
- **Visibility:** Default scrollbars were hard to see in dark mode. Fixed by using high-contrast primary orange thumb.
- **macOS Complexity:** Shell commands for stopping processes differ from PowerShell. Added specific `kill -9 $(lsof -t -i:8880)` instructions.

## Learnings
- **User Agency:** Providing an OS toggle builds confidence even if auto-detection works perfectly.
- **Scrollbar as UI Element:** Custom scrollbars aren't just for utility; they contribute heavily to the "premium" feel of a dark-themed app.
- **Flexible Aspect Ratios:** Hardcoded aspect ratios (like 4/3) can break layouts in resizable containers like Side Panels. Prefer `min-h` + `max-h`.

✅ Done [2026-01-22]
