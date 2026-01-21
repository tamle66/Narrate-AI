# Technical Implementation Plan: Kokoro TTS Extension

## 1. Overview & Architecture

This project implements a Chrome Extension that interfaces with a local Python-based Kokoro TTS server using Native Messaging for process management and HTTP for audio inference.

### Core Architecture
```mermaid
graph TD
    subgraph "Chrome Browser"
        CS[Content Script] -- "Extract Text" --> BG[Background Service]
        SP[Side Panel (React)] -- "Control / Play" --> BG
        SP -- "Fetch Audio" --> KS[Kokoro Server (HTTP)]
        BG -- "Native Msg" --> NM[Native Host]
    end
    
    subgraph "Local OS"
        NM[Python Native Host] -- "Spawn/Check" --> KS[Kokoro FastAPI Server]
    end
```

### Technology Stack
- **Build Tool:** Vite + CRXJS (for HMR and streamlined manifest handling).
- **Frontend Framework:** React + TypeScript.
- **Styling:** TailwindCSS (Vanilla CSS for custom animations).
- **Permissions:** `sidePanel`, `nativeMessaging`, `storage`, `contextMenus`, `scripting`, `<all_urls>`.
- **State Management:** Zustand (for global playback state, logs, and settings).
- **Audio:** HTML5 `<audio>` element with segmented streaming and 1-segment pre-fetching.
- **Middleware:** Python `native_host.py` script.
- **Backend:** Kokoro-FastAPI (local inference).

## 2. File Structure

```
TTS-Extension/
├── src/
│   ├── assets/                 # Icons, static images
│   ├── background/             # Service Worker
│   │   └── index.ts            # Native messaging & context menu logic
│   ├── content/                # Content Scripts
│   │   ├── index.ts            # Entry point
│   │   └── parser.ts           # @mozilla/readability wrapper
│   ├── sidepanel/              # React App for Side Panel
│   │   ├── components/         # UI Components (Player, Settings)
│   │   ├── hooks/              # Custom hooks (useAudio, useNativeHost)
│   │   ├── store/              # Zustand stores
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── shared/                 # Shared types/utils
│   │   ├── types.ts
│   │   └── messaging.ts
│   └── manifest.json
├── native-host/                # Native Messaging Implementation
│   ├── host_manifest.json      # Chrome Native Messaging Manifest
│   ├── install_host.bat        # Installer script (Windows)
│   └── kokoro_host.py          # Python script to manage Kokoro server
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 3. Data Models & API Contracts

### 3.1. Shared Types (`src/shared/types.ts`)

```typescript
// Playback State
export interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  currentText: string;
  sourceUrl: string;
}

// User Settings
export interface Settings {
  voice: string;        // e.g., 'af_bella'
  speed: number;        // e.g., 1.0
  autoStart: boolean;   // Auto-launch native host
}

// Message Protocol (Extension Internal)
export type ExtensionMessage = 
  | { type: 'READ_SELECTION'; text: string }
  | { type: 'READ_PAGE_CONTENT'; html: string }
  | { type: 'CHECK_SERVER_STATUS' }
  | { type: 'SERVER_STATUS_UPDATE'; status: 'running' | 'stopped' | 'starting' };
```

### 3.2. Native Messaging Protocol (Stdin/Stdout)

**Request (Extension -> Host):**
```json
{ "command": "start_server" }
{ "command": "stop_server" }
{ "command": "check_status" }
```

**Response (Host -> Extension):**
```json
{ "status": "running", "pid": 1234, "port": 8880 }
{ "status": "stopped" }
{ "status": "error", "message": "Failed to launch" }
```

### 3.3. Kokoro API Integration
- **Endpoint:** `POST http://localhost:8880/v1/audio/speech`
- **Body:**
  ```json
  {
    "input": "Text to speak",
    "voice": "af_bella",
    "speed": 1.0,
    "response_format": "mp3"
  }
  ```
- **Response:** Binary Audio Stream (Blob).

## 4. Component Structure (Side Panel)

- **`App`**: Main layout, manages views (Idle vs Player).
  - **`Header`**: Logo and Connection Status Badge.
  - **`MainView`**:
    - **`ReadPageButton`**: Triggers content script parsing.
    - **`InstructionText`**: Helper text.
  - **`PlayerView`**:
    - **`TrackInfo`**: Title scrolling.
    - **`WaveformVisualizer`**: (Optional) Canvas animation.
    - **`Controls`**: Play/Pause, Skip buttons.
    - **`ProgressBar`**: Range slider.
    - **`SettingsPanel`**: Collapsible section for Voice/Speed.

## 5. Implementation Checklist

### Phase 1: Foundation & Build Setup
- [x] Initialize Vite project with React + TypeScript.
- [x] Install `crxjs` and configure `vite.config.ts` for Extension build.
- [x] Setup TailwindCSS.
- [x] Create basic `manifest.json`.

### Phase 2: Native Host & Background Services
- [x] Write `native-host/kokoro_host.py` to handle logic (check port 8880, spawn subprocess).
- [x] Write `native-host/install_host.bat` (Registry keys for Windows).
- [x] Implement `background/index.ts` to communicate with Native Host.
- [x] Implement Context Menu "Read with Kokoro".

### Phase 3: Side Panel UI & Logic
- [x] Build UI Layout (Header, Player, Settings) using Glassmorphism styles.
- [x] Implement `useNativeHost` hook to sync server status.
- [x] Implement `useAudio` hook with Smart Pre-fetching logic.
- [x] Connect Settings to Zustand/Storage.

### Phase 4: Content Script & Integration
- [x] Implement `@mozilla/readability` with layout-aware extraction.
- [x] Wire up "Read Page" button with Auto-injection fallback.
- [x] Handle message passing: Selection -> Background -> Side Panel -> Auto Play.

### Phase 5: Testing & Polish
- [x] Test end-to-end flow: Select text -> Auto-open Side Panel -> Auto-start Server -> Play.
- [x] Handle error states (Content script missing, Audio blocked).
- [x] Optimize playback seamlessness with 1-segment lookahead and settings debouncing.

## 6. Technical Notes

- **CORS:** The extension manifest must declare host permissions for `http://localhost:8880/*`.
- **Audio Persistence:** The `sidepanel` document persists as long as the side panel is open. If the user closes the panel, audio stops. This is expected behavior.
- **Security:** Native Messaging Host must validate the Extension ID in the manifest to prevent unauthorized access from other extensions.
