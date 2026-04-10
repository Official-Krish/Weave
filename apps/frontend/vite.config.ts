import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
  proxy: {
    '/jitsi/http-bind': {
      target: process.env.VITE_PUBLIC_JITSI_URL || 'https://localhost:8443',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/jitsi/, ''),
    },
    '/jitsi': {
      target: process.env.VITE_PUBLIC_JITSI_URL || 'https://localhost:8443',
      changeOrigin: true,
      secure: false,          
      rewrite: (path) => path.replace(/^\/jitsi/, ''),
    },
  },
},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "../../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(
        __dirname,
        "../../node_modules/react/jsx-runtime.js"
      ),
      "react/jsx-dev-runtime": path.resolve(
        __dirname,
        "../../node_modules/react/jsx-dev-runtime.js"
      ),
    },
  },
})
