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
    currentTime: number;
    duration: number;
    isAudioBlocked: boolean; // For autoplay policy
}

interface StoreState {
    nativeStatus: NativeStatus;
    startupLogs: string[];
    logs: string[]; // App logs
    settings: Settings;
    playback: PlaybackState;

    availableVoices: string[];
    setNativeStatus: (status: NativeStatus) => void;
    setAvailableVoices: (voices: string[]) => void;
    addStartupLog: (log: string) => void;
    addLog: (log: string) => void;
    clearLogs: () => void; // New
    clearStartupLogs: () => void;
    updateSettings: (settings: Partial<Settings>) => void;
    setPlayback: (playback: Partial<PlaybackState>) => void;
}

export const useStore = create<StoreState>((set) => ({
    nativeStatus: 'stopped',
    startupLogs: [],
    logs: [],
    settings: {
        voice: 'af_bella',
        speed: 1.0,
        autoStart: true
    },
    playback: {
        isPlaying: false,
        isLoading: false,
        currentText: '',
        currentTime: 0,
        duration: 0,
        isAudioBlocked: false
    },
    availableVoices: ['af_bella', 'af_sky', 'am_adam', 'bf_emma', 'bf_isabella'],

    setNativeStatus: (status) => set({ nativeStatus: status }),
    setAvailableVoices: (voices) => set({ availableVoices: voices }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log].slice(-50) })),
    clearLogs: () => set({ logs: [] }), // New
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
