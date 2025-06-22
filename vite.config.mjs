import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {nodePolyfills} from 'vite-plugin-node-polyfills'

export default defineConfig({
  base:'/DripX/',
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      process: 'process/browser',
    },
  },
  define: {
    'process.env': {},
  },
})
