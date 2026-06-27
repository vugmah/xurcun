import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'https://xurcun.az', changeOrigin: true },
      '/trpc': { target: 'https://xurcun.az', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  optimizeDeps: {
    include: ["react-router"],
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Force menuData.ts into the index chunk — never create separate menu-data chunk
          // All public consumers now use runtime API, but admin panel still imports menuData.ts
          // This prevents menu-data-BV-CL2F6.js from being generated in production
          if (id.includes('menuData')) return 'index';
          // Let Vite handle all other chunks automatically
        },
      },
    },
  },
});
