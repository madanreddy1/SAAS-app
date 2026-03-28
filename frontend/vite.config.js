import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite dev + React Fast Refresh use eval / new Function() for HMR.
// A strict script-src without 'unsafe-eval' breaks the dev server; this header
// only applies to `vite` (not `vite build` output unless you mirror it in prod).
// https://vite.dev/config/server-options.html#server-headers
const devCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:* wss://127.0.0.1:* wss://localhost:* https://fonts.googleapis.com https://fonts.gstatic.com",
].join('; ')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      'Content-Security-Policy': devCsp,
    },
    // Browser talks only to Vite; Vite forwards /api → FastAPI. Same origin = no CORS issues.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8004",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "") || "/",
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
})
