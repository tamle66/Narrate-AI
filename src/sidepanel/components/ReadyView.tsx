import { MousePointer2, PlayCircle, FileScan, ChevronDown, Settings2 } from 'lucide-react';

interface ReadyViewProps {
    onOpenSettings?: () => void;
    onScanPage: () => void;
    voice: string;
    speed: number;
    availableVoices: string[];
    onVoiceChange?: (voice: string) => void;
    onSpeedChange?: (speed: number) => void;
}

export function ReadyView({
    onScanPage,
    voice,
    speed,
    availableVoices,
    onVoiceChange,
    onSpeedChange
}: ReadyViewProps) {
    return (
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto p-5 scroll-smooth h-full custom-scrollbar">
            {/* System Ready Badge */}
            <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary shadow-[0_0_15px_-3px_rgba(255,107,0,0.15)] uppercase tracking-wider">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                    </span>
                    System Ready
                </div>
            </div>

            {/* Main Action Card */}
            <div className="group relative flex flex-col items-center justify-center rounded-2xl border border-[#2e3238] bg-[#16181b]/70 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:border-primary/40 hover:shadow-neon">
                {/* Corner Accents */}
                <div className="absolute -left-[1px] -top-[1px] h-3 w-3 rounded-tl-lg border-l-2 border-t-2 border-primary/40"></div>
                <div className="absolute -right-[1px] -top-[1px] h-3 w-3 rounded-tr-lg border-r-2 border-t-2 border-primary/40"></div>
                <div className="absolute -bottom-[1px] -left-[1px] h-3 w-3 rounded-bl-lg border-l-2 border-b-2 border-primary/40"></div>
                <div className="absolute -bottom-[1px] -right-[1px] h-3 w-3 rounded-br-lg border-r-2 border-b-2 border-primary/40"></div>

                <div
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-[0_0_20px_-5px_rgba(255,107,0,0.3)] transition-all duration-300"
                >
                    <FileScan size={40} strokeWidth={1.5} />
                </div>

                <h2 className="mt-5 text-center text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                    Sẵn sàng phát
                </h2>
                <p className="mt-2 text-center text-xs text-gray-400 leading-relaxed px-1">
                    Hệ thống đã sẵn sàng. Bấm <span className="text-gray-200 font-medium">Đọc trang hiện tại</span> để bắt đầu.
                </p>

                <div className="mt-6 w-full">
                    <button
                        onClick={onScanPage}
                        className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#2e3238] bg-[#1e2124] py-2.5 text-xs font-bold uppercase tracking-wide text-gray-400 transition-all hover:border-primary/50 hover:bg-[#1e2124]/80 hover:text-white group/btn"
                    >
                        <PlayCircle size={16} className="group-hover/btn:text-primary transition-colors" />
                        Đọc trang hiện tại
                    </button>
                </div>
            </div>

            {/* Configuration Section */}
            <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-2 px-1">
                    <Settings2 size={14} className="text-primary/70" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tùy chỉnh</span>
                    <div className="h-px bg-white/5 flex-1 ml-2"></div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:border-primary/30 hover:bg-white/10 transition-all group relative">
                        <div className="flex flex-col flex-1">
                            <label className="text-[9px] uppercase tracking-wider text-white/40 mb-1">Model giọng nói</label>
                            <div className="text-sm font-medium text-white flex items-center gap-2 relative">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.5)]"></span>
                                <span className="truncate max-w-[150px]">{voice}</span>
                                <select
                                    value={voice}
                                    onChange={(e) => onVoiceChange?.(e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full"
                                >
                                    {availableVoices.map(v => (
                                        <option key={v} value={v} className="bg-background-dark text-white">{v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <ChevronDown size={20} className="text-white/40 group-hover:text-primary transition-colors pointer-events-none" />
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-3 hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] uppercase tracking-wider text-white/40">Tốc độ</label>
                            <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">{speed}x</span>
                        </div>
                        <input
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={speed}
                            onChange={(e) => onSpeedChange?.(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Context Mode Tip */}
            <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-lg bg-[#1e2124]/40 p-3 border border-white/5 hover:border-primary/20 transition-colors">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a2e33] text-primary">
                        <MousePointer2 size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Chế độ Context</h3>
                        <div className="mt-1.5 space-y-2">
                            <p className="text-[11px] text-gray-500 leading-relaxed font-body">
                                Bôi đen văn bản và chuột phải để chọn:
                            </p>
                            <ul className="space-y-1.5">
                                <li className="flex gap-2 items-start">
                                    <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/40"></div>
                                    <span className="text-[10px] leading-tight text-gray-400">
                                        <span className="text-primary font-medium">Đọc đoạn đã chọn</span>: Chỉ đọc phần văn bản bạn vừa bôi đen.
                                    </span>
                                </li>
                                <li className="flex gap-2 items-start">
                                    <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/40"></div>
                                    <span className="text-[10px] leading-tight text-gray-400">
                                        <span className="text-primary font-medium">Đọc từ đây...</span>: Đọc từ vị trí chọn cho đến hết trang web.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Graphic */}
            <div className="mt-auto pt-6 pb-2 opacity-20 flex justify-center items-end pointer-events-none">
                <div className="w-full h-10 relative overflow-hidden rounded-lg">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-30"></div>
                    <div className="flex items-end justify-center gap-[3px] h-full px-8">
                        {/* Fake Equalizer Bars */}
                        {[30, 50, 80, 40, 60, 30, 70, 45, 20, 50, 80, 40, 60, 30].map((h, i) => (
                            <div key={i} className="w-1 bg-primary/50 rounded-t-sm transition-all duration-300" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

