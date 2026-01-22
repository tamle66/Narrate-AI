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
        SP -- "Status Polling" --> KS
    end
    
    subgraph "Local OS (Terminal / PowerShell)"
        NM[User Console] -- "Manual Start" --> KS[Kokoro FastAPI Server]
    end
```

### Technology Stack
- **Build Tool:** Vite + CRXJS (for HMR and streamlined manifest handling).
- **Frontend Framework:** React + TypeScript.
- **Styling:** Vanilla CSS (Tailwind with custom design system).
- **Setup Mode:** **Transparent Manual Setup** (UI-driven instructions for Terminal setup with Windows/macOS auto-detection).
- **State Management:** Zustand (for global playback state, logs, and settings).
- **Audio:** HTML5 `<audio>` element with segmented streaming and 1-segment pre-fetching.
- **Backend:** Kokoro-FastAPI (local inference via Python/UV).
- **Compatibility:** Optimized for Windows (NVIDIA GPU/CPU) and macOS (Apple Silicon M-series/CPU).

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
    - **`Focused Display`**: Large, centered display of the currently spoken sentence (Karaoke-style).
    - **`Visualizer`**: Animated equalizer/glow responding to playback state.
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

### Phase 5: Optimization & Transparency
- [x] Pivot to **Manual Setup UI** to improve installation success rate (bypass C++ build errors).
- [x] Implement **Cross-platform support** with adaptive instructions for macOS (Intel/Silicon) and Windows.
- [x] Implement **Transparency Logs** and step-by-step PowerShell/Terminal instructions.
- [x] Finalize **Focused Player UI** (Karaoke-style sentence highlighting).
- [x] Integrate **Custom Branding** with primary orange theme and sleek dark-mode scrollbars.
- [x] Enhance Content Extraction for complex sites (VietnamNet, Coursera, News).
- [x] Optimize playback seamlessness with 1-segment lookahead and settings debouncing.

## 6. Technical Notes

- **CORS:** The extension manifest must declare host permissions for `http://localhost:8880/*`.
- **Audio Persistence:** The `sidepanel` document persists as long as the side panel is open. If the user closes the panel, audio stops. This is expected behavior.
- **Security:** Native Messaging Host must validate the Extension ID in the manifest to prevent unauthorized access from other extensions.
