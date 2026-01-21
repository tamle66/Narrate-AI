import { Play, Pause, RotateCcw, RotateCw, ChevronDown, ArrowLeft } from 'lucide-react';
import { cn } from '../../shared/utils';

interface PlayerViewProps {
    title: string;
    isPlaying: boolean;
    isLoading?: boolean;
    togglePlay: () => void;
    currentTime: number;
    duration: number;
    voice: string;
    speed: number;
    availableVoices: string[];
    onSeek?: (value: number) => void;
    onVoiceChange?: (voice: string) => void;
    onSpeedChange?: (speed: number) => void;
    onBack: () => void;
}

export function PlayerView({
    title, isPlaying, isLoading, togglePlay, currentTime, duration,
    voice, speed, availableVoices,
    onSeek, onVoiceChange, onSpeedChange, onBack
}: PlayerViewProps) {

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex-1 flex flex-col px-5 py-6 overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar h-full">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all active:scale-90"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-widest text-primary/80 font-semibold">Now Reading</span>
                    </div>
                </div>
            </div>
            {/* Marquee Effect container */}
            <div className="relative overflow-hidden h-7 w-full mask-linear-fade group cursor-default">
                <div className="whitespace-nowrap absolute animate-marquee will-change-transform group-hover:pause">
                    <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
                </div>
            </div>
            <p className="text-[10px] text-white/40 mt-1 truncate">Source: local selection</p>

            {/* Visualizer / Artwork */}
            <div className="w-full aspect-square max-h-48 mb-6 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center relative overflow-hidden group mx-auto shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                {/* Glowing Orb */}
                <div className={cn(
                    "w-24 h-24 rounded-full bg-primary/20 blur-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                    isPlaying ? "animate-pulse-glow" : (isLoading ? "animate-spin-slow opacity-50" : "opacity-30")
                )}></div>

                {/* Equalizer Bars */}
                <div className="flex items-end justify-center gap-1 h-16 relative z-10">
                    {[0.8, 1.1, 0.9, 1.2, 0.7, 1.3, 1.0].map((delay, i) => (
                        <div
                            key={i}
                            className={cn("w-1 bg-primary rounded-t-sm", isPlaying ? "animate-equalizer" : "h-[10%] transition-all")}
                            style={{ animationDuration: `${delay}s`, animationPlayState: isPlaying ? 'running' : 'paused' }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* Progress Control */}
            <div className="flex flex-col gap-1.5 mb-8">
                <div className="flex justify-between text-[10px] font-mono text-white/50 tracking-wide">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
                <div className="relative h-1 w-full bg-white/10 rounded-full cursor-pointer group py-1 content-center">
                    <input
                        type="range"
                        min={0}
                        max={duration}
                        value={currentTime}
                        onChange={(e) => onSeek?.(Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
                    />
                    <div className="h-1 w-full bg-white/10 rounded-full absolute top-1/2 -translate-y-1/2"></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-primary rounded-full shadow-[0_0_8px_#ff6b00]"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    ></div>
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between px-2 gap-4 mb-8">
                <button
                    onClick={() => onSeek?.(Math.max(0, currentTime - 10))}
                    className="text-white/60 hover:text-white hover:bg-white/5 p-2 rounded-full transition-all active:scale-95 border border-transparent hover:shadow-neon"
                    title="Rewind 10s"
                >
                    <RotateCcw size={24} />
                </button>
                <button
                    onClick={togglePlay}
                    className="bg-primary text-black p-4 rounded-full shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:shadow-[0_0_30px_rgba(255,107,0,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                <button
                    onClick={() => onSeek?.(Math.min(duration, currentTime + 10))}
                    className="text-white/60 hover:text-white hover:bg-white/5 p-2 rounded-full transition-all active:scale-95 border border-transparent hover:shadow-neon"
                    title="Forward 10s"
                >
                    <RotateCw size={24} />
                </button>
            </div>

            {/* Quick Settings */}
            <div className="grid grid-cols-1 gap-3">
                <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between hover:border-primary/30 hover:bg-white/10 transition-all group relative">
                    <div className="flex flex-col flex-1">
                        <label className="text-[9px] uppercase tracking-wider text-white/40 mb-1">Voice Model</label>
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

                <div className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[9px] uppercase tracking-wider text-white/40">Speed</label>
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
        </div >
    );
}
