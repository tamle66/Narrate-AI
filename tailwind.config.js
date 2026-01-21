/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#ff6b00", // Vibrant Orange from mockup
                "primary-glow": "#ff9500",
                "background-light": "#f4f5f6",
                "background-dark": "#101214", // Deep, darker base
                "glass-dark": "rgba(20, 20, 22, 0.85)",
                "surface-dark": "#1e2124",
                "error": "#FF5252",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"],
                "mono": ["monospace"], // fallback
            },
            boxShadow: {
                "neon": "0 0 10px rgba(255, 107, 0, 0.3), 0 0 20px rgba(255, 107, 0, 0.1)",
                "inner-glow": "inset 0 0 20px rgba(255, 107, 0, 0.05)",
            },
            backgroundImage: {
                "grid-pattern": "linear-gradient(to right, #2a2e33 1px, transparent 1px), linear-gradient(to bottom, #2a2e33 1px, transparent 1px)",
            },
            animation: {
                'marquee': 'marquee 20s linear infinite',
                'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'equalizer': 'equalizer 1s ease-in-out infinite alternate',
                'scan': 'scan 2s linear infinite',
                'spin-slow': 'spin 3s linear infinite',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' }
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: 1, boxShadow: '0 0 10px rgba(255, 107, 0, 0.2)' },
                    '50%': { opacity: .7, boxShadow: '0 0 20px rgba(255, 107, 0, 0.5)' },
                },
                equalizer: {
                    '0%': { height: '20%' },
                    '100%': { height: '100%' }
                },
                scan: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                }
            }
        },
    },
    plugins: [require("tailwindcss-animate")],
}
