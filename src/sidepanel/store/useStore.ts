import { create } from 'zustand';

export type NativeStatus = 'stopped' | 'starting' | 'running' | 'error' | 'backend_missing' | 'installing';

export interface Settings {
    voice: string;
    speed: number;
    autoStart: boolean;
}

export interface PlaybackState {
    isPlaying: boolean;
    isLoading: boolean;
    currentText: string;
}

interface StoreState {
    nativeStatus: NativeStatus;
    startupLogs: string[];
    settings: Settings;
    playback: PlaybackState;

    setNativeStatus: (status: NativeStatus) => void;
    addStartupLog: (log: string) => void;
    clearStartupLogs: () => void;
    updateSettings: (settings: Partial<Settings>) => void;
    setPlayback: (playback: Partial<PlaybackState>) => void;
}

export const useStore = create<StoreState>((set) => ({
    nativeStatus: 'stopped',
    startupLogs: [],
    settings: {
        voice: 'af_bella',
        speed: 1.0,
        autoStart: true
    },
    playback: {
        isPlaying: false,
        isLoading: false,
        currentText: ''
    },

    setNativeStatus: (status) => set({ nativeStatus: status }),
    addStartupLog: (log) => set((state) => ({
        startupLogs: [...state.startupLogs, log].slice(-50) // Keep last 50 lines
    })),
    clearStartupLogs: () => set({ startupLogs: [] }),
    updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
    })),
    setPlayback: (newPlayback) => set((state) => ({
        playback: { ...state.playback, ...newPlayback }
    }))
}));
