import { useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

export function useAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const queueRef = useRef<string[]>([]);
    const currentIndexRef = useRef<number>(0);
    const fetchIndexRef = useRef<number>(0);
    const playbackIdRef = useRef<number>(0);
    const audioCacheRef = useRef<Map<number, HTMLAudioElement>>(new Map());
    const isFetchingRef = useRef<Set<number>>(new Set());

    const stop = useCallback(() => {
        const { addLog, setPlayback } = useStore.getState();
        addLog("Audio engine: Stopped");

        playbackIdRef.current++;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }

        // Cleanup cache
        audioCacheRef.current.forEach(audio => {
            audio.pause();
            audio.src = '';
        });
        audioCacheRef.current.clear();
        isFetchingRef.current.clear();

        queueRef.current = [];
        currentIndexRef.current = 0;
        fetchIndexRef.current = 0;

        setPlayback({ isPlaying: false, currentTime: 0, duration: 0, isAudioBlocked: false, isLoading: false, currentText: '' });
    }, []);

    const fetchSegment = async (index: number, currentPlaybackId: number) => {
        const { settings, addLog } = useStore.getState();

        if (currentPlaybackId !== playbackIdRef.current || index >= queueRef.current.length) return;
        if (audioCacheRef.current.has(index) || isFetchingRef.current.has(index)) return;

        isFetchingRef.current.add(index);
        const text = queueRef.current[index];

        try {
            const response = await fetch('http://localhost:8880/v1/audio/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: text,
                    voice: settings.voice,
                    speed: settings.speed,
                    response_format: 'mp3'
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();

            if (currentPlaybackId !== playbackIdRef.current) return;

            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioCacheRef.current.set(index, audio);

            // Trigger playback if this is the current index and we were waiting
            if (index === currentIndexRef.current && !audioRef.current) {
                playSegment(index, currentPlaybackId);
            }
        } catch (err: any) {
            addLog(`Preload failed for segment ${index + 1}: ${err.message}`);
        } finally {
            isFetchingRef.current.delete(index);
        }
    };

    const preloadNext = useCallback((currentPlaybackId: number) => {
        // Preload up to 2 segments ahead
        const targetFetch = Math.min(currentIndexRef.current + 2, queueRef.current.length - 1);
        for (let i = currentIndexRef.current; i <= targetFetch; i++) {
            fetchSegment(i, currentPlaybackId);
        }
    }, []);

    const playSegment = useCallback(async (index: number, currentPlaybackId: number) => {
        const { addLog, setPlayback } = useStore.getState();

        if (currentPlaybackId !== playbackIdRef.current) return;

        if (index >= queueRef.current.length) {
            addLog("Finished reading all segments");
            setPlayback({ isPlaying: false });
            return;
        }

        const audio = audioCacheRef.current.get(index);

        if (!audio) {
            addLog(`Waiting for segment ${index + 1}...`);
            setPlayback({ isLoading: true });
            fetchSegment(index, currentPlaybackId); // Ensure it's being fetched
            return;
        }

        addLog(`Playing segment ${index + 1}/${queueRef.current.length}`);
        audioRef.current = audio;

        audio.oncanplaythrough = () => {
            if (currentPlaybackId !== playbackIdRef.current) return;
            setPlayback({ isLoading: false, isPlaying: true });
            audio.play().catch(err => {
                if (err.name === 'NotAllowedError') {
                    addLog("Autoplay blocked - user interaction needed");
                    setPlayback({ isAudioBlocked: true });
                }
            });
        };

        audio.onended = () => {
            audioCacheRef.current.delete(index);
            if (currentPlaybackId === playbackIdRef.current) {
                currentIndexRef.current++;
                playSegment(currentIndexRef.current, currentPlaybackId);
                preloadNext(currentPlaybackId); // Keep preloading ahead
            }
        };

        audio.ontimeupdate = () => {
            if (currentPlaybackId === playbackIdRef.current) {
                setPlayback({ currentTime: audio.currentTime, duration: audio.duration });
            }
        };

        audio.onerror = () => {
            addLog(`Segment ${index + 1} error, skipping...`);
            audioCacheRef.current.delete(index);
            if (currentPlaybackId === playbackIdRef.current) {
                currentIndexRef.current++;
                playSegment(currentIndexRef.current, currentPlaybackId);
            }
        };

        // Start playback if already loaded
        if (audio.readyState >= 3) {
            setPlayback({ isLoading: false, isPlaying: true });
            audio.play().catch(() => { });
        }

    }, [preloadNext]);

    const playText = useCallback(async (text: string, title?: string) => {
        if (!text) return;
        const { addLog, setPlayback } = useStore.getState();

        stop();
        const myPlaybackId = playbackIdRef.current;

        const segments = text
            .split(/([.!?\n]+)/)
            .reduce((acc: string[], cur, i) => {
                if (i % 2 === 0) { if (cur.trim()) acc.push(cur); }
                else { if (acc.length > 0) acc[acc.length - 1] += cur; }
                return acc;
            }, [])
            .map(s => s.trim())
            .filter(s => s.length > 0);

        if (segments.length === 0) return;

        queueRef.current = segments;
        currentIndexRef.current = 0;
        const displayTitle = title || segments[0].substring(0, 50);

        setPlayback({
            currentText: displayTitle,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
            isLoading: true
        });

        addLog(`Processing ${segments.length} segments with pre-fetching...`);
        preloadNext(myPlaybackId);
        playSegment(0, myPlaybackId);
    }, [stop, playSegment, preloadNext]);

    const togglePlay = useCallback(async () => {
        const { setPlayback, playback } = useStore.getState();
        if (audioRef.current) {
            if (playback.isPlaying && !playback.isAudioBlocked) {
                audioRef.current.pause();
                setPlayback({ isPlaying: false });
            } else {
                try {
                    await audioRef.current.play();
                    setPlayback({ isPlaying: true, isAudioBlocked: false });
                } catch (e: any) {
                    if (e.name === 'NotAllowedError') setPlayback({ isAudioBlocked: true });
                }
            }
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) audioRef.current.currentTime = time;
    }, []);

    return { playText, togglePlay, stop, seek };
}
