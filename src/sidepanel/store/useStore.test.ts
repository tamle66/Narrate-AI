import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { useStore } from './useStore';

describe('useStore', () => {
    beforeEach(() => {
        useStore.setState({
            nativeStatus: 'stopped',
            settings: { voice: 'af_bella', speed: 1.0, autoStart: true },
            playback: {
                isPlaying: false,
                isLoading: false,
                currentText: '',
                currentTime: 0,
                duration: 0,
                isAudioBlocked: false,
                segments: [],
                currentSegmentIndex: 0
            }
        });
    });

    it('should update native status', () => {
        const { setNativeStatus } = useStore.getState();
        act(() => {
            setNativeStatus('running');
        });
        expect(useStore.getState().nativeStatus).toBe('running');
    });

    it('should update settings', () => {
        const { updateSettings } = useStore.getState();
        act(() => {
            updateSettings({ speed: 1.2 });
        });
        expect(useStore.getState().settings.speed).toBe(1.2);
        expect(useStore.getState().settings.voice).toBe('af_bella'); // preserves other
    });
});
