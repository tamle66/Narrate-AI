import { RefreshCw, Copy, Info, Zap, Cpu, Terminal, Laptop } from 'lucide-react';
import logo from '../store/logo.png';
import { useState, useEffect } from 'react';
import { cn } from '../../shared/utils';

interface LoadingViewProps {
    status: 'starting' | 'error' | 'stopped' | 'backend_missing' | 'installing';
    onRetry: () => void;
}

interface StepProps {
    number: number;
    title: string;
    description: string;
    command?: string;
    children?: React.ReactNode;
}

function Step({ number, title, description, command, children }: StepProps) {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-2.5 relative pl-8 border-l border-white/5 pb-6 last:pb-2">
            <div className="absolute -left-[10.5px] top-0 w-5 h-5 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary shadow-lg">
                {number}
            </div>
            <div className="space-y-1">
                <h3 className="text-[11px] font-bold text-white/90 uppercase tracking-tight">{title}</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{description}</p>
            </div>
            {command && (
                <div className="bg-black/60 rounded-xl p-3 group relative border border-white/5 font-mono text-[10px] shadow-inner hover:border-primary/20 transition-colors">
                    <code className="text-orange-300/90 leading-relaxed block break-all whitespace-pre-wrap pr-6">
                        {command}
                    </code>
                    <button
                        onClick={() => copyToClipboard(command)}
                        className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-all border border-white/10 opacity-60 group-hover:opacity-100"
                        title="Copy command"
                    >
                        <Copy size={13} className="text-orange-400" />
                    </button>
                </div>
            )}
            {children}
        </div>
    );
}

export function LoadingView({ status, onRetry }: LoadingViewProps) {
    const isError = status === 'error';
    const [os, setOs] = useState<'win' | 'mac'>('win');

    useEffect(() => {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('mac')) {
            setOs('mac');
        } else {
            setOs('win');
        }
    }, []);

    const isMac = os === 'mac';

    return (
        <div className="flex flex-col gap-6 p-5 h-full animate-in fade-in duration-500 bg-[#0d0d0d]">
            {/* Header Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg p-1 bg-white/5 border border-white/10">
                        <img src={logo} className="w-full h-full object-contain" alt="Logo" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white leading-tight uppercase tracking-tighter italic">Kokoro Engine</h1>
                        <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase flex items-center gap-1">
                            <Info size={10} /> Transparency Mode
                        </p>
                    </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[9px] font-bold uppercase tracking-wider ${status === 'starting' || status === 'installing' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 animate-pulse' :
                    isError ? 'bg-error/10 border-error/30 text-error' : 'bg-gray-500/10 border-white/10 text-gray-400'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'starting' || status === 'installing' ? 'bg-orange-500' :
                        isError ? 'bg-error' : 'bg-gray-500'
                        }`} />
                    {status === 'starting' ? 'Connecting' : status.toUpperCase()}
                </div>
            </div>

            {/* Step-by-Step Guide */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase">Setup Guide</div>
                        <div className="h-px w-8 bg-white/5"></div>
                    </div>

                    {/* OS Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 scale-90 origin-right">
                        <button
                            onClick={() => setOs('win')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                                os === 'win' ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <Laptop size={12} /> Windows
                        </button>
                        <button
                            onClick={() => setOs('mac')}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                                os === 'mac' ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <Laptop size={12} /> macOS
                        </button>
                    </div>
                </div>

                <div className="ml-2">
                    <Step
                        number={1}
                        title="Tải mã nguồn (Clone)"
                        description="Tải Kokoro Engine. Lưu ý: Xóa folder .git bên trong sau khi tải để tránh lỗi xung đột Git."
                        command={isMac
                            ? "git clone https://github.com/remsky/Kokoro-FastAPI.git external/kokoro-engine && rm -rf external/kokoro-engine/.git"
                            : "git clone https://github.com/remsky/Kokoro-FastAPI.git external/kokoro-engine; Remove-Item -Recurse -Force external/kokoro-engine/.git"}
                    />

                    <Step
                        number={2}
                        title="Vá lỗi (Patch Dependencies)"
                        description="Loại bỏ thư viện tiếng Nhật gây lỗi biên dịch C++ để ưu tiên tiếng Anh/Việt."
                        command={`cd external/kokoro-engine; python -c "import re; p='pyproject.toml'; c=open(p).read(); open(p,'w').write(re.sub(r'misaki\\[.*?\\\]', 'misaki[en]', c))"`}
                    />

                    <Step
                        number={3}
                        title="Cài đặt môi trường (Sync)"
                        description="Tự động thiết lập môi trường Python và tải Libs AI (mất vài phút)."
                        command="uv sync --no-dev"
                    />

                    <Step
                        number={4}
                        title="Khởi chạy (Start Server)"
                        description={isMac ? "MacOS (M1/M2/M3) tối ưu qua CPU/MPS. NVIDIA GPU không khả dụng." : "Chọn cách chạy dựa trên phần cứng máy bạn:"}
                    >
                        <div className="grid grid-cols-1 gap-2 mt-2">
                            {isMac ? (
                                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 group hover:border-primary/20 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400">
                                            <Zap size={12} /> Apple Silicon (M1/M2/M3)
                                        </div>
                                        <button onClick={() => navigator.clipboard.writeText("uv run python -m kokoro_fastapi.main")} className="p-1 hover:bg-white/10 rounded transition-colors">
                                            <Copy size={12} className="text-gray-500" />
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-gray-500 leading-tight">Mặc định tối ưu hóa cho chip Apple. Xử lý giọng nói rất nhanh.</p>
                                    <code className="text-[10px] text-orange-200/80 bg-black/40 px-2 py-1 rounded block font-mono">uv run python -m kokoro_fastapi.main</code>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 group hover:border-primary/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-orange-400">
                                                <Zap size={12} /> Cách A: Dùng GPU (NVIDIA)
                                            </div>
                                            <button onClick={() => navigator.clipboard.writeText("./start-gpu.ps1")} className="p-1 hover:bg-white/10 rounded transition-colors">
                                                <Copy size={12} className="text-gray-500" />
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-gray-500 leading-tight">Yêu cầu Card NVIDIA. Xử lý cực nhanh, không gây lag máy.</p>
                                        <code className="text-[10px] text-orange-200/80 bg-black/40 px-2 py-1 rounded block font-mono">./start-gpu.ps1</code>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 group hover:border-blue-400/20 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400">
                                                <Cpu size={12} /> Cách B: Dùng CPU
                                            </div>
                                            <button onClick={() => navigator.clipboard.writeText("./start-cpu.ps1")} className="p-1 hover:bg-white/10 rounded transition-colors">
                                                <Copy size={12} className="text-gray-500" />
                                            </button>
                                        </div>
                                        <p className="text-[9px] text-gray-500 leading-tight">Dành cho máy không có card rời. Chậm hơn nhưng ổn định.</p>
                                        <code className="text-[10px] text-blue-200/80 bg-black/40 px-2 py-1 rounded block font-mono">./start-cpu.ps1</code>
                                    </div>
                                </>
                            )}
                        </div>
                    </Step>

                    <Step
                        number={5}
                        title="Tắt Server (Stop Server)"
                        description="Giải phóng bộ nhớ bằng lệnh Terminal:"
                    >
                        <div className="bg-black/60 rounded-xl p-3 group relative border border-white/5 font-mono text-[10px] shadow-inner mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <Terminal size={12} className="text-error" />
                                <span className="text-[9px] text-gray-500 uppercase font-bold">{isMac ? 'Bash/Zsh Command:' : 'PowerShell Command:'}</span>
                            </div>
                            <code className="text-error/80 leading-relaxed block break-all whitespace-pre-wrap pr-6">
                                {isMac ? 'kill -9 $(lsof -t -i:8880)' : 'Stop-Process -Id (Get-NetTCPConnection -LocalPort 8880).OwningProcess -Force'}
                            </code>
                            <button
                                onClick={() => navigator.clipboard.writeText(isMac ? 'kill -9 $(lsof -t -i:8880)' : 'Stop-Process -Id (Get-NetTCPConnection -LocalPort 8880).OwningProcess -Force')}
                                className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-all border border-white/10 opacity-60 group-hover:opacity-100"
                            >
                                <Copy size={13} className="text-error" />
                            </button>
                            <p className="text-[9px] text-gray-600 italic mt-2">Gợi ý: Phím tắt <span className="text-white">Ctrl + C</span> trong Terminal luôn hoạt động để dừng nhanh.</p>
                        </div>
                    </Step>
                </div>
            </div>

            {/* Footer Connection Check */}
            <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-white/5 p-3 rounded-xl border border-white/5 italic leading-relaxed">
                    <Zap size={14} className="text-orange-400 shrink-0" />
                    <span>Mẹo: Sau khi chạy xong Bước 4, hãy <span className="text-white">thu nhỏ (Minimize)</span> Terminal. Đừng đóng hẳn cửa sổ để Server có thể tiếp tục chạy ngầm.</span>
                </div>

                <button
                    onClick={onRetry}
                    className="w-full h-12 flex items-center justify-center gap-3 bg-primary/10 hover:bg-primary border border-primary/20 text-primary hover:text-black rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest outline-none shadow-lg shadow-primary/5"
                >
                    <RefreshCw size={14} />
                    Kiểm tra kết nối ngay
                </button>
            </div>
        </div>
    );
}
