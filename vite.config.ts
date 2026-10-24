import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // El único chunk sobre 500 kB es el de three (createScene), que se carga en diferido durante el splash.
    chunkSizeWarningLimit: 600,
  },
})
