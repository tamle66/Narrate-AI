import { useEffect } from 'react';
import { useNativeHost } from './hooks/useNativeHost';
import { useAudio } from './hooks/useAudio';
import { useStore } from './store/useStore';
import { LoadingView } from './components/LoadingView';
import { ReadyView } from './components/ReadyView';
import { PlayerView } from './components/PlayerView';

export default function App() {
    const { status, connect } = useNativeHost();
    const { playback, logs, settings, availableVoices, setPlayback, updateSettings, setAvailableVoices } = useStore();
    const { playText, togglePlay, seek, stop, nextSegment, prevSegment } = useAudio();

    // Fetch voices on startup
    useEffect(() => {
        if (status === 'running') {
            fetch('http://localhost:8880/v1/audio/voices')
                .then(res => res.json())
                .then(data => {
                    if (data.voices) setAvailableVoices(data.voices);
                })
                .catch(err => {
                    const { addLog } = useStore.getState();
                    addLog(`Failed to fetch voices: ${err.message}`);
                });
        }
    }, [status, setAvailableVoices]);

    // Listen for context menu and storage text
    useEffect(() => {
        const { addLog } = useStore.getState();

        const handleMessage = (msg: any) => {
            if (msg.action === 'READ_SELECTION' && msg.text) {
                playText(msg.text, msg.title);
            } else if (msg.action === 'CONTENT_LOG') {
                addLog(`[Content] ${msg.message}`);
            }
        };

        const checkStorage = async () => {
            const data = await chrome.storage.local.get(['lastSelection', 'lastTitle']);
            if (data.lastSelection) {
                const text = data.lastSelection;
                const title = data.lastTitle;
                chrome.storage.local.remove(['lastSelection', 'lastTitle']);
                playText(text, title);
            }
        };

        const handleStorageChange = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes.lastSelection && changes.lastSelection.newValue) {
                const text = changes.lastSelection.newValue;
                // Title might not be in 'changes' if it hasn't changed, so we fetch it if missing
                let title = changes.lastTitle?.newValue;
                if (title === undefined) {
                    const data = await chrome.storage.local.get('lastTitle');
                    title = data.lastTitle;
                }

                chrome.storage.local.remove(['lastSelection', 'lastTitle']);
                playText(text, title);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        chrome.storage.onChanged.addListener(handleStorageChange);
        checkStorage();

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, [playText]);

    const handleScanPage = async () => {
        const { addLog } = useStore.getState();
        try {
            addLog("Scanning active window for tabs...");
            // Query tabs across all windows but prioritize the active one in the last focused window
            const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

            addLog(`Found ${tabs.length} potential active tabs`);

            let targetTab: chrome.tabs.Tab | undefined;

            for (const tab of tabs) {
                const url = tab.url || "";
                if (tab.id && !(url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:'))) {
                    targetTab = tab;
                    break;
                }
            }

            if (!targetTab?.id) {
                addLog("Error: Could not identify a valid active tab to scan.");
                return;
            }

            addLog(`Targeting Tab ID: ${targetTab.id}. Sending scan command...`);

            const sendMessage = async () => {
                return await chrome.tabs.sendMessage(targetTab!.id!, { action: 'GET_PAGE_CONTENT' });
            };

            try {
                const response = await sendMessage();
                if (response && response.text) {
                    addLog(`Success! Title: ${response.title || 'Untitled'}`);
                    playText(response.text, response.title);
                } else {
                    addLog("Warning: Page returned no text content.");
                }
            } catch (msgErr: any) {
                if (msgErr.message.includes('Receiving end does not exist')) {
                    addLog("Content script missing. Finding compiled script...");
                    try {
                        const manifest = chrome.runtime.getManifest();
                        const scriptPath = manifest.content_scripts?.[0]?.js?.[0];

                        if (!scriptPath) {
                            throw new Error("Could not find content script in manifest.");
                        }

                        addLog(`Injecting: ${scriptPath}`);
                        await chrome.scripting.executeScript({
                            target: { tabId: targetTab.id },
                            files: [scriptPath]
                        });

                        addLog("Injection success. Retrying scan...");
                        await new Promise(r => setTimeout(r, 200));
                        const retryResponse = await sendMessage();
                        if (retryResponse && retryResponse.text) {
                            addLog("Scan retry: SUCCESS!");
                            playText(retryResponse.text, retryResponse.title);
                        }
                    } catch (injectErr: any) {
                        addLog(`Injection failed: ${injectErr.message}`);
                        addLog("=> Action: Please F5 (Refresh) the page manually.");
                    }
                } else {
                    addLog(`Message Error: ${msgErr.message}`);
                }
            }
        } catch (err: any) {
            addLog(`Scan error: ${err.message}`);
        }
    }

    // Routing for non-running status
    if (status === 'error' || status === 'stopped' || status === 'starting' || status === 'backend_missing' || status === 'installing') {
        return (
            <div className="flex flex-col h-screen w-full bg-background-dark text-white font-display overflow-hidden">
                <LoadingView
                    status={status}
                    onRetry={connect}
                />
            </div>
        );
    }

    // Main App Layout (Status is 'running')
    return (
        <div className="flex flex-col h-screen w-full bg-background-dark text-white font-display overflow-hidden relative">

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                {playback.isPlaying || playback.currentText || playback.isLoading ? (
                    <div className="flex-1 flex flex-col relative overflow-hidden">
                        <PlayerView
                            title={playback.currentText ? (playback.currentText.length > 50 ? playback.currentText.substring(0, 47) + "..." : playback.currentText) : "Loading..."}
                            isPlaying={playback.isPlaying}
                            isLoading={playback.isLoading}
                            togglePlay={togglePlay}
                            currentTime={playback.currentTime}
                            duration={playback.duration}
                            voice={settings.voice}
                            speed={settings.speed}
                            availableVoices={availableVoices}
                            onSeek={seek}
                            onNext={nextSegment}
                            onPrev={prevSegment}
                            onVoiceChange={(v) => updateSettings({ voice: v })}
                            onSpeedChange={(s) => updateSettings({ speed: s })}
                            onBack={() => {
                                stop();
                                setPlayback({ currentText: '', isPlaying: false, isLoading: false, segments: [], currentSegmentIndex: 0 });
                            }}
                            segments={playback.segments}
                            currentSegmentIndex={playback.currentSegmentIndex}
                        />

                        {playback.isAudioBlocked && (
                            <div
                                className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-primary/95 text-black p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center gap-4 cursor-pointer animate-in fade-in zoom-in duration-300"
                                onClick={togglePlay}
                            >
                                <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center animate-bounce">
                                    <span className="text-2xl">🔊</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg uppercase tracking-tight">Audio Permission Required</h3>
                                    <p className="text-xs font-medium opacity-80 mt-1">Chrome requires a click to start audio. Tap anywhere here to begin.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <ReadyView
                            onScanPage={handleScanPage}
                            onOpenSettings={() => { }}
                            voice={settings.voice}
                            speed={settings.speed}
                            availableVoices={availableVoices}
                            onVoiceChange={(v) => updateSettings({ voice: v })}
                            onSpeedChange={(s) => updateSettings({ speed: s })}
                        />
                    </div>
                )}
            </div>

            {/* Debug Logs Viewer (Always Visible at bottom) */}
            <div className="h-28 bg-black/95 border-t border-white/10 flex flex-col shrink-0 z-[100]">
                <div className="flex justify-between items-center px-2 py-1 bg-white/5 text-[9px] font-bold text-primary/80">
                    <span>LIVE SYSTEM LOGS</span>
                    <button onClick={() => useStore.getState().clearLogs()} className="hover:text-white px-2 py-0.5 rounded bg-white/5 transition-colors">CLEAR</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 text-[9px] font-mono text-gray-400 select-text cursor-auto custom-scrollbar">
                    {logs.slice().reverse().map((log, i) => (
                        <div key={i} className="border-b border-white/5 py-1 last:border-0 break-all leading-tight">
                            <span className="text-white/20 mr-1">[{logs.length - i}]</span> {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
