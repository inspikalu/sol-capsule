import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    }),
    nodePolyfills({
      include: ['buffer', 'os', 'path', 'stream', 'util', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
    {
      name: 'fs-shim',
      enforce: 'pre',
      resolveId(id) {
        if (id === 'fs') return '\0virtual:fs'
      },
      load(id) {
        if (id === '\0virtual:fs') {
          return `
            export const readFileSync = () => { throw new Error('File system operations not supported in browser') }
            export const writeFileSync = () => { throw new Error('File system operations not supported in browser') }
            export const existsSync = () => false
            export const homedir = () => '/'
            export default { readFileSync, writeFileSync, existsSync, homedir }
          `
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
})