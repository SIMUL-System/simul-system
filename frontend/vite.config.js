import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Em desenvolvimento, encaminha as chamadas /api para o Spring Boot.
// Assim, cada computador pode iniciar o front-end sem criar .env.local.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
