import { useState, useEffect } from "react";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
  description: string;
  views: number;
}

const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://corsproxy.io/?url=",
  "https://api.codetabs.com/v1/proxy/?quest=",
  "https://thingproxy.freeboard.io/fetch/",
];
const FETCH_TIMEOUT_MS = 5000;
/** Serverless cold start + YouTube latency */
const SAME_ORIGIN_RSS_TIMEOUT_MS = 20000;
const CACHE_KEY = "ipp_yt_videos";
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  videos: YouTubeVideo[];
  timestamp: number;
}

/** Written by scripts/fetch-youtube-feed.mjs at build time */
interface StaticFeedFile {
  channelId: string;
  fetchedAt: string;
  videos: YouTubeVideo[];
}

function readCache(): YouTubeVideo[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_TTL) return entry.videos;
  } catch { /* corrupt cache */ }
  return null;
}

function writeCache(videos: YouTubeVideo[]) {
  try {
    const entry: CacheEntry = { videos, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* storage full */ }
}

/**
 * Mirrors `scripts/fetch-youtube-feed.mjs` — YouTube Atom uses namespaces (`yt:videoId`,
 * `media:thumbnail`, etc.). DOMParser + querySelector("videoId") misses `yt:videoId`, so
 * RSS fallbacks in the browser returned empty/wrong data while build-time JSON was fine.
 */
function parseYouTubeAtomXml(xml: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  const chunks = xml.split("<entry>");
  for (let i = 1; i < chunks.length; i++) {
    const entry = chunks[i].split("</entry>")[0] ?? "";
    let videoId =
      entry.match(/<yt:videoId>([^<]*)<\/yt:videoId>/i)?.[1]?.trim() ??
      entry.match(/<[^:]*:videoId>([^<]*)<\/[^:]*:videoId>/i)?.[1]?.trim();
    if (!videoId) {
      const idTag = entry.match(/<id>[^<]*:video:([^<]+)<\/id>/i);
      videoId = idTag?.[1]?.trim() ?? "";
    }
    if (!videoId) continue;

    const title =
      entry.match(/<media:title>([^<]*)<\/media:title>/i)?.[1]?.trim() ??
      entry.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ??
      "";

    const published = entry.match(/<published>([^<]*)<\/published>/i)?.[1]?.trim() ?? "";

    const thumbUrl =
      entry.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const description =
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/i)?.[1]?.trim() ?? "";

    const viewsMatch = entry.match(/views="(\d+)"/i);
    const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;

    videos.push({
      videoId,
      title,
      published,
      thumbnail: thumbUrl,
      description,
      views: Number.isFinite(views) ? views : 0,
    });
  }
  return videos;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function useYouTubeVideos(maxResults = 15) {
  const [videos, setVideos] = useState<YouTubeVideo[]>(() => {
    const cached = readCache();
    return cached ? cached.slice(0, maxResults) : [];
  });
  const [loading, setLoading] = useState(() => readCache() === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    }

    async function fetchVideos() {
      const applyVideos = (parsed: YouTubeVideo[]) => {
        writeCache(parsed);
        if (!cancelled) {
          setVideos(parsed.slice(0, maxResults));
          setError(null);
          setLoading(false);
        }
      };

      const tryFetchRss = async (url: string, timeoutMs = FETCH_TIMEOUT_MS) => {
        const res = await fetchWithTimeout(url, timeoutMs);
        if (!res.ok) return false;
        const xml = await res.text();
        if (!xml.includes("<entry>")) return false;
        const parsed = parseYouTubeAtomXml(xml);
        if (parsed.length === 0) return false;
        applyVideos(parsed);
        return true;
      };

      // 1) Built-in snapshot (reliable in production — generated during npm run build)
      if (cancelled) return;
      try {
        const jsonUrl = `${import.meta.env.BASE_URL}youtube-videos.json`;
        const res = await fetchWithTimeout(jsonUrl);
        if (res.ok) {
          const data = (await res.json()) as StaticFeedFile;
          if (Array.isArray(data.videos) && data.videos.length > 0) {
            applyVideos(data.videos);
            return;
          }
        }
      } catch {
        /* fall through */
      }

      // 2) Same-origin RSS proxy (Vite dev server + Vercel `api/youtube-feed.js` — no browser CORS)
      if (cancelled) return;
      try {
        const sameOriginRssUrl = `${import.meta.env.BASE_URL}api/youtube-feed`;
        if (await tryFetchRss(sameOriginRssUrl, SAME_ORIGIN_RSS_TIMEOUT_MS)) return;
      } catch {
        /* fall through */
      }

      // 3) Public CORS proxies (fallback e.g. dev without prior build, or old deploys)
      for (const proxy of CORS_PROXIES) {
        if (cancelled) return;
        try {
          if (await tryFetchRss(proxy + encodeURIComponent(RSS_URL))) return;
        } catch {
          continue;
        }
      }
      if (!cancelled) {
        setError("Failed to load videos");
        setLoading(false);
      }
    }

    fetchVideos();
    return () => { cancelled = true; };
  }, [maxResults]);

  return { videos, loading, error };
}
