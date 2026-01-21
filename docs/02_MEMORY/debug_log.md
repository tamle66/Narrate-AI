# Debug Log

## Issue: Unused React Import in Test Files preventing Build
- **Date:** 2026-01-21
- **Severity:** High (Blocker)
- **Description:** `tsc` fails during build because `React` is imported but not used in test files. This is due to `jsx: react-jsx` config which auto-imports React runtime, making explicit import redundant and flagged by `noUnusedLocals`.
- **Affected Files:**
  - `src/sidepanel/components/LoadingView.test.tsx`
  - `src/sidepanel/components/ReadyView.test.tsx`
  - `src/sidepanel/components/PlayerView.test.tsx`
- **Root Cause:** TypeScript strict mode `noUnusedLocals` + `vite` React plugin auto-injection conflict.
- **Solution:** Remove `import React from 'react';` from all test files.
- **Status:** Resolved

## Issue: IDE Reports "Cannot find module" for .tsx imports
- **Date:** 2026-01-21
- **Severity:** Low (DX annoyance)
- **Description:** VSCode TS server complains about importing `.tsx` files without extension when `allowImportingTsExtensions` is true, or due to configuration specifics.
- **Solution:** Added explicit `.tsx` extension to imports in test files (e.g., `import { LoadingView } from './LoadingView.tsx'`).
- **Status:** Resolved

## Issue: Native Host Connection Failed after Installation
- **Date:** 2026-01-21
- **Severity:** High (Blocker)
- **Description:** User installed the native host via `install_host.bat` (successful registry addition), but Chrome extension still fails to connect.
- **Hypothesis:**
  1. Python script crashing silently (syntax error, missing module).
  2. Protocol violation (printing to stdout instead of binary stream).
  3. Environment path issues (python not in path for the spawned process?).
- **Action Plan:**
  1. Add file logging to `kokoro_host.py` to trace execution startup and errors.
  2. Verify no stray `print()` calls exist.
- **Status:** Resolved (Implemented file logging, verified stdio protocol).

## Issue: Redundant Backend Requests (Hammering CPU)
- **Date:** 2026-01-21
- **Severity:** Medium (Performance/Efficiency)
- **Description:** Backend logs showed multiple identical `POST /v1/audio/speech` requests for the same text segments, leading to 100% CPU spikes and slow audio generation.
- **Root Cause:** 
  1. **Double Triggering:** `playText` initiated fetching, but the `useEffect` in `useAudio` (watching `currentText` and `settings`) also triggered 500ms later, starting a second identical session.
  2. **No Cancellation:** When switching segments rapidly (Next/Prev) or changing settings, old pending fetch requests were never cancelled; they continued to run and hammer the backend even if their results were no longer needed.
- **Solution:** 
  1. **Settings Guard:** Refined `useEffect` to only trigger if `settings.voice` or `settings.speed` actually changed, ignoring the article change already handled by `playText`.
  2. **AbortController:** Implemented `AbortController` in `fetchSegment` to cancel all pending HTTP requests immediately when a playback session resets (stop, jump, settings change).
- **Status:** Resolved
