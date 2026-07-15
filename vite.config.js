import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simula un navegador en la terminal
    globals: true         // Te permite usar describe, it, expect sin importarlos cada vez
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://254f-200-56-155-6.ngrok-free.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})