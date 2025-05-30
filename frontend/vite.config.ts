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
    host: '0.0.0.0',
    port: 4200,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://api-gateway:3100',
        // target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
