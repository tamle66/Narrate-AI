import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';

const HOST_NAME = "com.kokoro.tts.host";

export function useNativeHost() {
    const setNativeStatus = useStore((state) => state.setNativeStatus);
    const nativeStatus = useStore((state) => state.nativeStatus);
    const portRef = useRef<chrome.runtime.Port | null>(null);

    const connect = useCallback(() => {
        try {
            if (typeof chrome === 'undefined' || !chrome.runtime?.connectNative) {
                console.warn("Native messaging not supported or chrome API missing");
                return;
            }

            // Avoid reconnecting if already connecting/connected?
            // But port might be closed.
            if (portRef.current) {
                try {
                    portRef.current.disconnect();
                } catch (e) { /**/ }
            }

            const port = chrome.runtime.connectNative(HOST_NAME);
            portRef.current = port;

            // Optimistically set starting, but we don't know yet.
            // setNativeStatus('starting'); 

            port.onMessage.addListener((msg) => {
                console.log("Native msg:", msg);
                if (msg.status === 'running') {
                    setNativeStatus('running');
                } else if (msg.status === 'stopped') {
                    setNativeStatus('stopped');
                } else if (msg.status === 'starting' || msg.status === 'installing') {
                    setNativeStatus(msg.status);
                    if (msg.log) {
                        useStore.getState().addStartupLog(msg.log);
                    }
                } else if (msg.status === 'backend_missing') {
                    setNativeStatus('backend_missing');
                } else if (msg.status === 'error') {
                    console.error("Native Host Error:", msg.message);
                    setNativeStatus('error');
                    if (msg.message) {
                        useStore.getState().addStartupLog("Error: " + msg.message);
                    }
                }
            });

            port.onDisconnect.addListener(() => {
                console.log("Native host disconnected");
                if (chrome.runtime.lastError) {
                    console.error("Runtime Error:", chrome.runtime.lastError.message);
                }
                setNativeStatus('error'); // Or stopped
                portRef.current = null;
            });

            // Initial check
            port.postMessage({ command: 'check_status' });
            // If check_status fails to return, we might be stuck? 
            // In a real app we'd have a timeout.

        } catch (err) {
            console.error("Connect Exception:", err);
            setNativeStatus('error');
        }
    }, [setNativeStatus]);

    useEffect(() => {
        connect();
        return () => {
            portRef.current?.disconnect();
        };
    }, [connect]);

    const sendCommand = useCallback((cmd: string, payload?: Record<string, any>) => {
        if (portRef.current) {
            try {
                portRef.current.postMessage({ command: cmd, ...payload });
            } catch (e) {
                console.error("Send failed", e);
            }
        }
    }, []);

    return { connect, sendCommand, status: nativeStatus };
}
