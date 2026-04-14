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
const CACHE_KEY = "ipp_yt_videos";
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface CacheEntry {
  videos: YouTubeVideo[];
  timestamp: number;
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

function parseRSS(xml: string): YouTubeVideo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const entries = doc.querySelectorAll("entry");
  const videos: YouTubeVideo[] = [];

  entries.forEach((entry) => {
    const videoId = entry.querySelector("videoId")?.textContent ?? "";
    const title = entry.querySelector("title")?.textContent ?? "";
    const published = entry.querySelector("published")?.textContent ?? "";
    const thumbnail =
      entry.querySelector("group > thumbnail")?.getAttribute("url") ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const description =
      entry.querySelector("group > description")?.textContent ?? "";
    const viewsStr =
      entry.querySelector("group > community > statistics")?.getAttribute("views") ?? "0";

    videos.push({
      videoId,
      title,
      published,
      thumbnail,
      description,
      views: parseInt(viewsStr, 10),
    });
  });

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

    async function fetchWithTimeout(url: string) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      try {
        return await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    }

    async function fetchVideos() {
      for (const proxy of CORS_PROXIES) {
        if (cancelled) return;
        try {
          const res = await fetchWithTimeout(proxy + encodeURIComponent(RSS_URL));
          if (!res.ok) continue;
          const xml = await res.text();
          if (!xml.includes("<entry>")) continue;
          const parsed = parseRSS(xml);
          if (parsed.length === 0) continue;
          writeCache(parsed);
          if (!cancelled) {
            setVideos(parsed.slice(0, maxResults));
            setError(null);
            setLoading(false);
          }
          return;
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
