import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/dnd-tools/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: ['.ngrok-free.dev'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
