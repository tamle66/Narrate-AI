import { MousePointer2, PlayCircle, FileScan } from 'lucide-react';

interface ReadyViewProps {
    onOpenSettings?: () => void;
    onScanPage: () => void;
}

export function ReadyView({ onScanPage }: ReadyViewProps) {
    return (
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto p-5 scroll-smooth h-full">
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

                <button
                    onClick={onScanPage}
                    className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/30 shadow-[0_0_20px_-5px_rgba(255,107,0,0.3)] transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(255,107,0,0.6)] active:scale-95"
                >
                    <FileScan size={40} strokeWidth={1.5} />
                </button>

                <h2 className="mt-5 text-center text-xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                    Sẵn sàng phát
                </h2>
                <p className="mt-2 text-center text-xs text-gray-400 leading-relaxed px-1">
                    Engine loaded. Click above to <span className="text-gray-200 font-medium">scan & read</span> the active tab.
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

            {/* Context Mode Tip */}
            <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-start gap-3 rounded-lg bg-[#1e2124]/40 p-3 border border-white/5 hover:border-primary/20 transition-colors">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a2e33] text-primary">
                        <MousePointer2 size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Context Mode</h3>
                        <p className="mt-1 text-[11px] text-gray-500 leading-relaxed font-body">
                            Bôi đen văn bản và chọn <span className="text-primary font-medium">"Read with Kokoro"</span> từ menu chuột phải để bắt đầu.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Graphic */}
            <div className="mt-auto pt-6 pb-2 opacity-40 flex justify-center items-end flex-1 pointer-events-none">
                <div className="w-full h-12 relative overflow-hidden rounded-lg">
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
