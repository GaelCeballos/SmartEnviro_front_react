import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simula un navegador en la terminal
    globals: true         // Te permite usar describe, it, expect sin importarlos cada vez
  }
})