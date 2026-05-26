import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'
import { apiDevPlugin } from './scripts/vite-api-dev-plugin.mjs'

export default defineConfig({
  plugins: [
    apiDevPlugin(),
    react(),
    tailwindcss(),
    imagetools(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
