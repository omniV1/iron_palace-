import { useState, useEffect } from "react";

export interface YouTubeVideo {
  videoId: string;
  title: string;
  published: string;
  thumbnail: string;
  description: string;
  views: number;
}

export type VideoCategory = "videos" | "shorts" | "live";
export const VIDEO_CATEGORIES: VideoCategory[] = ["videos", "shorts", "live"];

export type YouTubeFeed = Record<VideoCategory, YouTubeVideo[]>;

const EMPTY_FEED: YouTubeFeed = { videos: [], shorts: [], live: [] };

const CACHE_KEY = "ipp_yt_feed_v2";
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/** Live feed first; the build-time snapshot only if the API is down. */
const FEED_URLS = ["/api/feeds/youtube", `${import.meta.env.BASE_URL}youtube-videos.json`];

function sortNewestFirst(videos: YouTubeVideo[] = []): YouTubeVideo[] {
  return [...videos].sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
  );
}

function toFeed(data: FeedResponse, maxResults: number): YouTubeFeed {
  return {
    videos: sortNewestFirst(data.videos).slice(0, maxResults),
    shorts: sortNewestFirst(data.shorts).slice(0, maxResults),
    live: sortNewestFirst(data.live).slice(0, maxResults),
  };
}

const hasAny = (feed: YouTubeFeed) => VIDEO_CATEGORIES.some((c) => feed[c].length > 0);

interface CacheEntry {
  feed: YouTubeFeed;
  timestamp: number;
}

/** Shape of /api/feeds/youtube and the build-time fallback youtube-videos.json */
interface FeedResponse extends Partial<YouTubeFeed> {
  channelId: string;
  fetchedAt: string;
}

function readCache(): YouTubeFeed | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (entry.feed && Date.now() - entry.timestamp < CACHE_TTL) return entry.feed;
  } catch { /* corrupt cache */ }
  return null;
}

function writeCache(feed: YouTubeFeed) {
  try {
    const entry: CacheEntry = { feed, timestamp: Date.now() };
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
  const [feed, setFeed] = useState<YouTubeFeed>(() => readCache() ?? EMPTY_FEED);
  const [loading, setLoading] = useState(() => readCache() === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeed() {
      for (const url of FEED_URLS) {
        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (!res.ok) continue;
          const parsed = toFeed((await res.json()) as FeedResponse, maxResults);
          if (hasAny(parsed)) {
            writeCache(parsed);
            if (!cancelled) {
              setFeed(parsed);
              setError(null);
              setLoading(false);
            }
            return;
          }
        } catch {
          /* try next source */
        }
      }

      // Keep showing cached videos if we have them rather than an error.
      if (readCache() !== null) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) {
        setError("Failed to load videos");
        setLoading(false);
      }
    }

    fetchFeed();
    return () => { cancelled = true; };
  }, [maxResults]);

  return { ...feed, loading, error };
}
