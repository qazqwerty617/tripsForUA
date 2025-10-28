import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // 👇 ВАЖНО: сюда добавляем домен, который дал ngrok
    allowedHosts: [
      'https://unlaudatory-corbin-noninfluentially.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true
      }
    }
  }
})

