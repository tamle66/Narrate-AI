import { useEffect } from 'react';
import { useNativeHost } from './hooks/useNativeHost';
import { useStore } from './store/useStore';
import { LoadingView } from './components/LoadingView';
import { ReadyView } from './components/ReadyView';
import { PlayerView } from './components/PlayerView';

export default function App() {
    const { status, sendCommand, connect } = useNativeHost();
    const { playback, setPlayback } = useStore();

    // Listen for context menu and storage text
    useEffect(() => {
        const handleMessage = (msg: any) => {
            if (msg.action === 'READ_SELECTION' && msg.text) {
                setPlayback({ isPlaying: true, currentText: msg.text });
                sendCommand('speak', { text: msg.text });
            }
        };

        const checkStorage = async () => {
            const data = await chrome.storage.local.get('lastSelection');
            if (data.lastSelection) {
                const text = data.lastSelection;
                // Clear storage immediately so it doesn't replay on manual reload
                chrome.storage.local.remove('lastSelection');

                setPlayback({ isPlaying: true, currentText: text });
                sendCommand('speak', { text: text });
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        checkStorage();

        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, [setPlayback, sendCommand]);

    // Routing logic
    if (status === 'error' || status === 'stopped' || status === 'starting' || status === 'backend_missing' || status === 'installing') {
        return (
            <div className="flex flex-col h-screen w-full bg-background-dark text-white font-display overflow-hidden">
                <LoadingView
                    status={status}
                    onRetry={connect}
                    onStartServer={() => sendCommand('start_server')}
                    onInstall={() => sendCommand('install_backend')}
                />
            </div>
        );
    }

    // Status is 'running'
    if (playback.isPlaying || playback.currentText) {
        return (
            <div className="flex flex-col h-screen w-full bg-background-dark text-white font-display overflow-hidden key-player">
                <PlayerView
                    title={playback.currentText.substring(0, 30) || "Unknown Track"}
                    isPlaying={playback.isPlaying}
                    togglePlay={() => setPlayback({ isPlaying: !playback.isPlaying })}
                    currentTime={0} // TODO: hook up to audio
                    duration={100}  // TODO: hook up to audio
                />
            </div>
        )
    }

    const handleScanPage = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) return;

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'GET_PAGE_CONTENT' });
            if (response && response.text) {
                console.log("Got text:", response.text.substring(0, 50));
                // Start Playing
                setPlayback({ isPlaying: true, currentText: response.text });
                sendCommand('speak', { text: response.text });
            } else {
                console.warn("No text found or content script not ready");
            }
        } catch (err) {
            console.error("Scan error:", err);
        }
    }

    return (
        <div className="flex flex-col h-screen w-full bg-background-dark text-white font-display overflow-hidden key-ready">
            <ReadyView
                onScanPage={handleScanPage}
                onOpenSettings={() => { }}
            />
        </div>
    );
}
