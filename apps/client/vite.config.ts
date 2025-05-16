import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {},
    },
  },
});