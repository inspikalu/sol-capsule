import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'os', 'events', 'path', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add these browser-compatible alternatives
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      util: 'util',
    },
  },
  define: {
    'process.env': {},
    'process.env.BROWSER': true,
    'process.env.NODE_DEBUG': false,
    global: {},
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      supported: {
        bigint: true
      },
    }
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      // Explicitly mark problematic Node.js modules as external
      external: ['fs', 'path', 'os'],
    },
  }
})