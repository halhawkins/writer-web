import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite sometimes needs help treating workspace packages as source (especially TSX). If you hit odd build/import behavior, add this:
  optimizeDeps: {
    include: ['quill', 'quill-delta']
  },
  resolve: {
    preserveSymlinks: true
  }
})
