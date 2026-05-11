import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/upload': 'http://localhost:8000',
      '/webhook': 'http://localhost:8000',
      '/schedule': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
