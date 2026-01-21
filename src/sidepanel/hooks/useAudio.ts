import { useRef, useCallback, useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useAudio() {
    const { settings, playback } = useStore();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const queueRef = useRef<string[]>([]);
    const currentIndexRef = useRef<number>(0);
    const playbackIdRef = useRef<number>(0);
    const audioCacheRef = useRef<Map<number, HTMLAudioElement>>(new Map());
    const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fetchPromisesRef = useRef<Map<number, Promise<void>>>(new Map());
    const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
    const lastSettingsRef = useRef({ voice: settings.voice, speed: settings.speed });

    const cancelAllFetches = useCallback(() => {
        abortControllersRef.current.forEach(controller => controller.abort());
        abortControllersRef.current.clear();
        fetchPromisesRef.current.clear();
    }, []);

    const fetchSegment = async (index: number, currentPlaybackId: number) => {
        const { settings, addLog } = useStore.getState();
        if (currentPlaybackId !== playbackIdRef.current || index >= queueRef.current.length) return;
        if (audioCacheRef.current.has(index)) return;

        // If already fetching this index...
        if (fetchPromisesRef.current.has(index)) {
            try {
                await fetchPromisesRef.current.get(index);
                if (currentPlaybackId !== playbackIdRef.current) return;
                if (index === currentIndexRef.current && !audioRef.current) {
                    playSegment(index, currentPlaybackId);
                }
            } catch (e) { /* ignore aborted */ }
            return;
        }

        const controller = new AbortController();
        abortControllersRef.current.set(index, controller);

        const fetchPromise = (async () => {
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
                    }),
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const blob = await response.blob();
                if (currentPlaybackId !== playbackIdRef.current) return;

                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audioCacheRef.current.set(index, audio);

                if (index === currentIndexRef.current && !audioRef.current) {
                    playSegment(index, currentPlaybackId);
                }
            } catch (err: any) {
                if (err.name === 'AbortError') return;
                addLog(`Fetch failed for segment ${index + 1}: ${err.message}`);
            } finally {
                abortControllersRef.current.delete(index);
                fetchPromisesRef.current.delete(index);
            }
        })();

        fetchPromisesRef.current.set(index, fetchPromise);
        await fetchPromise;
    };

    const preloadNext = useCallback((currentPlaybackId: number) => {
        const targetFetch = Math.min(currentIndexRef.current + 1, queueRef.current.length - 1);
        if (targetFetch > currentIndexRef.current) {
            fetchSegment(targetFetch, currentPlaybackId);
        }
    }, []);

    const playSegment = useCallback(async (index: number, currentPlaybackId: number) => {
        const { addLog, setPlayback } = useStore.getState();
        if (currentPlaybackId !== playbackIdRef.current) return;

        if (index >= queueRef.current.length) {
            addLog("Finished reading all segments");
            setPlayback({ isPlaying: false, currentTime: 0 }); // Keep currentText to stay in PlayerView
            return;
        }

        const audio = audioCacheRef.current.get(index);
        if (!audio) {
            setPlayback({ isLoading: true, currentTime: 0, duration: 0 });
            fetchSegment(index, currentPlaybackId);
            return;
        }

        addLog(`Playing segment ${index + 1}/${queueRef.current.length}`);

        // Cleanup current playing audio listeners before switching
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current.oncanplaythrough = null;
            audioRef.current.onloadedmetadata = null;
            audioRef.current.ontimeupdate = null;
            audioRef.current.onerror = null;
            // DO NOT set src = '' here because it might be in our cache!
        }

        audioRef.current = audio;
        audio.currentTime = 0; // Ensure it starts from beginning

        const handleReady = () => {
            if (currentPlaybackId !== playbackIdRef.current) return;
            const duration = isFinite(audio.duration) ? audio.duration : 0;
            setPlayback({ isLoading: false, isPlaying: true, currentTime: audio.currentTime, duration });

            audio.play().catch(err => {
                if (err.name === 'NotAllowedError') setPlayback({ isAudioBlocked: true });
            });
        };

        audio.oncanplaythrough = handleReady;
        audio.onloadedmetadata = handleReady;

        audio.onended = () => {
            if (audioCacheRef.current.size > 50) { // Keep up to 50 segments
                const firstKey = audioCacheRef.current.keys().next().value;
                if (firstKey !== undefined) {
                    const oldAudio = audioCacheRef.current.get(firstKey);
                    if (oldAudio) { oldAudio.src = ''; oldAudio.load(); }
                    audioCacheRef.current.delete(firstKey);
                }
            }

            if (currentPlaybackId === playbackIdRef.current) {
                currentIndexRef.current++;
                playSegment(currentIndexRef.current, currentPlaybackId);
                preloadNext(currentPlaybackId);
            }
        };

        audio.ontimeupdate = () => {
            if (currentPlaybackId === playbackIdRef.current) {
                const duration = isFinite(audio.duration) ? audio.duration : 0;
                setPlayback({ currentTime: audio.currentTime, duration });
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

        // If audio is already loaded/ready from cache, play immediately
        if (audio.readyState >= 2) {
            handleReady();
        } else {
            setPlayback({ isLoading: true });
        }
    }, [preloadNext]);

    // Apply settings with DEBOUNCE
    useEffect(() => {
        if (!playback.currentText) return;

        // ONLY trigger if voice or speed actually changed
        if (settings.voice === lastSettingsRef.current.voice && settings.speed === lastSettingsRef.current.speed) {
            return;
        }

        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

        restartTimerRef.current = setTimeout(() => {
            const { addLog } = useStore.getState();
            addLog(`Applying new settings: ${settings.voice} @ ${settings.speed}x`);
            lastSettingsRef.current = { voice: settings.voice, speed: settings.speed };

            const savedIndex = currentIndexRef.current;
            playbackIdRef.current++;
            const newId = playbackIdRef.current;

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.src = '';
                audioRef.current = null;
            }

            audioCacheRef.current.forEach(audio => { audio.pause(); audio.src = ''; audio.load(); });
            audioCacheRef.current.clear();
            cancelAllFetches();

            currentIndexRef.current = savedIndex;
            fetchSegment(savedIndex, newId);
            preloadNext(newId);
        }, 500);

        return () => {
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        };
    }, [settings.voice, settings.speed, playback.currentText, cancelAllFetches]);

    const stop = useCallback(() => {
        const { addLog, setPlayback } = useStore.getState();
        addLog("Audio engine: Stopped");
        playbackIdRef.current++;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current.src = '';
            audioRef.current = null;
        }
        audioCacheRef.current.forEach(audio => { audio.pause(); audio.src = ''; audio.load(); });
        audioCacheRef.current.clear();
        cancelAllFetches();
        queueRef.current = [];
        currentIndexRef.current = 0;
        setPlayback({ isPlaying: false, currentTime: 0, duration: 0, isAudioBlocked: false, isLoading: false, currentText: '' });
    }, [cancelAllFetches]);

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
        setPlayback({ currentText: displayTitle, currentTime: 0, duration: 0, isPlaying: true, isLoading: true });

        addLog(`Starting playback: ${segments.length} segments`);
        fetchSegment(0, myPlaybackId);
        preloadNext(myPlaybackId);
    }, [stop, preloadNext]);

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

    const nextSegment = useCallback(() => {
        if (currentIndexRef.current < queueRef.current.length - 1) {
            const { addLog, setPlayback } = useStore.getState();
            addLog("Skipping to next sentence...");

            playbackIdRef.current++;
            const newId = playbackIdRef.current;
            cancelAllFetches();

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.oncanplaythrough = null;
                audioRef.current = null; // CRITICAL: Clear ref so fetchSegment can trigger playSegment
            }
            currentIndexRef.current++;
            const nextAudio = audioCacheRef.current.get(currentIndexRef.current);
            if (!nextAudio) {
                setPlayback({ isLoading: true, currentTime: 0, duration: 0 });
            }

            playSegment(currentIndexRef.current, newId);
            preloadNext(newId);
        }
    }, [playSegment, preloadNext, cancelAllFetches]);

    const prevSegment = useCallback(() => {
        if (currentIndexRef.current > 0) {
            const { addLog, setPlayback } = useStore.getState();
            addLog("Going back to previous sentence...");

            playbackIdRef.current++;
            const newId = playbackIdRef.current;
            cancelAllFetches();

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current.oncanplaythrough = null;
                audioRef.current = null; // CRITICAL: Clear ref
            }

            currentIndexRef.current--;
            const prevAudio = audioCacheRef.current.get(currentIndexRef.current);
            if (!prevAudio) {
                setPlayback({ isLoading: true, currentTime: 0, duration: 0 });
            }

            playSegment(currentIndexRef.current, newId);
            preloadNext(newId);
        } else if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }
    }, [playSegment, preloadNext, cancelAllFetches]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) audioRef.current.currentTime = time;
    }, []);

    return { playText, togglePlay, stop, seek, nextSegment, prevSegment };
}
