import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [nodePolyfills()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {},
    },
  },
  server: {
    allowedHosts: ['localhost', '.krishdev.xyz', '.weave.krishdev.xyz'], 
  },
});