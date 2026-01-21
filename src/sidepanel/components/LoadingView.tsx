import { RefreshCw, Zap, WifiOff, Terminal, ChevronRight, DownloadCloud, HardDriveDownload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useEffect, useRef } from 'react';
import logo from '../store/logo.png';

interface LoadingViewProps {
    status: 'starting' | 'error' | 'stopped' | 'backend_missing' | 'installing';
    onRetry: () => void;
    onStartServer?: () => void;
    onInstall?: () => void;
}

export function LoadingView({ status, onRetry, onStartServer, onInstall }: LoadingViewProps) {
    const startupLogs = useStore((state) => state.startupLogs);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [startupLogs]);

    if (status === 'backend_missing') {
        return (
            <div className="flex flex-col gap-6 p-4 animate-in fade-in zoom-in-95 duration-300">
                <section className="w-full bg-[#181212] rounded-xl border border-white/10 p-0 flex flex-col shadow-lg relative overflow-hidden">
                    <div className="h-1 w-full bg-primary/20" />
                    <div className="p-5 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                            <DownloadCloud className="text-primary" size={24} />
                        </div>
                        <div className="text-center">
                            <h2 className="text-gray-200 text-base font-bold">Install AI Engine</h2>
                            <p className="text-gray-500 text-xs mt-1">
                                Cần tải Kokoro-FastAPI (~200MB) để chạy TTS offline.
                            </p>
                        </div>

                        <div className="p-4 bg-white/[0.02] border-t border-white/5 w-full">
                            <button
                                onClick={onInstall}
                                className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-black font-bold transition-all w-full"
                            >
                                <HardDriveDownload size={18} />
                                <span>Tải & Cài đặt ngay</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        )
    }

    if (status === 'stopped') {
        return (
            <div className="flex flex-col gap-6 p-4 animate-in fade-in zoom-in-95 duration-300">
                <section className="w-full bg-[#181212] rounded-xl border border-white/10 p-0 flex flex-col shadow-lg relative overflow-hidden">
                    <div className="h-1 w-full bg-white/20" />

                    <div className="p-5 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <Terminal className="text-gray-400" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-gray-200 text-base font-bold leading-tight">Server Offline</h2>
                                <span className="text-gray-500 text-xs text-left">Kokoro TTS Engine is stopped</span>
                            </div>
                        </div>

                        <p className="text-gray-400 text-xs leading-relaxed text-left w-full border-l-2 border-white/10 pl-3">
                            Server chưa được khởi động. Nhấn nút bên dưới để bật server.
                        </p>
                    </div>

                    <div className="p-4 bg-white/[0.02] border-t border-white/5">
                        <button
                            onClick={onStartServer || onRetry}
                            className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black hover:border-primary hover:shadow-[0_0_15px_rgba(255,149,0,0.4)] transition-all duration-300 w-full overflow-hidden"
                        >
                            <Zap size={18} className="transition-transform group-hover:scale-110" />
                            <span className="text-sm font-bold tracking-wide">Bật Server Local</span>
                        </button>
                    </div>
                </section>

                {/* Manual Start Hint */}
                <div className="w-full bg-black/40 rounded border border-white/5 p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <Terminal size={14} className="text-gray-600" />
                        Manual Start
                    </div>
                    <code className="text-xs text-gray-400 font-mono bg-[#1a1a1a] px-2 py-1.5 rounded border border-white/10 block w-full select-all cursor-text">
                        &gt; cd backend && start-cpu.ps1
                    </code>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col gap-6 p-4 animate-in fade-in zoom-in-95 duration-300">
                {/* Error Card */}
                <section className="w-full bg-[#181212] rounded-xl border border-error/30 p-0 flex flex-col shadow-[0_0_20px_rgba(255,82,82,0.05)] relative overflow-hidden">
                    <div className="h-1 w-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#FF5252_10px,#FF5252_20px)] opacity-20" />

                    <div className="p-5 flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 shrink-0 rounded-lg bg-error/10 flex items-center justify-center border border-error/20">
                                <WifiOff className="text-error" size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-error text-base font-bold leading-tight">Connection Failed</h2>
                                <span className="text-error/60 text-xs text-left">Local host not found</span>
                            </div>
                        </div>

                        <p className="text-gray-400 text-xs leading-relaxed text-left w-full border-l-2 border-white/10 pl-3">
                            Hệ thống không tìm thấy local host server. Vui lòng kiểm tra lại kết nối.
                        </p>

                        <div className="w-full bg-black/40 rounded border border-white/5 p-3 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                <Terminal size={14} className="text-gray-600" />
                                Run this command
                            </div>
                            <code className="text-xs text-primary font-mono bg-[#2a1e12] px-2 py-1.5 rounded border border-primary/20 block w-full select-all cursor-text hover:border-primary/40 transition-colors">
                                &gt; install_host.bat
                            </code>
                        </div>
                    </div>

                    <div className="p-4 bg-white/[0.02] border-t border-white/5">
                        <button
                            onClick={onRetry}
                            className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black hover:border-primary hover:shadow-[0_0_15px_rgba(255,149,0,0.4)] transition-all duration-300 w-full overflow-hidden"
                        >
                            <RefreshCw size={18} className="transition-transform group-hover:rotate-180" />
                            <span className="text-sm font-bold tracking-wide">Thử lại (Retry)</span>
                        </button>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 animate-in fade-in zoom-in-95 duration-500 h-full">
            {/* System Status Header */}
            <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-mono text-primary/70 uppercase tracking-widest border border-primary/20 px-1.5 py-0.5 rounded">
                    System Status
                </span>
                <div className="h-px bg-white/10 flex-1"></div>
            </div>

            {/* Loading Card */}
            <section className="w-full glass-panel rounded-xl p-6 flex flex-col items-center gap-5 relative overflow-hidden group transition-all duration-300 hover:border-primary/30 shrink-0">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-primary/40 rounded-tl-sm"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-primary/40 rounded-tr-sm"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-primary/40 rounded-bl-sm"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-primary/40 rounded-br-sm"></div>

                <div className="relative mt-2">
                    <div className="w-16 h-16 rounded-full p-0.5 border-2 border-primary/20 animate-pulse">
                        <img src={logo} className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,149,0,0.5)]" alt="Logo" />
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                        <div className="w-5 h-5 bg-background-dark rounded-full flex items-center justify-center border border-primary/30">
                            <Zap className="text-primary w-3 h-3 animate-bounce" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1 text-center w-full">
                    <h2 className="text-white text-lg font-bold tracking-tight">
                        {status === 'installing' ? 'Installing Engine' : 'Initializing Engine'}
                    </h2>
                    <div className="flex items-center gap-2 justify-center">
                        <span className="text-primary text-[10px] font-mono bg-primary/10 px-1 rounded animate-pulse">
                            {status === 'installing' ? '[SETUP_SEQ]' : '[START_SEQ]'}
                        </span>
                        <span className="text-white/40 text-xs">
                            {status === 'installing' ? 'Downloading & Configuring...' : 'Booting AI Model...'}
                        </span>
                    </div>
                </div>
            </section>

            {/* Live Log Terminal */}
            <div className="w-full flex-1 bg-[#0c0c0c] rounded-lg border border-white/10 p-3 flex flex-col overflow-hidden shadow-inner">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                    <Terminal size={12} className="text-gray-500" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Live Logs</span>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-1 pr-2">
                    {startupLogs.length === 0 && (
                        <div className="text-[10px] font-mono text-gray-700 italic">Waiting for process output...</div>
                    )}
                    {startupLogs.map((log, i) => (
                        <div key={i} className="text-[10px] font-mono text-gray-400 break-words leading-tight flex items-start gap-1">
                            <ChevronRight size={10} className="mt-[2px] shrink-0 text-primary/50" />
                            <span>{log}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
    );
}
