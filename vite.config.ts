import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

/** Same channel as `CHANNEL_ID` in `src/app/hooks/useYouTubeVideos.ts` */
const YOUTUBE_CHANNEL_ID = 'UC9tV0Z2xN1HtvQu5F-ERqpg'

const youtubeRssProxy = {
  '/api/youtube-feed': {
    target: 'https://www.youtube.com',
    changeOrigin: true,
    secure: true,
    rewrite: () =>
      `/feeds/videos.xml?channel_id=${encodeURIComponent(YOUTUBE_CHANNEL_ID)}`,
  },
} as const

export default defineConfig({
  plugins: [
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
  // Dev / preview: fetch RSS same-origin (no CORS). Production static hosts fall through to public proxies in the hook.
  server: {
    proxy: { ...youtubeRssProxy },
  },
  preview: {
    proxy: { ...youtubeRssProxy },
  },
})
