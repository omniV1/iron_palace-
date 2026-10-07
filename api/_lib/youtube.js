/**
 * Shared YouTube feed helpers used by /api/feeds/youtube (runtime) and
 * scripts/fetch-youtube-feed.mjs (build-time fallback snapshot).
 */

export const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";
export const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_ID.slice(2)}`;
/** YouTube's auto-generated "Videos" tab playlist: regular uploads only, no live streams or Shorts. */
export const VIDEOS_PLAYLIST_ID = `UULF${CHANNEL_ID.slice(2)}`;
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${VIDEOS_PLAYLIST_ID}`;

/** Browser-like headers — plain "bot" User-Agents often get 403/404 from YouTube on cloud IPs. */
const BROWSER_HEADERS = {
  Accept: "application/atom+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.youtube.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

function decodeEntities(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Newest first, one entry per video. */
export function normalizeVideos(videos) {
  const seen = new Set();
  return videos
    .filter((v) => v.videoId && !seen.has(v.videoId) && seen.add(v.videoId))
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

/** Parses the channel Atom feed (Atom + YouTube namespaces). */
export function parseYouTubeRssXml(xml) {
  const videos = [];
  const chunks = xml.split("<entry>");
  for (let i = 1; i < chunks.length; i++) {
    const entry = chunks[i].split("</entry>")[0];
    let videoId =
      entry.match(/<yt:videoId>([^<]*)<\/yt:videoId>/i)?.[1]?.trim() ??
      entry.match(/<[^:]*:videoId>([^<]*)<\/[^:]*:videoId>/i)?.[1]?.trim();
    if (!videoId) {
      const idTag = entry.match(/<id>[^<]*:video:([^<]+)<\/id>/i);
      videoId = idTag?.[1]?.trim();
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
      title: decodeEntities(title),
      published,
      thumbnail: thumbUrl,
      description: decodeEntities(description),
      views: Number.isFinite(views) ? views : 0,
    });
  }
  return normalizeVideos(videos);
}

/** Channel RSS feed (no key needed, but YouTube sometimes blocks cloud IPs). */
export async function fetchFromRss() {
  const userAgents = [
    BROWSER_HEADERS["User-Agent"],
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  ];
  for (let i = 0; i < userAgents.length; i++) {
    try {
      const res = await fetch(`${RSS_URL}&_=${Date.now()}`, {
        redirect: "follow",
        cache: "no-store",
        headers: { ...BROWSER_HEADERS, "User-Agent": userAgents[i] },
      });
      if (!res.ok) {
        console.warn(`youtube rss: attempt ${i + 1} HTTP ${res.status}`);
        continue;
      }
      const videos = parseYouTubeRssXml(await res.text());
      if (videos.length > 0) return videos;
      console.warn(`youtube rss: attempt ${i + 1} parsed zero videos`);
    } catch (err) {
      console.warn(`youtube rss: attempt ${i + 1} error`, err?.message ?? err);
    }
  }
  return null;
}

async function fetchPlaylistItems(apiKey, playlistId) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.search = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: "50",
    key: apiKey,
  }).toString();
  return fetch(url);
}

/**
 * YouTube Data API v3 — used when YOUTUBE_API_KEY is set; reliable from Vercel.
 * Reads the channel's "Videos" playlist (no live streams or Shorts), falling back to all
 * uploads, and drops anything YouTube reports as a live stream either way.
 */
export async function fetchFromDataApi(apiKey, maxResults = 15) {
  let listRes = await fetchPlaylistItems(apiKey, VIDEOS_PLAYLIST_ID);
  if (listRes.status === 404) listRes = await fetchPlaylistItems(apiKey, UPLOADS_PLAYLIST_ID);
  if (!listRes.ok) throw new Error(`youtube data api HTTP ${listRes.status}`);
  const list = await listRes.json();
  const items = (list.items || []).filter((it) => it.snippet?.title !== "Private video");
  if (items.length === 0) return [];

  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.search = new URLSearchParams({
    part: "statistics,liveStreamingDetails",
    id: items.map((it) => it.contentDetails.videoId).join(","),
    key: apiKey,
  }).toString();
  const statsRes = await fetch(statsUrl);
  // Without this we can't tell streams apart, so let the caller fall back to RSS.
  if (!statsRes.ok) throw new Error(`youtube data api videos HTTP ${statsRes.status}`);

  const views = new Map();
  const liveIds = new Set();
  for (const v of (await statsRes.json()).items || []) {
    views.set(v.id, Number(v.statistics?.viewCount) || 0);
    // Present on past, current and scheduled live streams.
    if (v.liveStreamingDetails) liveIds.add(v.id);
  }

  const videos = items
    .filter((it) => !liveIds.has(it.contentDetails.videoId))
    .map((it) => {
      const s = it.snippet;
      const videoId = it.contentDetails.videoId;
      return {
        videoId,
        title: s.title,
        published: it.contentDetails.videoPublishedAt || s.publishedAt,
        thumbnail:
          s.thumbnails?.high?.url ||
          s.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        description: s.description || "",
        views: views.get(videoId) ?? 0,
      };
    });
  return normalizeVideos(videos).slice(0, maxResults);
}

/** Tries the Data API (if configured), then RSS. Returns null when both fail. */
export async function fetchLatestVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const videos = await fetchFromDataApi(apiKey);
      if (videos.length > 0) return videos;
    } catch (err) {
      console.warn("youtube data api failed, falling back to rss", err?.message ?? err);
    }
  }
  return fetchFromRss();
}
