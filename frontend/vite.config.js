import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/_/backend': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/_\/backend/, ''),
        changeOrigin: true,
      },
    },
  },
})
