/**
 * Shared YouTube feed helpers used by /api/feeds/youtube (runtime) and
 * scripts/fetch-youtube-feed.mjs (build-time fallback snapshot).
 */

export const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";
const CHANNEL_SUFFIX = CHANNEL_ID.slice(2);
/** Every upload: regular videos, Shorts and live streams together. */
const UPLOADS_PLAYLIST_ID = `UU${CHANNEL_SUFFIX}`;
/**
 * YouTube's auto-generated per-tab playlists (UUSH = Shorts, UULV = Live). Not every
 * channel serves them, so they are only used as hints when classifying uploads.
 */
const SHORTS_PLAYLIST_ID = `UUSH${CHANNEL_SUFFIX}`;
const LIVE_PLAYLIST_ID = `UULV${CHANNEL_SUFFIX}`;

export const CATEGORIES = ["videos", "shorts", "live"];
const MAX_PER_CATEGORY = 15;
/** YouTube allows Shorts up to 3 minutes; used only when the Shorts playlist is unavailable. */
const SHORTS_MAX_SECONDS = 180;

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

    const isShortLink = /<link[^>]*href="[^"]*\/shorts\//i.test(entry);

    const viewsMatch = entry.match(/views="(\d+)"/i);
    const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;

    videos.push({
      videoId,
      title: decodeEntities(title),
      published,
      thumbnail: thumbUrl,
      description: decodeEntities(description),
      views: Number.isFinite(views) ? views : 0,
      isShortLink,
    });
  }
  return normalizeVideos(videos);
}

const strip = ({ isShortLink, ...video }) => video;

/** Splits uploads into the three tabs, newest first. */
function categorize(uploads, isLive, isShort) {
  const feed = { videos: [], shorts: [], live: [] };
  for (const video of normalizeVideos(uploads)) {
    const category = isLive(video) ? "live" : isShort(video) ? "shorts" : "videos";
    if (feed[category].length < MAX_PER_CATEGORY) feed[category].push(strip(video));
  }
  return feed;
}

async function fetchRss(query) {
  const userAgents = [
    BROWSER_HEADERS["User-Agent"],
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  ];
  const url = `https://www.youtube.com/feeds/videos.xml?${query}`;
  for (let i = 0; i < userAgents.length; i++) {
    try {
      const res = await fetch(`${url}&_=${Date.now()}`, {
        redirect: "follow",
        cache: "no-store",
        headers: { ...BROWSER_HEADERS, "User-Agent": userAgents[i] },
      });
      if (res.status === 404) return [];
      if (!res.ok) {
        console.warn(`youtube rss ${query}: attempt ${i + 1} HTTP ${res.status}`);
        continue;
      }
      return parseYouTubeRssXml(await res.text());
    } catch (err) {
      console.warn(`youtube rss ${query}: attempt ${i + 1} error`, err?.message ?? err);
    }
  }
  return null;
}

/**
 * RSS fallback (no key needed, but YouTube sometimes blocks cloud IPs). The channel feed
 * links Shorts as /shorts/ URLs; live streams are recognised via the Live playlist feed.
 */
export async function fetchFromRss() {
  const [uploads, live, shorts] = await Promise.all([
    fetchRss(`channel_id=${CHANNEL_ID}`),
    fetchRss(`playlist_id=${LIVE_PLAYLIST_ID}`),
    fetchRss(`playlist_id=${SHORTS_PLAYLIST_ID}`),
  ]);
  if (!uploads) return null;
  const liveIds = new Set((live || []).map((v) => v.videoId));
  const shortIds = new Set((shorts || []).map((v) => v.videoId));
  return categorize(
    uploads,
    (v) => liveIds.has(v.videoId),
    (v) => v.isShortLink || shortIds.has(v.videoId),
  );
}

function dataApiUrl(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  url.search = new URLSearchParams(params).toString();
  return url;
}

/** Video ids in a playlist, or null if YouTube won't serve it. */
async function fetchPlaylistIds(apiKey, playlistId) {
  try {
    const res = await fetch(
      dataApiUrl("playlistItems", { part: "contentDetails", playlistId, maxResults: "50", key: apiKey }),
    );
    if (!res.ok) return null;
    return new Set(((await res.json()).items || []).map((it) => it.contentDetails.videoId));
  } catch {
    return null;
  }
}

/** ISO 8601 duration (e.g. PT1M5S) to seconds. */
function durationSeconds(iso = "") {
  const m = iso.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  const [, d = 0, h = 0, min = 0, sec = 0] = m.map((n) => Number(n) || 0);
  return d * 86400 + h * 3600 + min * 60 + sec;
}

/**
 * YouTube Data API v3 — used when YOUTUBE_API_KEY is set; reliable from Vercel.
 * Reads the latest 50 uploads and sorts each into a tab: anything with live-stream
 * details is a livestream; Shorts are anything a minute or shorter, plus whatever the
 * Shorts playlist lists when YouTube serves it (otherwise anything 3 minutes or shorter).
 */
export async function fetchFromDataApi(apiKey) {
  const [listRes, shortIds] = await Promise.all([
    fetch(
      dataApiUrl("playlistItems", {
        part: "snippet,contentDetails",
        playlistId: UPLOADS_PLAYLIST_ID,
        maxResults: "50",
        key: apiKey,
      }),
    ),
    fetchPlaylistIds(apiKey, SHORTS_PLAYLIST_ID),
  ]);
  if (!listRes.ok) throw new Error(`youtube data api HTTP ${listRes.status}`);
  const items = ((await listRes.json()).items || []).filter(
    (it) => it.snippet?.title !== "Private video" && it.snippet?.title !== "Deleted video",
  );
  if (items.length === 0) return categorize([], () => false, () => false);

  const detailsRes = await fetch(
    dataApiUrl("videos", {
      part: "statistics,contentDetails,liveStreamingDetails",
      id: items.map((it) => it.contentDetails.videoId).join(","),
      key: apiKey,
    }),
  );
  // Without details we can't tell streams apart, so let the caller fall back to RSS.
  if (!detailsRes.ok) throw new Error(`youtube data api videos HTTP ${detailsRes.status}`);
  const details = new Map(((await detailsRes.json()).items || []).map((v) => [v.id, v]));

  const uploads = items.map((it) => {
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
      views: Number(details.get(videoId)?.statistics?.viewCount) || 0,
    };
  });

  const useShortsPlaylist = shortIds !== null && shortIds.size > 0;
  return categorize(
    uploads,
    (v) => Boolean(details.get(v.videoId)?.liveStreamingDetails),
    (v) => {
      const secs = durationSeconds(details.get(v.videoId)?.contentDetails?.duration);
      if (secs > 0 && secs <= 60) return true;
      if (useShortsPlaylist) return shortIds.has(v.videoId);
      return secs > 0 && secs <= SHORTS_MAX_SECONDS;
    },
  );
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
