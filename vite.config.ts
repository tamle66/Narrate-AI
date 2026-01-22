import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'
import path from 'path'

const manifest = defineManifest({
  manifest_version: 3,
  name: "Narrate AI",
  version: "1.0.0",
  description: "High-quality Local Neural TTS for your browser",
  permissions: [
    "activeTab",
    "contextMenus",
    "storage",
    "sidePanel",
    "nativeMessaging",
    "scripting"
  ],
  host_permissions: [
    "http://localhost:8880/*",
    "<all_urls>"
  ],
  side_panel: {
    "default_path": "src/sidepanel/index.html"
  },
  background: {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  content_scripts: [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"]
    }
  ],
  icons: {
    "16": "src/assets/logo.png",
    "48": "src/assets/logo.png",
    "128": "src/assets/logo.png"
  },
  action: {
    "default_title": "Open Narrate AI",
    "default_icon": {
      "16": "src/assets/logo.png",
      "48": "src/assets/logo.png",
      "128": "src/assets/logo.png"
    }
  }
})

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
