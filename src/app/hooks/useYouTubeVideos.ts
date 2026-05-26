import { useState, useEffect } from "react";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
  description: string;
  views: number;
}

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

    async function fetchVideos() {
      const applyVideos = (parsed: YouTubeVideo[]) => {
        writeCache(parsed);
        if (!cancelled) {
          setVideos(parsed.slice(0, maxResults));
          setError(null);
          setLoading(false);
        }
      };

      try {
        const jsonUrl = `${import.meta.env.BASE_URL}youtube-videos.json`;
        const res = await fetch(jsonUrl);
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
