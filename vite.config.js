import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('/react/')
          ) {
            return 'react-core'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          if (
            id.includes('axios') ||
            id.includes('react-hot-toast') ||
            id.includes('zod')
          ) {
            return 'app-vendor'
          }
        },
      },
    },
  },
})
