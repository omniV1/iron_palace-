/**
 * Shared YouTube feed helpers used by /api/feeds/youtube (runtime) and
 * scripts/fetch-youtube-feed.mjs (build-time fallback snapshot).
 */

export const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";
/**
 * YouTube's auto-generated per-channel playlists, matching the channel's tabs:
 * UULF = Videos, UUSH = Shorts, UULV = Live. They 404 when the channel has none of that kind.
 */
const CHANNEL_SUFFIX = CHANNEL_ID.slice(2);
export const CATEGORY_PLAYLISTS = {
  videos: `UULF${CHANNEL_SUFFIX}`,
  shorts: `UUSH${CHANNEL_SUFFIX}`,
  live: `UULV${CHANNEL_SUFFIX}`,
};
export const CATEGORIES = Object.keys(CATEGORY_PLAYLISTS);
const MAX_PER_CATEGORY = 15;

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

/** Marks a playlist that doesn't exist (the channel has nothing of that kind). */
const EMPTY = Symbol("empty");

/** One playlist's RSS feed (no key needed, but YouTube sometimes blocks cloud IPs). */
async function fetchPlaylistRss(playlistId) {
  const userAgents = [
    BROWSER_HEADERS["User-Agent"],
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  ];
  const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  for (let i = 0; i < userAgents.length; i++) {
    try {
      const res = await fetch(`${url}&_=${Date.now()}`, {
        redirect: "follow",
        cache: "no-store",
        headers: { ...BROWSER_HEADERS, "User-Agent": userAgents[i] },
      });
      if (res.status === 404) return EMPTY;
      if (!res.ok) {
        console.warn(`youtube rss ${playlistId}: attempt ${i + 1} HTTP ${res.status}`);
        continue;
      }
      return parseYouTubeRssXml(await res.text());
    } catch (err) {
      console.warn(`youtube rss ${playlistId}: attempt ${i + 1} error`, err?.message ?? err);
    }
  }
  return null;
}

/** All categories via RSS. Returns null if every feed failed. */
export async function fetchFromRss() {
  const results = await Promise.all(
    CATEGORIES.map((c) => fetchPlaylistRss(CATEGORY_PLAYLISTS[c])),
  );
  if (results.every((r) => r === null)) return null;
  return Object.fromEntries(
    CATEGORIES.map((c, i) => [
      c,
      Array.isArray(results[i]) ? results[i].slice(0, MAX_PER_CATEGORY) : [],
    ]),
  );
}

/** One playlist via the Data API, newest first, with view counts. */
async function fetchPlaylistFromDataApi(apiKey, playlistId) {
  const listUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  listUrl.search = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: "50",
    key: apiKey,
  }).toString();
  const listRes = await fetch(listUrl);
  if (listRes.status === 404) return [];
  if (!listRes.ok) throw new Error(`youtube data api HTTP ${listRes.status}`);
  const items = ((await listRes.json()).items || []).filter(
    (it) => it.snippet?.title !== "Private video" && it.snippet?.title !== "Deleted video",
  );
  if (items.length === 0) return [];

  const views = new Map();
  const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  statsUrl.search = new URLSearchParams({
    part: "statistics",
    id: items.map((it) => it.contentDetails.videoId).join(","),
    key: apiKey,
  }).toString();
  const statsRes = await fetch(statsUrl);
  if (statsRes.ok) {
    for (const v of (await statsRes.json()).items || []) {
      views.set(v.id, Number(v.statistics?.viewCount) || 0);
    }
  }

  const videos = items.map((it) => {
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
  return normalizeVideos(videos).slice(0, MAX_PER_CATEGORY);
}

/** YouTube Data API v3 — used when YOUTUBE_API_KEY is set; reliable from Vercel. */
export async function fetchFromDataApi(apiKey) {
  const lists = await Promise.all(
    CATEGORIES.map((c) => fetchPlaylistFromDataApi(apiKey, CATEGORY_PLAYLISTS[c])),
  );
  return Object.fromEntries(CATEGORIES.map((c, i) => [c, lists[i]]));
}

const hasAny = (feed) => CATEGORIES.some((c) => feed[c].length > 0);

/**
 * Latest uploads split into { videos, shorts, live }. Tries the Data API (if configured),
 * then RSS. Returns null when both fail.
 */
export async function fetchLatestFeed() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const feed = await fetchFromDataApi(apiKey);
      if (hasAny(feed)) return feed;
    } catch (err) {
      console.warn("youtube data api failed, falling back to rss", err?.message ?? err);
    }
  }
  const feed = await fetchFromRss();
  return feed && hasAny(feed) ? feed : null;
}
