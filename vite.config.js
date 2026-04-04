import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  // Render Web Service: `npm start` → vite preview must listen on 0.0.0.0:$PORT
  preview: {
    host:         true,
    port:         Number(process.env.PORT) || 4173,
    strictPort:   true,
    allowedHosts: ['cmpt363-frontend.onrender.com'],
  },
})
