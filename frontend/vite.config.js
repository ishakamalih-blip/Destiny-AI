import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/register': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/analyze': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/analyze-image': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/report': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/stats': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/feedback': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
