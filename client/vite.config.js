import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3001,
    // 👇 ВАЖНО: сюда добавляем домен, который дал ngrok
    allowedHosts: [
      'https://unlaudatory-corbin-noninfluentially.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5051',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5051',
        changeOrigin: true
      }
    }
  }
})

