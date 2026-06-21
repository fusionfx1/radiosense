import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Proxy API calls to the FastAPI backend during dev.
    // Set VITE_RADIO_API_BASE_URL="" in .env to use these relative paths,
    // or set it to a full URL to bypass the proxy entirely.
    proxy: {
      "/api": { target: "http://127.0.0.1:8081", changeOrigin: true },
      "/health": { target: "http://127.0.0.1:8081", changeOrigin: true },
    },
  },
})
