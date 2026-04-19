# Iron Palace Podcast

A single-page application for the Iron Palace Podcast — "The World's Most Anabolic Podcast."

Built with **Vite** and **React** (TypeScript).

## Prerequisites

- Node.js 20+ (or 22+ for Docker build)

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Before bundling, **`prebuild`** runs a small Node script that fetches your channel’s public YouTube RSS (no browser CORS) and writes `public/youtube-videos.json`. The app loads that file first in production so episode links stay reliable on static hosting. Output is in `dist/` (including `youtube-videos.json`). Serve `dist/` with any static host.

## Docker

Build and run a container that serves the built site (port 80):

```bash
docker build -t iron-palace .
docker run -p 8080:80 iron-palace
```

Then open [http://localhost:8080](http://localhost:8080).

## Project structure

```
├── src/app/          React app
├── index.html
├── vite.config.ts
└── package.json
```
